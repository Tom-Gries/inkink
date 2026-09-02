// Zentrale Sammelstelle: entdeckt alle Inks automatisch.
// Ein neuer Ink wird einfach als Ordner unter packages/inks/* angelegt
// (mit src/index.ts, das default ein defineInk()-Ergebnis exportiert)
// und in apps/web als Dependency erganzt. Diese Datei muss nicht angefasst werden.

import type { Definition } from '@inkink/core'
import { createTranslations } from '@inkink/i18n'

const inkModules = import.meta.glob<{ default: Definition }>(
  '../../../packages/inks/*/src/index.ts',
  { eager: true },
)

export const inks: Array<Definition> = Object.values(inkModules).map(
  (module) => module.default,
)

export const inkTranslations = createTranslations(
  ...inks.map((ink) => ink.translations),
)
