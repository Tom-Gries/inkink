import type { Definition, RouteGuard } from '@inkink/core'
import {
  type AnyRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { ErrorView } from './views/error'
import { HomeView } from './views/home'
import { NotFoundView } from './views/not-found'

export { translations } from './translations'

/**
 * Diagnose-Logs des Auth-Guards (Präfix [auth:routing]). Bewusst ohne
 * Abhängigkeit zu @inkink/api – das Routing kennt nur isAuthenticated
 * und onAuthRequired, nicht die konkrete Auth-Implementierung.
 */
function guardLog(message: string, ...details: unknown[]): void {
  console.log('[auth:routing]', message, ...details)
}

export interface InkRouterOptions {
  /**
   * Prüft, ob der aktuelle Benutzer authentifiziert ist.
   */
  isAuthenticated: () => boolean | Promise<boolean>

  /**
   * Wird aufgerufen, wenn ein geschützter Route-Guard ('auth') den
   * Zugriff verweigert. Die App zeigt darüber ihre Login-UI (z. B.
   * einen Provider mit LoginGate) – die URL bleibt unverändert.
   *
   * Das Routing weiß nicht, WIE authentifiziert wird; es meldet nur,
   * dass eine Authentifizierung fehlt.
   */
  onAuthRequired?: (targetHref: string) => void

  /**
   * Wird bei der Navigation auf eine ÖFFENTLICHE Route ('none'/kein
   * Guard) aufgerufen (nicht beim Preload). Die App nutzt das z. B.,
   * um das Login-Required-Flag der Auth-Logik zurückzusetzen, damit
   * das LoginGate nicht auf öffentlichen Seiten hängen bleibt.
   */
  onPublicRoute?: () => void
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
    beforeLoad: ({ cause }) => {
      // Öffentliche Route: Bei echter Navigation (nicht Preload) das
      // Login-Required-Flag zurücksetzen, damit das Gate nicht kleben bleibt.
      if (cause !== 'preload') {
        guardLog(
          'Index-Route "/": onPublicRoute() → Login-Required-Flag zurücksetzen',
        )
        options.onPublicRoute?.()
      }
    },
  })

  const errorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/error',
    component: ErrorView,
    beforeLoad: ({ cause }) => {
      if (cause !== 'preload') {
        guardLog(
          'Fehler-Route "/error": onPublicRoute() → Login-Required-Flag zurücksetzen',
        )
        options.onPublicRoute?.()
      }
    },
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

          beforeLoad: async ({ location, cause }) => {
            // Beim Preload (Hover/Fokus) keine Auth-Prüfung und keinen
            // Hook auslösen – das LoginGate soll nicht schon vor einem
            // Klick aufblitzen.
            if (cause === 'preload') {
              return
            }

            if (guard === 'auth') {
              guardLog(
                `Guard "auth": prüfe geschützte Route "${route.path}" (location=${location.href})`,
              )
              const authenticated = await options.isAuthenticated()

              if (!authenticated) {
                // Kein Redirect und keine URL-Veränderung: Die App hört
                // über onAuthRequired und zeigt ihre Login-UI.
                guardLog(
                  `Guard "auth": NICHT authentifiziert → onAuthRequired("${location.href}")`,
                )
                options.onAuthRequired?.(location.href)
              } else {
                guardLog(
                  `Guard "auth": authentifiziert → Zugriff erlaubt ("${route.path}")`,
                )
              }
              return
            }

            // Öffentliche Route: Login-Required-Flag zurücksetzen, damit
            // das LoginGate auf öffentlichen Seiten nicht hängen bleibt.
            guardLog(
              `Öffentliche Route "${route.path}": onPublicRoute() ausgelöst`,
            )
            options.onPublicRoute?.()
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
    routeTree: rootRoute.addChildren(createInkRoutes(rootRoute, inks, options)),
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundView,
  })
}
