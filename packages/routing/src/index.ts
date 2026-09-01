import type { Definition } from '@inkink/core'
import {
  createRoute,
  createRouter,
  type AnyRoute,
} from '@tanstack/react-router'
import { ErrorView } from './views/error'
import { HomeView } from './views/home'
import { NotFoundView } from './views/not-found'

export { translations } from './translations'

function createInkRoutes<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
  inks: Array<Definition>,
) {
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: HomeView,
  })

  const errorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/error',
    component: ErrorView,
  })

  return [
    indexRoute,
    errorRoute,
    ...inks.flatMap((ink) =>
      ink.routes.map(({ path, component }) =>
        createRoute({
          getParentRoute: () => rootRoute,
          path,
          component,
        }),
      ),
    ),
  ]
}

export function createInkRouter<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
  inks: Array<Definition>,
) {
  return createRouter({
    routeTree: rootRoute.addChildren(createInkRoutes(rootRoute, inks)),
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundView,
  })
}