import type { Definition, RouteGuard } from '@inkink/core'
import {
  createRoute,
  createRouter,
  redirect,
  type AnyRoute,
} from '@tanstack/react-router'
import { ErrorView } from './views/error'
import { HomeView } from './views/home'
import { NotFoundView } from './views/not-found'

export { translations } from './translations'

export interface InkRouterOptions {
  /**
   * Prüft, ob der aktuelle Benutzer authentifiziert ist.
   */
  isAuthenticated: () => boolean | Promise<boolean>

  /**
   * Route, zu der nicht authentifizierte Benutzer weitergeleitet werden.
   *
   * Standard: '/login'
   */
  loginPath?: string
}

function getRouteGuard(
  ink: Definition,
  route: { guard?: RouteGuard },
): RouteGuard | undefined {
  // Ein Guard auf der Route hat Vorrang vor dem Guard des Inks.
  return route.guard ?? ink.guard
}

function createInkRoutes<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
  inks: Array<Definition>,
  options: InkRouterOptions,
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
      ink.routes.map((route) => {
        const guard = getRouteGuard(ink, route)

        return createRoute({
          getParentRoute: () => rootRoute,
          path: route.path,
          component: route.component,

          beforeLoad: async ({ location }) => {
            if (guard !== 'auth') {
              return
            }

            const authenticated = await options.isAuthenticated()

            if (!authenticated) {
              throw redirect({
                to: options.loginPath ?? '/login',
                search: {
                  redirect: location.href,
                },
              })
            }
          },
        })
      }),
    ),
  ]
}

export function createInkRouter<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
  inks: Array<Definition>,
  options: InkRouterOptions,
) {
  return createRouter({
    routeTree: rootRoute.addChildren(
      createInkRoutes(rootRoute, inks, options),
    ),
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundView,
  })
}