import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { createInkInkRoutes } from '@inkink/routing'
import { Route as rootRoute } from './routes/__root'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree: rootRoute.addChildren(createInkInkRoutes(rootRoute)),
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
