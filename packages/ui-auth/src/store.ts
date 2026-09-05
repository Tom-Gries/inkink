import {
  authClient,
  authError,
  authLog,
  authWarn,
  getApiClient,
  getProfile,
  updateProfileUsername,
} from '@inkink/api'
import { create } from 'zustand'

/** Schlanker Benutzer-Stand aus der Better-Auth-Session. */
export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  image?: string | null
  /** Eigener Benutzername aus der App-"profile"-Collection (nullable). */
  username: string | null
}

/** Lade-/Anmeldestatus der Session im Store. */
export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

/** ID des unsichtbaren <template>-Elements, das den Auth-Gate-Zustand an den Client überträgt. */
export const AUTH_REQUEST_STATE_ID = 'inkink-auth-request-state'

type SessionUser = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>['data']
>['user']

function toAuthUser(user: SessionUser): AuthUser {
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    username: null,
  }
}

interface AuthState {
  /** Aktueller Benutzer bzw. null, wenn nicht angemeldet. */
  user: AuthUser | null

  /** Lade-/Anmeldestatus der Session. */
  status: AuthStatus

  /** Letzter Fehler beim Session-Abruf (z. B. API nicht erreichbar). */
  error: string | null

  /**
   * true, wenn eine geschützte Route ohne gültige Session geöffnet
   * wurde (vom Auth-Guard gemeldet). Solange dieses Flag gesetzt ist
   * und kein Benutzer vorliegt, zeigt der AuthProvider das LoginGate.
   */
  loginRequired: boolean

  /**
   * URL, die ursprünglich angefordert wurde – als Ziel für den
   * Google-login (callbackURL), damit man nach der Anmeldung wieder
   * auf der gewünschten Seite landet.
   */
  pendingTarget: string | null

  /**
   * Liest die Session neu vom Server und aktualisiert den Store.
   *
   * Fail-closed: Bei fehlender/ungültiger Session oder einem Fehler
   * (z. B. API nicht erreichbar) wird der Store auf
   * „unauthenticated" gesetzt – niemals als authentifiziert
   * interpretiert. Bei gültiger Session wird loginRequired geleert
   * (das LoginGate schließt sich).
   */
  refresh: () => Promise<boolean>

  /** Startet den Google-OAuth-Flow (Browser-Redirect). */
  signInWithGoogle: (callbackURL?: string) => Promise<void>

  /**
   * Setzt den Benutzernamen des angemeldeten Nutzers (PATCH an die
   * Profil-API). Aktualisiert den Store bei Erfolg; wirft bei
   * Konflikt (vergebener Name).
   */
  updateUsername: (username: string) => Promise<void>

  /** Meldet den Benutzer ab und leert den Store. */
  signOut: () => Promise<void>

  /** Leert den Store ohne Serveraufruf. */
  clear: () => void

  /**
   * Meldet, dass eine geschützte Route ohne gültige Session geöffnet
   * wurde (vom Router-Guard über onAuthRequired aufgerufen).
   */
  requireLogin: (targetHref: string) => void

  /**
   * Setzt das Login-Required-Flag zurück (z. B. wenn eine öffentliche
   * Route ohne gültige Session geöffnet wird) – das LoginGate kann so
   * nicht auf öffentlichen Seiten hängen bleiben. Bewusst schmal
   * gehalten, anders als resetRequestState (Server-spezifisch).
   */
  clearLoginRequired: () => void

  /**
   * Setzt die request-relevanten Auth-Flags zurück (Server: Beginn
   * jedes SSR-Requests, damit kein Zustand zwischen Requests leakt).
   */
  resetRequestState: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  status: 'idle',
  error: null,
  loginRequired: false,
  pendingTarget: null,

