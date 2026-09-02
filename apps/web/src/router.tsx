import { authClient } from '@inkink/api'
import { createInkRouter } from '@inkink/routing'
import { inks } from './inks'
import { Route as rootRoute } from './routes/__root'

export function getRouter() {
  return createInkRouter(rootRoute, inks, {
    isAuthenticated: async () => {
      const { data } = await authClient.getSession()

      return Boolean(data?.user)
    },

    loginPath: '/',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}