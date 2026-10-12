import type { FeelingMood } from '../../api/index'

export interface FeelingOption {
  id: FeelingMood
  emoji: string
}

/**
 * Gefühls-Auswahl auf der Feelink-Seite (Reihenfolge = Anzeige-Reihenfolge).
 * Die IDs müssen dem API-Schema entsprechen (api/src/schemas/feeling.ts);
 * die Beschriftung kommt aus den Translations (`feelink.mood.<id>`).
 */
export const FEELINGS: ReadonlyArray<FeelingOption> = [
  { id: 'happy', emoji: '😊' },
  { id: 'sad', emoji: '😢' },
  { id: 'angry', emoji: '😠' },
  { id: 'calm', emoji: '😌' },
  { id: 'tired', emoji: '😴' },
  { id: 'anxious', emoji: '😰' },
  { id: 'excited', emoji: '🤩' },
  { id: 'grateful', emoji: '🙏' },
]
