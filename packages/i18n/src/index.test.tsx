import { render, renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import {
  createTranslations,
  I18nProvider,
  locales,
  useTranslations,
} from './index'
import type { Locale, Translations } from './index'

const translations: Translations = {
  de: { begrueszung: 'Hallo', nurDeutsch: 'Nur Deutsch' },
  en: { begrueszung: 'Hello' },
}

function Wrapper({
  children,
  locale = 'en',
}: {
  children: ReactNode
  locale?: Locale
}) {
  return (
    <I18nProvider locale={locale} translations={translations}>
      {children}
    </I18nProvider>
  )
}

describe('createTranslations', () => {
  it('führt mehrere Übersetzungs-Module zusammen', () => {
    const merged = createTranslations(
      { de: { a: '1' }, en: { a: '1' } },
      { de: { b: '2' }, en: { b: '2' } },
    )

    expect(merged.de).toEqual({ a: '1', b: '2' })
    expect(merged.en).toEqual({ a: '1', b: '2' })
  })

  it('ergibt ohne Argumente ein leeres Übersetzungs-Objekt', () => {
    expect(createTranslations()).toEqual({ de: {}, en: {} })
  })
})

describe('locales', () => {
  it('enthält de und en', () => {
    expect(locales).toEqual(['de', 'en'])
  })
})

describe('useTranslations', () => {
  it('liefert den Text der aktuellen Locale', () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: Wrapper,
    })

    expect(result.current('begrueszung')).toBe('Hello')
  })

  it('fällt für fehlende Keys der Locale auf Deutsch zurück', () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: Wrapper,
    })

    expect(result.current('nurDeutsch')).toBe('Nur Deutsch')
  })

  it('fällt für unbekannte Keys auf den Schlüssel selbst zurück', () => {
    const { result } = renderHook(() => useTranslations(), {
      wrapper: Wrapper,
    })

    expect(result.current('fehlt')).toBe('fehlt')
  })

  it('wirft außerhalb eines I18nProviders', () => {
    expect(() => renderHook(() => useTranslations())).toThrowError(
      'useTranslations must be used within an I18nProvider',
    )
  })
})

describe('I18nProvider', () => {
  it('rendert Kinder', () => {
    render(
      <Wrapper>
        <p>Kinder</p>
      </Wrapper>,
    )

    expect(screen.getByText('Kinder')).not.toBeNull()
  })
})