import type { LeaderboardEntryDto, QuestionDto, StackDto } from '@inkink/api'

/** Deterministisches Pseudo-Random-Shuffle (Fisher–Yates). */
export function shuffle<T>(input: T[]): T[] {
  const items = [...input]
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

/** Formatiert Sekunden als mm:ss (bzw. h:mm:ss ab einer Stunde). */
export function formatTime(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '-' : ''
  const total = Math.floor(Math.abs(totalSeconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return sign + (hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`)
}

/** Formatiert die Prüfzeit als "10 Minuten" / "1 Minute". */
export function formatExamTime(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`
}

/** Formatiert eine Sekundenzahl als "50 Sekunden" / "1 Sekunde". */
export function formatSeconds(seconds: number): string {
  const value = Math.round(seconds)
  return `${value} ${value === 1 ? 'Sekunde' : 'Sekunden'}`
}

/** Prüft, ob eine Frage im Learn-Modus verwendet wird. */
export function isLearnQuestion(question: QuestionDto): boolean {
  return (
    question.appearance === 'learn' || question.appearance === 'learn & proof'
  )
}

/** Prüft, ob eine Frage im Proof-Modus verwendet wird. */
export function isProofQuestion(question: QuestionDto): boolean {
  return (
    question.appearance === 'proof' || question.appearance === 'learn & proof'
  )
}

export function getLearnQuestions(stack: StackDto): QuestionDto[] {
  return stack.questions.filter(isLearnQuestion)
}

export function getProofQuestions(stack: StackDto): QuestionDto[] {
  return stack.questions.filter(isProofQuestion)
}

/**
 * Sortiert die Top 3 nach Punktzahl (absteigend) und – bei gleicher
 * Punktzahl – nach benötigter Zeit (aufsteigend).
 */
export function rankLeaderboard(
  entries: LeaderboardEntryDto[],
): LeaderboardEntryDto[] {
  return [...entries]
    .sort((a, b) => {
      const byScore = b.score - a.score
      if (byScore !== 0) return byScore
      return a.time - b.time
    })
    .slice(0, 3)
}

/** Prüft, ob der Eintrag einen Platz in den Top 3 des Leaderboards erreicht. */
export function qualifiesForTop3(
  entry: LeaderboardEntryDto,
  leaderboard: LeaderboardEntryDto[],
): boolean {
  const ranked = rankLeaderboard([...leaderboard, entry])
  return ranked.some(
    (item) =>
      item.name === entry.name &&
      item.score === entry.score &&
      item.time === entry.time,
  )
}

export interface ProofAnswerInput {
  questionId: string
  /** Gewählte Antwortoptionen (IDs) – bei offenen Fragen leer. */
  selected: string[]
}

export interface ProofEvaluation {
  /** Summe der Punkte korrekt beantworteter geschlossener Fragen. */
  achieved: number
  /** Summe der Punkte aller bewerteten (geschlossenen) Fragen. */
  possible: number
  /** Ganzzahliger Prozentwert; 0 wenn keine bewerteten Fragen. */
  percent: number
  /** Summe der Punkte der offenen Fragen („hätten Punkte geben können“). */
  openPoints: number
  /** true, wenn die Prüfung mindestens eine offene Frage enthält. */
  hasOpen: boolean
  /** Anzahl aller Prüfungsfragen (inkl. offener Fragen). */
  totalQuestions: number
}

/** Bewertet eine Proof-Prüfung rein lokal anhand der Prüfungsfragen. */
export function evaluateProof(
  answers: ReadonlyMap<string, string[]>,
  proofQuestions: QuestionDto[],
): ProofEvaluation {
  let achieved = 0
  let possible = 0
  let openPoints = 0
  let totalQuestions = 0

  for (const question of proofQuestions) {
    totalQuestions += 1

    if (question.type === 'open') {
      openPoints += question.points
      continue
    }

    const correctIds = question.answerOptions
      .filter((option) => option.correct)
      .map((option) => option.id)
      .sort()

    const selectedIds = answers.get(question.id) ?? []
    const selected = [...selectedIds].sort()

    possible += question.points

    // Modus 'partial': Jede korrekt ausgewählte Antwort gibt einen
    // anteiligen Punktwert (gerundet). Falsche Auswahlen mindern nicht.
    if (question.scoring === 'partial') {
      const correctPicked = selectedIds.filter((id) =>
        correctIds.includes(id),
      ).length
      const earned =
        correctIds.length > 0
          ? Math.round((question.points * correctPicked) / correctIds.length)
          : 0
      achieved += earned
      continue
    }

    // Modus 'all' (Standard): volle Punkte nur bei exakt korrekter Auswahl.
    const isCorrect =
      correctIds.length === selected.length &&
      correctIds.every((id, index) => id === selected[index])

    if (isCorrect) {
      achieved += question.points
    }
  }

  const percent = possible > 0 ? Math.round((achieved / possible) * 100) : 0

  return {
    achieved,
    possible,
    percent,
    openPoints,
    hasOpen: openPoints > 0,
    totalQuestions,
  }
}
