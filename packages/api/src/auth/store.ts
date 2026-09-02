import { create } from 'zustand'
import { authClient } from './client'

/** Schlanker Benutzer-Stand aus der Better-Auth-Session. */
export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  image?: string | null
}

/** Lade-/Anmeldestatus der Session im Store. */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

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
   * Setzt die request-relevanten Auth-Flags zurück (Server: Beginn
   * jedes SSR-Requests, damit kein Zustand zwischen Requests leakt).
   */
  resetRequestState: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
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