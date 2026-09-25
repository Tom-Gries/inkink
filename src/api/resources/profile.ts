import type { ApiClient } from '../client'
import { assertOk } from '../errors'

export interface ProfileDto {
  userId: string
  username: string | null
}

export interface ProfileResponse {
  profile: ProfileDto | null
}

/**
 * Explizit typisierte Profil-Subroute. Die über wasserdichte Hono-Routen
 * abgeleitete AppType verliert bei tief verschachtelten Pfaden
 * ("/api/profile/me") gelegentlich den Typ – daher wird der Sub-Client
 * hier schmal und stabil definiert.
 */
type ProfileMeClient = {
  $get: () => Promise<Response>
  $patch: (args: { json: { username: string } }) => Promise<Response>
}

type ProfileApiClientShape = { profile: { me: ProfileMeClient } }

function profileClient(client: ApiClient): ProfileMeClient {
  return (client as unknown as { api: ProfileApiClientShape }).api.profile.me
}

/** Lädt das eigene Profil über die geschützte Route /api/profile/me. */
export async function getProfile(
  client: ApiClient,
): Promise<ProfileDto | null> {
  const res = await profileClient(client).$get()
  const body = await assertOk<ProfileResponse>(res)

  return body.profile
}

/**
 * Setzt den eigenen Benutzernamen.
 * Wirft ApiError mit verständlicher Meldung (z. B. Validierungsfehler).
 */
export async function updateProfileUsername(
  client: ApiClient,
  username: string,
): Promise<ProfileDto> {
  const res = await profileClient(client).$patch({ json: { username } })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as {
        error?: {
          code?: string
          message?: string
          issues?: Array<{ message: string }>
        }
      }
      const firstIssue = body.error?.issues?.[0]?.message
      message = firstIssue ?? body.error?.message ?? message
    } catch {
      // Kein JSON-Body.
    }
    throw new Error(message)
  }

  const body = await assertOk<ProfileResponse>(res)

  if (!body.profile) {
    throw new Error('Server hat kein Profil zurückgegeben.')
  }

  return body.profile
}
