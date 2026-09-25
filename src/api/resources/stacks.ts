import type { ApiClient } from '../client'
import { assertOk } from '../errors'

export type Appearance = 'learn' | 'proof' | 'learn & proof' | 'inactive'
export type QuestionType = 'open' | 'closed'
/** Bewertungsmodus bei mehreren richtigen Antworten: alle oder anteilig. */
export type Scoring = 'all' | 'partial'

export interface AnswerOptionDto {
  id: string
  text: string
  correct: boolean
}

export interface QuestionDto {
  id: string
  type: QuestionType
  appearance: Appearance
  question: string
  explanation: string
  points: number
  scoring: Scoring
  answerOptions: AnswerOptionDto[]
}

export interface LeaderboardEntryDto {
  name: string
  score: number
  time: number
}

export interface StackDto {
  id: string
  name: string
  creatorName: string
  examTime: number
  /** Ab dieser Punktzahl gilt die Prüfung als bestanden (0 = keine Schwelle). */
  passingScore: number
  archived: boolean
  questions: QuestionDto[]
  leaderboard: LeaderboardEntryDto[]
}

export interface StackInputDto {
  name: string
  creatorName: string
  examTime: number
  passingScore: number
  questions: QuestionDto[]
}

/**
 * Explizit typisierte Subrouten. Die über wasserdichte Hono-Routen
 * abgeleitete AppType verliert bei tief verschachtelten Pfaden
 * (z. B. "/stacks/:id/archive") gelegentlich den Typ – daher wird der
 * Sub-Client hier schmal und stabil definiert (wie im Profile-Resource).
 */
type StackIdClient = {
  $get: (options: { param: { id: string } }) => Promise<Response>
  $put: (options: {
    param: { id: string }
    json: StackInputDto
  }) => Promise<Response>
  archive: {
    $post: (options: { param: { id: string } }) => Promise<Response>
  }
  leaderboard: {
    $post: (options: {
      param: { id: string }
      json: LeaderboardEntryDto
    }) => Promise<Response>
  }
}

type StacksApiClientShape = {
  stacks: {
    $get: () => Promise<Response>
    $post: (options: { json: StackInputDto }) => Promise<Response>
    ':id': StackIdClient
  }
}

function stacksClient(client: ApiClient): StacksApiClientShape {
  return (client as unknown as { api: StacksApiClientShape }).api
}

export async function listStacks(client: ApiClient): Promise<StackDto[]> {
  const res = await stacksClient(client).stacks.$get()
  return assertOk<StackDto[]>(res)
}

export async function getStack(
  client: ApiClient,
  id: string,
): Promise<StackDto> {
  const res = await stacksClient(client).stacks[':id'].$get({ param: { id } })
  return assertOk<StackDto>(res)
}

export async function createStack(
  client: ApiClient,
  input: StackInputDto,
): Promise<StackDto> {
  const res = await stacksClient(client).stacks.$post({ json: input })
  return assertOk<StackDto>(res)
}

export async function updateStack(
  client: ApiClient,
  id: string,
  input: StackInputDto,
): Promise<StackDto> {
  const res = await stacksClient(client).stacks[':id'].$put({
    param: { id },
    json: input,
  })
  return assertOk<StackDto>(res)
}

export async function archiveStack(
  client: ApiClient,
  id: string,
): Promise<StackDto> {
  const res = await stacksClient(client).stacks[':id'].archive.$post({
    param: { id },
  })
  return assertOk<StackDto>(res)
}

export async function addLeaderboardEntry(
  client: ApiClient,
  id: string,
  entry: LeaderboardEntryDto,
): Promise<StackDto> {
  const res = await stacksClient(client).stacks[':id'].leaderboard.$post({
    param: { id },
    json: entry,
  })
  return assertOk<StackDto>(res)
}
