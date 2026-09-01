import { createInkInkRouter } from '@inkink/routing'
import { inks } from './inks'
import { Route as rootRoute } from './routes/__root'

export function getRouter() {
  return createInkInkRouter(rootRoute, inks)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}