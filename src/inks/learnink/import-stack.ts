import type {
  AnswerOptionDto,
  Appearance,
  QuestionDto,
  QuestionType,
  Scoring,
  StackInputDto,
} from '../../api/index'
import { DEFAULT_EXAM_TIME_SECONDS } from './constants'

export type StackImportErrorCode =
  | 'invalid-json'
  | 'not-an-object'
  | 'single-stack-required'
  | 'name-required'
  | 'questions-invalid'
  | 'question-invalid'
  | 'question-text-required'
  | 'question-type-invalid'
  | 'options-invalid'
  | 'option-invalid'

/**
 * Fehler beim Parsen einer Stack-Import-Datei. `code` ist maschinenlesbar
 * (für Tests/Übersetzungen), `message` eine verständliche deutsche Meldung.
 */
export class StackImportError extends Error {
  constructor(
    public readonly code: StackImportErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'StackImportError'
  }
}

const APPEARANCES: Appearance[] = [
  'learn',
  'proof',
  'learn & proof',
  'inactive',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function asAppearance(value: unknown): Appearance {
  return APPEARANCES.includes(value as Appearance)
    ? (value as Appearance)
    : 'learn & proof'
}

function asScoring(value: unknown): Scoring {
  return value === 'partial' ? 'partial' : 'all'
}

function asQuestionType(value: unknown): QuestionType {
  return value === 'open' ? 'open' : 'closed'
}

function normalizeOption(raw: unknown, index: number): AnswerOptionDto {
  if (!isRecord(raw)) {
    throw new StackImportError(
      'option-invalid',
      `Antwortmöglichkeit ${index + 1} ist ungültig.`,
    )
  }
  return {
    id:
      typeof raw.id === 'string' && raw.id.length > 0
        ? raw.id
        : crypto.randomUUID(),
    text: asString(raw.text),
    correct: asBoolean(raw.correct, false),
  }
}

function normalizeQuestion(raw: unknown, index: number): QuestionDto {
  if (!isRecord(raw)) {
    throw new StackImportError(
      'question-invalid',
      `Frage ${index + 1} ist ungültig.`,
    )
  }

  const question = asString(raw.question).trim()
  if (question.length === 0) {
    throw new StackImportError(
      'question-text-required',
      `Frage ${index + 1}: "question" fehlt.`,
    )
  }

  const type = asQuestionType(raw.type)
  const answerOptions: AnswerOptionDto[] = []

  if (type === 'closed') {
    const rawOptions = raw.answerOptions
    if (rawOptions === undefined) {
      // Zwei leere Optionen als Startpunkt (wie im Editor).
      answerOptions.push(
        { id: crypto.randomUUID(), text: '', correct: true },
        { id: crypto.randomUUID(), text: '', correct: false },
      )
    } else if (Array.isArray(rawOptions)) {
      rawOptions.forEach((option, optionIndex) => {
        answerOptions.push(normalizeOption(option, optionIndex))
      })
    } else {
      throw new StackImportError(
        'options-invalid',
        `Frage ${index + 1}: "answerOptions" muss ein Array sein.`,
      )
    }
  }

  return {
    id:
      typeof raw.id === 'string' && raw.id.length > 0
        ? raw.id
        : crypto.randomUUID(),
    type,
    appearance: asAppearance(raw.appearance),
    question,
    explanation: asString(raw.explanation),
    points: Math.max(0, Math.floor(asNumber(raw.points, 1))),
    scoring: asScoring(raw.scoring),
    answerOptions,
  }
}

/**
 * Parst eine JSON-Datei in einen Stack für den Editor. Akzeptiert ein
 * einzelnes Stack-Objekt oder ein Array mit genau einem Stack (z. B. als
 * Export-Format). Fehlende optionale Felder werden mit sinnvollen Defaults
 * befüllt, fehlende IDs per `crypto.randomUUID()` erzeugt.
 */
export function parseStackImport(json: string): StackInputDto {
  let parsed: unknown
  try {
    // BOM entfernen (manche Exporte/Editoren hängen sie an).
    parsed = JSON.parse(json.replace(/^\uFEFF/, ''))
  } catch {
    throw new StackImportError(
      'invalid-json',
      'Die Datei ist kein gültiges JSON.',
    )
  }

  if (Array.isArray(parsed)) {
    if (parsed.length !== 1) {
      throw new StackImportError(
        'single-stack-required',
        'Die Datei muss genau einen Stack enthalten.',
      )
    }
    parsed = parsed[0]
  }

  if (!isRecord(parsed)) {
    throw new StackImportError(
      'not-an-object',
      'Die Datei muss einen Stack (Objekt) enthalten.',
    )
  }

  const name = asString(parsed.name).trim()
  if (name.length === 0) {
    throw new StackImportError(
      'name-required',
      'Der Stack braucht einen Namen ("name").',
    )
  }

  const rawQuestions = parsed.questions
  if (rawQuestions !== undefined && !Array.isArray(rawQuestions)) {
    throw new StackImportError(
      'questions-invalid',
      '"questions" muss ein Array sein.',
    )
  }

  const questions = (rawQuestions ?? []).map((question, index) =>
    normalizeQuestion(question, index),
  )

  const rawGroupIds = parsed.groupIds
  const groupIds = Array.isArray(rawGroupIds)
    ? rawGroupIds.filter((id): id is string => typeof id === 'string')
    : []

  return {
    name,
    creatorName: asString(parsed.creatorName),
    examTime: Math.floor(asNumber(parsed.examTime, DEFAULT_EXAM_TIME_SECONDS)),
    passingScore: Math.floor(asNumber(parsed.passingScore, 0)),
    isPublic: asBoolean(parsed.isPublic, true),
    questions,
    groupIds,
  }
}
