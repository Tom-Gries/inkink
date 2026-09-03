import type { Translations } from '@inkink/i18n'
import type { FunctionComponent, ReactNode } from 'react'

export type RouteGuard = 'auth' | 'none'

/**
 * Sidebar-Metadaten einer Route. Ist `nav` gesetzt und `visible: true`,
 * erscheint die Route automatisch in der AppShell-Sidebar. Ohne `nav`
 * bleibt die Route direkt über die URL erreichbar, aber unsichtbar.
 */
export interface RouteNav {
  /** `true` → Route wird automatisch in der Sidebar angezeigt. */
  visible?: boolean
  /** Icon neben dem Label; ohne Angabe nutzt die Shell ein Default-Icon. */
  icon?: ReactNode
  /**
   * Sortiergewicht für die Sidebar: Je höher die Zahl, desto weiter unten
   * erscheint der Link. Ohne Angabe (≡ 0) bleibt die Registrierungsreihenfolge
   * erhalten. Negative Werte heben den Link weiter nach oben.
   */
  weight?: number
}

export interface Route {
  name: string
  path: string
  component: FunctionComponent
  guard?: RouteGuard
  nav?: RouteNav
}

export interface Definition {
  name: string

  guard?: RouteGuard

  routes: Array<Route>
  translations: Translations
}

/**
 * Typsicheres Route-Ref-Register: Inks erweitern diese Schnittstelle
 * per `declare module '@inkink/core'` (Declaration Merging) – deshalb
 * darf sie nicht zu einem Type-Alias umgebaut werden.
 */
// biome-ignore lint/suspicious/noEmptyInterface: Declaration-Merging-Target für RouteRefs (Inks augmentieren es).
export interface RouteRegistry {}

export type RouteRef = keyof RouteRegistry & string
