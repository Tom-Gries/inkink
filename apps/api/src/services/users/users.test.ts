// @vitest-environment node
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import app from '../../index'

// Lädt apps/api/.env, damit der List-Endpoint gegen die Dev-Datenbank läuft.
config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

describe('GET /api/users/:id', () => {
  it('liefert 400 bei ungültiger ID (ohne Datenbankzugriff)', async () => {
    const res = await app.request('/api/users/keine-gueltige-id')

    expect(res.status).toBe(400)
  })
})

describe.skipIf(!process.env.MONGODB_URI)('GET /api/users', () => {
  it('liefert eine Benutzerliste – auch leer, solange kein Login erfolgte (200)', async () => {
    const res = await app.request('/api/users')

    expect(res.status).toBe(200)
    expect(Array.isArray(await res.json())).toBe(true)
  })
})