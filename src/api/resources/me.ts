import { type ApiClient, getApiBaseUrl } from '../client'
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

/** Lädt ausschließlich die Daten des angemeldeten Kontos als JSON-Datei. */
export async function exportOwnData(): Promise<Blob> {
  const response = await fetch(new URL('/api/me/export', getApiBaseUrl()), {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok) await assertOk(response)
  return response.blob()
}

/** Der Server prüft Sitzung, Anmeldealter und die ausdrückliche Bestätigung. */
export async function deleteOwnAccount(): Promise<void> {
  const response = await fetch(new URL('/api/me', getApiBaseUrl()), {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmation: 'DELETE' }),
  })
  if (!response.ok) await assertOk(response)
}
