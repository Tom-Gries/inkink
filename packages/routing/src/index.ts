import { createRoute, type AnyRoute } from '@tanstack/react-router'
import { createElement } from 'react'

export function createInkInkRoutes<TRootRoute extends AnyRoute>(
  rootRoute: TRootRoute,
) {
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
  })

  const errorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/error',
    component: ErrorPage,
  })

  return [indexRoute, errorRoute]
}

function Home() {
  return createElement('h1', null, 'InkInk')
}

function ErrorPage() {
  return createElement('h1', null, 'Error')
}
