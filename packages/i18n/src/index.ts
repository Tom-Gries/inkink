import { createContext, createElement, type ReactNode, useContext } from 'react'
import type { Locale, Translations } from './types'

export { useLocaleStore } from './store'
export type { Locale, TranslationMessages, Translations } from './types'

export const locales = ['de', 'en'] as const satisfies ReadonlyArray<Locale>

interface I18nContextValue {
  locale: Locale
  translations: Translations
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function createTranslations(
  ...translationModules: Array<Translations>
): Translations {
  return translationModules.reduce<Translations>(
    (translations, translationModule) => ({
      de: { ...translations.de, ...translationModule.de },
      en: { ...translations.en, ...translationModule.en },
    }),
    { de: {}, en: {} },
  )
}

export function I18nProvider({
  children,
  locale,
  translations,
}: {
  children: ReactNode
  locale: Locale
  translations: Translations
}) {
  return createElement(
    I18nContext.Provider,
    { value: { locale, translations } },
    children,
  )
}

export function useTranslations() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useTranslations must be used within an I18nProvider')
  }

  return (key: string) =>
    context.translations[context.locale][key] ??
    context.translations.de[key] ??
    key
}
