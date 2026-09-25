import type { ApiClient } from '../client'
import { assertOk } from '../errors'

export interface MeResponse {
  user: {
    id: string
    name: string | null
    email: string | null
    image?: string | null
  }
}

/** Ruft die eigene Session über die geschützte /api/me-Route ab. */
export async function getMe(client: ApiClient): Promise<MeResponse> {
  const res = await client.api.me.$get()

  return assertOk<MeResponse>(res)
}
