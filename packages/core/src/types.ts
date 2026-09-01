import type { FunctionComponent } from 'react'
import type { Translations } from '@inkink/i18n'

export interface InkRoute {
  path: string
  component: FunctionComponent
}

export interface InkDefinition {
  name: string
  routes: Array<InkRoute>
  translations: Translations
}