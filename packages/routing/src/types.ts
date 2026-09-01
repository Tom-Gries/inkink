import type { ComponentType } from 'react'
import type { Translations } from '@inkink/i18n'

export interface InkRoute {
  path: string
  component: ComponentType
}

export interface InkDefinition {
  name: string
  routes: Array<InkRoute>
  translations: Translations
}