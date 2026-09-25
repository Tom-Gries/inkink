// Zentrale Sammelstelle: entdeckt alle Inks automatisch.
// Ein neuer Ink wird einfach als Ordner unter src/inks/* angelegt
// (mit index.ts, das default ein defineInk()-Ergebnis exportiert).
// Diese Datei muss nicht angefasst werden.

import type { Definition } from './core/index'
import { createTranslations } from './i18n/index'

const inkModules = import.meta.glob<{ default: Definition }>(
  './inks/*/index.ts',
  { eager: true },
)

export const inks: Array<Definition> = Object.values(inkModules).map(
  (module) => module.default,
)

export const inkTranslations = createTranslations(
  ...inks.map((ink) => ink.translations),
)
