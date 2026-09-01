import { hc } from 'hono/client'
import type { AppType } from 'api'

export type ApiClient = ReturnType<typeof hc<AppType>>

/** Erstellt den typsicheren Client für die Hono-API (apps/api). */
export function createApiClient(baseUrl: string): ApiClient {
  return hc<AppType>(baseUrl, { init: { credentials: 'include' } })
}

export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL

  if (!url) {
    throw new Error('VITE_API_URL ist nicht gesetzt. Bitte in apps/web/.env konfigurieren.')
  }

  return url
}

let client: ApiClient | undefined

/** Lazy Singleton – der Client wird beim ersten Zugriff erstellt. */
export function getApi(): ApiClient {
  client ??= createApiClient(getApiBaseUrl())

  return client
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

/** Wirft eine ApiError, wenn die API nicht mit 2xx antwortet. */
export async function assertOk(res: Response): Promise<void> {
  if (res.ok) {
    return
  }

  let code = 'HTTP_ERROR'
  let message = `HTTP ${res.status}`

  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string } }

    if (body.error) {
      code = body.error.code ?? code
      message = body.error.message ?? message
    }
  } catch {
    // Kein JSON-Body – generische Meldung behalten.
  }

  throw new ApiError(message, code, res.status)
}

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

  await assertOk(res)

  return (await res.json()) as TestMessageDto
}

export async function listTestMessages(client: ApiClient): Promise<TestMessageDto[]> {
  const res = await client.api.test.$get()

  await assertOk(res)

  return (await res.json()) as TestMessageDto[]
}

