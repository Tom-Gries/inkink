import { isAuthenticated } from '@inkink/api'
import { createInkRouter } from '@inkink/routing'
import { useAuthStore } from '@inkink/ui-auth'
import { inks } from './inks'
import { Route as rootRoute } from './routes/__root'

export function getRouter() {
  // Auf dem Server: Request-relevante Auth-Flags zurücksetzen, damit
  // kein Zustand zwischen SSR-Requests leakt.
  if (typeof document === 'undefined') {
    useAuthStore.getState().resetRequestState()
  }

  return createInkRouter(rootRoute, inks, {
    isAuthenticated,

    // Der Auth-Guard meldet geschützte Routen ohne gültige Session;
    // der AuthProvider (@inkink/ui-auth) zeigt dann das LoginGate – die
    // URL bleibt unverändert.
    onAuthRequired: (targetHref) => {
      useAuthStore.getState().requireLogin(targetHref)
    },
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
