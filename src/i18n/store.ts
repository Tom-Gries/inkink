import { create } from 'zustand'
import type { Locale } from './types'

const STORAGE_KEY = 'inkink.locale'

function isLocale(value: unknown): value is Locale {
  return value === 'de' || value === 'en'
}

interface LocaleState {
  /** Aktuell gewählte Sprache. Default 'de' (SSR-Konsistenz). */
  locale: Locale
  /** Setzt die Sprache und persistiert sie im localStorage (client). */
  setLocale: (locale: Locale) => void
  /** Liest die gespeicherte Sprache aus dem localStorage (nur client, nach Mount). */
  hydrate: () => void
}

/**
 * Globaler Locale-Store. Ermöglicht den Sprachwechsel zur Laufzeit
 * (z. B. über einen Umschalter in den Einstellungen) und persistiert
 * die Wahl im localStorage. `hydrate()` wird client-seitig nach dem
 * Mount aufgerufen, um SSR-Hydrations-Mismatches zu vermeiden
 * (Server rendert immer mit 'de').
 */
export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: 'de',
  setLocale: (locale) => {
    set({ locale })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale)
    }
  },
  hydrate: () => {
    if (typeof window === 'undefined') return

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved !== null && isLocale(saved)) {
      set({ locale: saved })
    }
  },
}))
