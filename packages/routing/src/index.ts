import { createTranslations } from '@inkink/i18n'
import {
  createRoute,
  createRouter,
  type AnyRoute,
} from '@tanstack/react-router'
import { ErrorView } from './views/error'
import { HomeView } from './views/home'
import { NotFoundView } from './views/not-found'
import { translations as shellTranslations } from './translations'
import type { InkDefinition } from './types'

export { defineInk } from './defineInk'
export type { InkDefinition, InkRoute } from './types'

export const translations = createTranslations(shellTranslations)

function createInkRoutes<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
  inks: Array<InkDefinition>,
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

export function createInkInkRouter<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
  inks: Array<InkDefinition>,
) {
  return createRouter({
    routeTree: rootRoute.addChildren(createInkRoutes(rootRoute, inks)),
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFoundView,
  })
}
