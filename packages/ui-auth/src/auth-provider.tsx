import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { LoginGate } from './login-gate'
import { AUTH_REQUEST_STATE_ID, useAuthStore } from './store'

/**
 * Wickelt die App mit dem Auth-Zustand:
 * - Hydratisiert die Session beim Mounten (client-seitig).
 * - Rendert bei geschützten Routen (Auth-Guard) ohne gültige Session
 *   das LoginGate statt des Inhalts – die URL bleibt unverändert.
 *
 * SSR-Handoff: Der Server hinterlegt den Gate-Zustand als JSON in
 * einem unsichtbaren <template data-state>-Element; der Client
 * übernimmt ihn beim Laden (siehe store.ts). Dadurch rendern Server
 * und Client beim Hydrieren dasselbe – ohne kurzen Einblick in
 * geschützten Inhalt.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const loginRequired = useAuthStore((state) => state.loginRequired)
  const pendingTarget = useAuthStore((state) => state.pendingTarget)
  const refresh = useAuthStore((state) => state.refresh)

  // Session beim Mounten prüfen – auch direkt nach der Rückkehr vom
  // Google-OAuth-Redirect (vollständiger Seitenwechsel).
  useEffect(() => {
    void refresh()
  }, [refresh])

  // WICHTIG (SSR): beforeLoad setzt loginRequired erst während
  // router.load() – also NACH dem ersten Server-Render-Pass. Beim
  // Server-Rendering sind useSyncExternalStore-Selektoren ab diesem
  // ersten Pass eingefroren und liefern veraltete Werte. Für den
  // Server daher den Store direkt über getState() lesen; im Client
  // bleiben die reaktiven Selectoren aktiv (Gate schließt sich nach
  // dem Login ohne Reload).
  const isSsr = typeof window === 'undefined'
  const currentLoginRequired = isSsr
    ? useAuthStore.getState().loginRequired
    : loginRequired
  const currentUser = isSsr ? useAuthStore.getState().user : user
  const currentPendingTarget = isSsr
    ? useAuthStore.getState().pendingTarget
    : pendingTarget
  const locked = currentLoginRequired && !currentUser

  return (
    <>
      {locked && (
        <template
          id={AUTH_REQUEST_STATE_ID}
          data-state={JSON.stringify({
            loginRequired: currentLoginRequired,
            pendingTarget: currentPendingTarget,
          })}
        />
      )}
      {locked ? <LoginGate /> : children}
    </>
  )
}