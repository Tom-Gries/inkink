import { isAuthenticated } from './api/index'
import { inks } from './inks'
import { Route as rootRoute } from './routes/__root'
import { createInkRouter } from './routing/index'
import { useAuthStore } from './ui-auth/index'

export function getRouter() {
  return createInkRouter(rootRoute, inks, {
    isAuthenticated,

    // Der Auth-Guard meldet geschützte Routen ohne gültige Session;
    // der AuthProvider (src/ui-auth) zeigt dann das LoginGate – die
    // URL bleibt unverändert.
    onAuthRequired: (targetHref) => {
      useAuthStore.getState().requireLogin(targetHref)
    },

    // Öffentliche Route erreicht (z. B. "/" oder "/settink"): Das
    // LoginGate-Flag zurücksetzen, damit es nicht hängen bleibt.
    onPublicRoute: () => {
      useAuthStore.getState().clearLoginRequired()
    },
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
