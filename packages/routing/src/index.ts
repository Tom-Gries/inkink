import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
})

const routeTree = rootRoute.addChildren([
  indexRoute,
])

export const router = createRouter({
  routeTree,
})