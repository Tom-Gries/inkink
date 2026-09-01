// @vitest-environment node
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import app from '../../index'

// Lädt apps/api/.env, damit Integrationstests gegen die Dev-Datenbank laufen.
config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) })

const createdIds: string[] = []

afterAll(async () => {
  // Best-Effort-Aufräumen, falls ein Test mittendrin scheitert.
  for (const id of createdIds) {
    try {
      await app.request(`/api/projects/${id}`, { method: 'DELETE' })
    } catch {
      // Aufräumen darf nicht scheitern.
    }
  }
})

interface ProjectJson {
  id: string
  name: string
  description?: string
}

describe.skipIf(!process.env.MONGODB_URI)('Projects CRUD (Integration)', () => {
  it('erstellt ein Projekt (201)', async () => {
    const res = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Testprojekt',
        description: 'Vom Integrationstest angelegt.',
      }),
    })

    expect(res.status).toBe(201)

    const project = (await res.json()) as ProjectJson
    createdIds.push(project.id)
    expect(project.name).toBe('Testprojekt')
  })

  it('listet Projekte inklusive des neuen Projekts (200)', async () => {
    const res = await app.request('/api/projects')

    expect(res.status).toBe(200)

    const projects = (await res.json()) as ProjectJson[]
    expect(projects.some((p) => createdIds.includes(p.id))).toBe(true)
  })

  it('liefert das Projekt per ID (200)', async () => {
    const res = await app.request(`/api/projects/${createdIds[0]}`)

    expect(res.status).toBe(200)

    const project = (await res.json()) as ProjectJson
    expect(project.id).toBe(createdIds[0])
  })

  it('aktualisiert das Projekt per PATCH (200)', async () => {
    const res = await app.request(`/api/projects/${createdIds[0]}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Aktualisiert.' }),
    })

    expect(res.status).toBe(200)

    const project = (await res.json()) as ProjectJson
    expect(project.description).toBe('Aktualisiert.')
    expect(project.name).toBe('Testprojekt')
  })

  it('liefert 400 bei ungültigem JSON-Body', async () => {
    const res = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    })

    expect(res.status).toBe(400)

    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('liefert 400 bei ungültiger ID', async () => {
    const res = await app.request('/api/projects/keine-gueltige-id')

    expect(res.status).toBe(400)
  })

  it('liefert 404 für unbekannte, aber gültige ID', async () => {
    const res = await app.request('/api/projects/507f1f77bcf86cd799439011')

    expect(res.status).toBe(404)
  })

  it('löscht das Projekt (204) und liefert danach 404', async () => {
    const res = await app.request(`/api/projects/${createdIds[0]}`, { method: 'DELETE' })

    expect(res.status).toBe(204)

    const resAfter = await app.request(`/api/projects/${createdIds[0]}`)
    expect(resAfter.status).toBe(404)
  })
})