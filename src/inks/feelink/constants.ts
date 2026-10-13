import {
  Activity,
  Angry,
  Frown,
  HeartHandshake,
  Leaf,
  type LucideIcon,
  Moon,
  Smile,
  Sparkles,
} from 'lucide-react'
import type { FeelingMood } from '../../api/index'

export interface FeelingOption {
  id: FeelingMood
  icon: LucideIcon
}

/**
 * Gefühls-Auswahl auf der Feelink-Seite (Reihenfolge = Anzeige-Reihenfolge).
 * Die IDs müssen dem API-Schema entsprechen (api/src/schemas/feeling.ts);
 * die Beschriftung kommt aus den Translations (`feelink.mood.<id>`).
 */
export const FEELINGS: ReadonlyArray<FeelingOption> = [
  { id: 'happy', icon: Smile },
  { id: 'sad', icon: Frown },
  { id: 'angry', icon: Angry },
  { id: 'calm', icon: Leaf },
  { id: 'tired', icon: Moon },
  { id: 'anxious', icon: Activity },
  { id: 'excited', icon: Sparkles },
  { id: 'grateful', icon: HeartHandshake },
]
