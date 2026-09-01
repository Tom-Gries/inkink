import { routes as startInkRoutes } from '@inkink/startink'
import {
  createRoute,
  createRouter,
  type AnyRoute,
} from '@tanstack/react-router'
import { ErrorView } from './views/error'
import { HomeView } from './views/home'
import { NotFoundView } from './views/not-found'

function createInkInkRoutes<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
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
    ...startInkRoutes.map(({ path, component }) =>
      createRoute({
        getParentRoute: () => rootRoute,
        path,
        component,
      }),
    ),
  ]
}

export function createInkInkRouter<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
) {
  return createRouter({
    routeTree: rootRoute.addChildren(createInkInkRoutes(rootRoute)),
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundView,
  })
}
