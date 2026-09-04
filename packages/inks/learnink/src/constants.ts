import type { Appearance, QuestionType } from '@inkink/api'

/** Default-Namenliste für Creatorname (nicht eingeloggt) und Leaderboard. */
export const DEFAULT_NAMES = [
  'Leonardo Ein Vinci',
  'Vincent van Darwin',
  'Pablo Teslassо',
  'Salvador Newtí',
  'Claude Curiet',
  'Rembrantilei',
  'Michel Hawkingelo',
  'Frida Franklo',
  "Georgia O'Goodall",
  'Yayoi Lovelama',
  'Artemisia Johnsonileschi',
  'Tamara Hodgempicka',
  'Mary McCassattock',
  'Hilma af Meitner',
] as const

export const DEFAULT_EXAM_TIME_SECONDS = 600

export const APPEARANCES: Appearance[] = [
  'learn',
  'proof',
  'learn & proof',
  'inactive',
]

export const QUESTION_TYPES: QuestionType[] = ['open', 'closed']

/** Zufälliger Default-Name aus der Liste (für nicht eingeloggte Nutzer). */
export function randomDefaultName(): string {
  return DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)]
}
