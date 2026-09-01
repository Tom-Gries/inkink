// @vitest-environment node
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import app from '../../index'

// Lädt apps/api/.env, damit der Auth-Test gegen die Dev-Datenbank + Auth-Config läuft.
config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

const hasAuthEnv = Boolean(
  process.env.MONGODB_URI &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET,
)

describe.skipIf(!hasAuthEnv)('GET /api/me', () => {
  it('liefert 401 ohne gültige Session', async () => {
    const res = await app.request('/api/me')

    expect(res.status).toBe(401)

    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('UNAUTHORIZED')
  })
})