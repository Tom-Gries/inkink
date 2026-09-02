import { isAuthenticated } from '@inkink/api'
import { createInkRouter } from '@inkink/routing'
import { inks } from './inks'
import { Route as rootRoute } from './routes/__root'

export function getRouter() {
  return createInkRouter(rootRoute, inks, {
    isAuthenticated,
    loginPath: '/',
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}