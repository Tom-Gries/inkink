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
    throw new Error(
      'VITE_API_URL ist nicht gesetzt. Bitte in apps/web/.env konfigurieren.',
    )
  }

  return url
}

let client: ApiClient | undefined

/** Lazy Singleton – der Client wird beim ersten Zugriff erstellt. */
export function getApiClient(): ApiClient {
  client ??= createApiClient(getApiBaseUrl())

  return client
}