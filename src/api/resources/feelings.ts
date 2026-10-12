import type { ApiClient } from '../client'
import { assertOk } from '../errors'

/** Muss den Feeling-IDs des API-Schemas entsprechen (api/src/schemas/feeling.ts). */
export type FeelingMood =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'calm'
  | 'tired'
  | 'anxious'
  | 'excited'
  | 'grateful'

export interface FeelingDto {
  id: string
  mood: FeelingMood
  note: string
  createdAt: string
}

export interface FeelingInputDto {
  mood: FeelingMood
  note: string
}

/**
 * Explizit typisierte Subrouten. Die über wasserdichte Hono-Routen
 * abgeleitete AppType verliert bei tief verschachtelten Pfaden
 * (z. B. „/feelings/:id") gelegentlich den Typ – daher wird der
 * Sub-Client hier schmal und stabil definiert (wie beim Stacks-Resource).
 */
type FeelingIdClient = {
  $delete: (options: { param: { id: string } }) => Promise<Response>
}

type FeelingsApiClientShape = {
  feelings: {
    $get: () => Promise<Response>
    $post: (options: { json: FeelingInputDto }) => Promise<Response>
    ':id': FeelingIdClient
  }
}

function feelingsClient(client: ApiClient): FeelingsApiClientShape {
  return (client as unknown as { api: FeelingsApiClientShape }).api
}

/** Listet die eigenen Gefühls-Einträge (neueste zuerst). */
export async function listFeelings(client: ApiClient): Promise<FeelingDto[]> {
  const res = await feelingsClient(client).feelings.$get()
  return assertOk<FeelingDto[]>(res)
}

/** Speichert einen neuen Gefühls-Eintrag. */
export async function createFeeling(
  client: ApiClient,
  input: FeelingInputDto,
): Promise<FeelingDto> {
  const res = await feelingsClient(client).feelings.$post({ json: input })
  return assertOk<FeelingDto>(res)
}

/**
 * Löscht einen Eintrag. Die API antwortet mit 204 (ohne Body) – deshalb
 * wird hier nur im Fehlerfall ein JSON-Body geparst.
 */
export async function deleteFeeling(
  client: ApiClient,
  id: string,
): Promise<void> {
  const res = await feelingsClient(client).feelings[':id'].$delete({
    param: { id },
  })

  if (!res.ok) {
    await assertOk<void>(res)
  }
}
