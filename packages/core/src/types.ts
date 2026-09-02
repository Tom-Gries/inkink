import type { FunctionComponent } from 'react'
import type { Translations } from '@inkink/i18n'

export type RouteGuard = 'auth' | 'none'

export interface Route {
  name: string
  path: string
  component: FunctionComponent
  guard?: RouteGuard
}

export interface Definition {
  name: string

  guard?: RouteGuard

  routes: Array<Route>
  translations: Translations
}

export interface RouteRegistry { }

export type RouteRef = keyof RouteRegistry & string