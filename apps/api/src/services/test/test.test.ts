// @vitest-environment node
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import app from '../../index'

// Lädt apps/api/.env, damit Integrationstests gegen die Dev-Datenbank laufen.
config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

describe.skipIf(!process.env.MONGODB_URI)('Test-Nachrichten (Integration)', () => {
  it('schreibt eine Test-Nachricht in die Datenbank (201)', async () => {
    const res = await app.request('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Integrationstest' }),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as { id: string; message: string; createdAt: string }
    expect(body.message).toBe('Integrationstest')
    expect(body.id).toMatch(/^[0-9a-fA-F]{24}$/)
  })

  it('liefert 400, wenn die Nachricht fehlt', async () => {
    const res = await app.request('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(400)

    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('listet die Test-Nachrichten (200)', async () => {
    const res = await app.request('/api/test')

    expect(res.status).toBe(200)

    const messages = (await res.json()) as Array<{ message: string }>
    expect(messages.some((m) => m.message === 'Integrationstest')).toBe(true)
  })
})