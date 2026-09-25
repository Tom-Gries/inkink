import type { ApiClient } from '../client'
import { assertOk } from '../errors'

export interface TestMessageDto {
  id: string
  message: string
  createdAt: string
}

export async function createTestMessage(
  client: ApiClient,
  message: string,
): Promise<TestMessageDto> {
  const res = await client.api.test.$post({ json: { message } })

  return assertOk<TestMessageDto>(res)
}

export async function getTestMessage(
  client: ApiClient,
  id: string,
): Promise<TestMessageDto> {
  const res = await client.api.test[':id'].$get({ param: { id } })

  return assertOk<TestMessageDto>(res)
}

export async function listTestMessages(
  client: ApiClient,
): Promise<TestMessageDto[]> {
  const res = await client.api.test.$get()

  return assertOk<TestMessageDto[]>(res)
}

export async function deleteTestMessage(
  client: ApiClient,
  id: string,
): Promise<void> {
  const res = await client.api.test[':id'].$delete({ param: { id } })

  await assertOk<void>(res)
}