  refresh: async () => {
    set({ status: 'loading', error: null })
    authLog('store.refresh', 'Session-Check gestartet')

    try {
      const result = await authClient.getSession()
      const { data, error: sessionError } = result
      const user = data?.user ? toAuthUser(data.user) : null

      if (sessionError) {
        authWarn(
          'store.refresh',
          'authClient.getSession meldet einen Fehler (wird als „nicht authentifiziert" gewertet)',
          sessionError,
        )
      }

      if (user) {
        authLog('store.refresh', `Session gültig (user=${user.id})`)

        // Profil (eigenes Benutzername-Feld) best effort nachladen;
        // ein Profil-Fehler darf die Session nicht als ungültig werten.
        try {
          const profile = await getProfile(getApiClient())
          user.username = profile?.username ?? null
          authLog(
            'store.refresh',
            `Profil geladen (username=${user.username ?? '(keiner)'})`,
          )
        } catch (error) {
          user.username = null
          authWarn(
            'store.refresh',
            'Profil konnte nicht geladen werden – Session bleibt gültig',
            error,
          )
        }

        // Fallback „Name als Benutzername" (erster Google-Login):
        // Solange noch KEIN eigener Benutzername vergeben ist, wird der
        // vollständige Anzeigename (bei Google z. B. "Tom Gries") einmalig
        // über die Profil-API gespeichert. Fehler sind hier nicht
        // kritisch – der Nutzer kann ihn später ändern.
        if (!user.username) {
          const fullName = user.name?.trim()
          if (fullName) {
            try {
              await updateProfileUsername(getApiClient(), fullName)
              user.username = fullName
              authLog(
                'store.refresh',
                `Erstanmeldung: Anzeigename als Benutzername gespeichert ("${fullName}")`,
              )
            } catch (error) {
              authWarn(
                'store.refresh',
                'Benutzername konnte nicht gespeichert werden – nicht kritisch',
                error,
              )
            }
          }
        }

        set({ user, status: 'authenticated', loginRequired: false })
        authLog(
          'store.refresh',
          'Status → authenticated (LoginGate schließt sich)',
        )
        return true
      }

      set({ user: null, status: 'unauthenticated' })
      authLog('store.refresh', 'Keine gültige Session → Status unauthenticated')
      return false
    } catch (error) {
      set({
        user: null,
        status: 'unauthenticated',
        error:
          error instanceof Error
            ? error.message
            : 'Session konnte nicht geladen werden.',
      })
      authError(
        'store.refresh',
        'Session-Request fehlgeschlagen (fail-closed → unauthenticated)',
        error,
      )
      return false
    }
  },

  signInWithGoogle: async (callbackURL) => {
    const target = callbackURL ?? window.location.origin
    authLog(
      'store.signInWithGoogle',
      `Google-Login gestartet (provider=google, callbackURL=${target})`,
    )

    try {
      await authClient.signIn.social({
        provider: 'google',
        // Absolut auf die Web-App zeigen (lokal: http://localhost:3000,
        // in Produktion: die echte App-Domain). Bei Cross-Origin baut
        // Better Auth den callbackURL sonst auf der API-Base-URL auf.
        callbackURL: target,
      })
      authLog(
        'store.signInWithGoogle',
        'Google-Login: Redirect zum Provider ausgelöst',
      )
    } catch (error) {
      authError('store.signInWithGoogle', 'Google-Login fehlgeschlagen', error)
      throw error
    }
  },

  updateUsername: async (username) => {
    await updateProfileUsername(getApiClient(), username)

    const current = get().user
    if (current) {
      set({ user: { ...current, username } })
    }
  },

  signOut: async () => {
    authLog('store.signOut', 'Sign-Out gestartet')

    try {
      await authClient.signOut()
      set({ user: null, status: 'unauthenticated' })
      authLog('store.signOut', 'Sign-Out abgeschlossen')
    } catch (error) {
      authError('store.signOut', 'Sign-Out fehlgeschlagen', error)
      throw error
    }
  },

  clear: () =>
    set({
      user: null,
      status: 'unauthenticated',
      error: null,
      loginRequired: false,
      pendingTarget: null,
    }),

  requireLogin: (targetHref) => {
    authLog('store.requireLogin', `loginRequired=true (Ziel=${targetHref})`)
    set({ loginRequired: true, pendingTarget: targetHref })
  },

  clearLoginRequired: () => {
    authLog(
      'store.clearLoginRequired',
      'loginRequired=false (öffentliche Route)',
    )
    set({ loginRequired: false, pendingTarget: null })
  },

  resetRequestState: () => {
    authLog(
      'store.resetRequestState',
      'SSR: request-relevante Flags zurückgesetzt',
    )
    set({ loginRequired: false, pendingTarget: null })
  },
}))

// Client-seitig: Der Server hinterlegt beim SSR den Gate-Zustand als
// JSON in einem unsichtbaren <template data-state> (siehe AuthProvider).
// Der Client übernimmt ihn beim Laden, damit er beim Hydrieren sofort
// dasselbe rendert wie der Server (kein kurzer Einblick in geschützten
// Inhalt, keine URL-Änderung).
if (typeof document !== 'undefined') {
  const element = document.getElementById(AUTH_REQUEST_STATE_ID)

  if (element) {
    try {
      const parsed = JSON.parse(
        element.getAttribute('data-state') ?? 'null',
      ) as {
        loginRequired?: boolean
        pendingTarget?: string | null
      } | null

      if (parsed && typeof parsed.loginRequired === 'boolean') {
        useAuthStore.setState({
          loginRequired: parsed.loginRequired,
          pendingTarget:
            typeof parsed.pendingTarget === 'string'
              ? parsed.pendingTarget
              : null,
        })
        authLog(
          'store.hydrate',
          `SSR-Gate-Zustand übernommen (loginRequired=${parsed.loginRequired}, pendingTarget=${parsed.pendingTarget ?? '(keins)'})`,
        )
      }
    } catch (error) {
      authWarn(
        'store.hydrate',
        'SSR-Zustand nicht interpretierbar – Store startet ohne Gate-Zustand',
        error,
      )
    }
  }
}
