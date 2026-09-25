import { hc } from 'hono/client'

/**
 * Lokaler, explizit typisierter Client-Vertrag für die Hono-API.
 *
 * Seit der Aufteilung in zwei getrennte Projekte (api/ + web/) wird der
 * API-Vertrag nicht mehr aus dem API-Projekt importiert (früher `AppType`
 * aus server/index), sondern hier schmal und explizit gepflegt. Subrouten
 * mit tieferen Pfaden (profile, stacks) sind in den resources-Dateien
 * bereits separat explizit typisiert.
 */
export interface ClientTestItemApi {
  $get: (options: { param: { id: string } }) => Promise<Response>
  $delete: (options: { param: { id: string } }) => Promise<Response>
}

export interface ClientTestApi {
  $get: () => Promise<Response>
  $post: (options: { json: { message: string } }) => Promise<Response>
  ':id': ClientTestItemApi
}

export interface ApiClientShape {
  api: {
    /** GET /api/me */
    me: { $get: () => Promise<Response> }
    /** /api/test … */
    test: ClientTestApi
  }
}

export type ApiClient = ApiClientShape

/**
 * Erstellt den typsicheren Client für die Hono-API
 * (web/ + api/, Ein-Domain-Setup).
 */
export function createApiClient(baseUrl: string): ApiClient {
  // hc() leitet den App-Typ selbst ab (constraint «Hono»); der Vertrag wird
  // hier lokal geführt und das Ergebnis auf ApiClient abgebildet
  // (projektgetrennt gepflegt).
  return hc(baseUrl, {
    init: { credentials: 'include' },
  }) as unknown as ApiClient
}

export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL

  if (url) {
    return url
  }

  // Default: Same-Origin. Frontend und API liegen auf derselben Domain
  // (im Vercel-Projekt per Rewrite), es gibt keinen separaten API-Host mehr.
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://localhost:3000'
}

let client: ApiClient | undefined

/** Lazy Singleton – der Client wird beim ersten Zugriff erstellt. */
export function getApiClient(): ApiClient {
  client ??= createApiClient(getApiBaseUrl())

  return client
}
