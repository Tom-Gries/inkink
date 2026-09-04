import {
  authClient,
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

    try {
      const { data } = await authClient.getSession()
      const user = data?.user ? toAuthUser(data.user) : null

      if (user) {
        // Profil (eigenes Benutzername-Feld) best effort nachladen;
        // ein Profil-Fehler darf die Session nicht als ungültig werten.
        try {
          const profile = await getProfile(getApiClient())
          user.username = profile?.username ?? null
        } catch {
          user.username = null
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
            } catch {
              // Speicher-Fehler – Session trotzdem gültig.
            }
          }
        }

        set({ user, status: 'authenticated', loginRequired: false })
      } else {
        set({ user: null, status: 'unauthenticated' })
      }

      return Boolean(user)
    } catch (error) {
      set({
        user: null,
        status: 'unauthenticated',
        error:
          error instanceof Error
            ? error.message
            : 'Session konnte nicht geladen werden.',
      })

      return false
    }
  },

  signInWithGoogle: async (callbackURL) => {
    await authClient.signIn.social({
      provider: 'google',
      // Absolut auf die Web-App zeigen (lokal: http://localhost:3000,
      // in Produktion: die echte App-Domain). Bei Cross-Origin baut
      // Better Auth den callbackURL sonst auf der API-Base-URL auf.
      callbackURL: callbackURL ?? window.location.origin,
    })
  },

  updateUsername: async (username) => {
    await updateProfileUsername(getApiClient(), username)

    const current = get().user
    if (current) {
      set({ user: { ...current, username } })
    }
  },

  signOut: async () => {
    await authClient.signOut()
    set({ user: null, status: 'unauthenticated' })
  },

  clear: () =>
    set({
      user: null,
      status: 'unauthenticated',
      error: null,
      loginRequired: false,
      pendingTarget: null,
    }),

  requireLogin: (targetHref) =>
    set({ loginRequired: true, pendingTarget: targetHref }),

  clearLoginRequired: () => set({ loginRequired: false, pendingTarget: null }),

  resetRequestState: () => set({ loginRequired: false, pendingTarget: null }),
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
      }
    } catch {
      // Nicht interpretierbar – Store startet ohne SSR-Zustand.
    }
  }
}
