import type { ReactNode } from 'react'
import type { Route, RouteNav } from './types'

interface RegisteredRoute {
  inkName: string
  routeName: string
  path: string
  nav?: RouteNav
}

const routes = new Map<string, RegisteredRoute>()

export function registerInkRoutes(
  inkName: string,
  inkRoutes: ReadonlyArray<Pick<Route, 'name' | 'path' | 'nav'>>,
): void {
  for (const route of inkRoutes) {
    routes.set(`${inkName}.${route.name}`, {
      inkName,
      routeName: route.name,
      path: route.path,
      nav: route.nav,
    })
  }
}

export function resolveInkRoute(ref: string): string {
  const route = routes.get(ref)
  if (route === undefined) {
    throw new Error(
      `Unbekannte Ink-Route "${ref}". Registriert sind: ${[...routes.keys()].join(', ')}`,
    )
  }
  return route.path
}

export interface VisibleInkRoute {
  /** Vollständige Referenz, z. B. `startink.start`. */
  ref: string
  inkName: string
  routeName: string
  path: string
  /** Optionales Sidebar-Icon der Route (`nav.icon`). */
  icon?: ReactNode
}

/**
 * Liefert alle Routen aller registrierten Inks, die mit
 * `nav: { visible: true }` für die Sidebar markiert sind – in
 * Registrierungsreihenfolge (per Ink-Route-Definition).
 */
export function getVisibleInkRoutes(): Array<VisibleInkRoute> {
  return [...routes.entries()]
    .filter(([, route]) => route.nav?.visible === true)
    .map(([ref, route]) => ({
      ref,
      inkName: route.inkName,
      routeName: route.routeName,
      path: route.path,
      icon: route.nav?.icon,
    }))
}
