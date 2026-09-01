import { createInkInkRouter } from '@inkink/routing'
import { Route as rootRoute } from './routes/__root'

export function getRouter() {
  return createInkInkRouter(rootRoute)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
