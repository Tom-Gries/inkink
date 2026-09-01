import type { AnyRoute } from '@tanstack/react-router'

export interface InkRouteModule {
  id: string
  basePath: string
  route: AnyRoute
}