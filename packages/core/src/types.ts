import type { FunctionComponent } from 'react'
import type { Translations } from '@inkink/i18n'

export interface Route {
  /** Name der Route innerhalb des Inks, z.B. "ziel". */
  name: string
  path: string
  component: FunctionComponent
}

export interface Definition {
  name: string
  routes: Array<Route>
  translations: Translations
}

/**
 * Registrierung aller Route-Referenzen ("<ink-name>.<route-name>").
 * Jeder Ink ergänzt seine Einträge per Module Augmentation, sodass
 * Link.to beim Schreiben autocomplettet und Tippfehler bereits
 * zur Compile-Zeit auffallen.
 */
export interface RouteRegistry {}

/** Typsichere Referenz auf eine registrierte Route eines Inks, z.B. "startink.ziel". */
export type RouteRef = keyof RouteRegistry & string