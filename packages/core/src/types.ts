import type { FunctionComponent } from 'react'
import type { Translations } from '@inkink/i18n'

export interface InkRoute {
  /** Name der Route innerhalb des Inks, z.B. "ziel". */
  name: string
  path: string
  component: FunctionComponent
}

export interface InkDefinition {
  name: string
  routes: Array<InkRoute>
  translations: Translations
}

/**
 * Registrierung aller Route-Referenzen ("<ink-name>.<route-name>").
 * Jeder Ink ergänzt seine Einträge per Module Augmentation, sodass
 * Link.to beim Schreiben autocomplettet und Tippfehler bereits
 * zur Compile-Zeit auffallen.
 */
export interface InkRouteRegistry {}

/** Typsichere Referenz auf eine registrierte Ink-Route, z.B. "startink.ziel". */
export type InkRouteRef = keyof InkRouteRegistry & string