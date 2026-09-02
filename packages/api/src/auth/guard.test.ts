import { describe, expect, it, vi } from 'vitest'

const getSession = vi.hoisted(() => vi.fn())

vi.mock('better-auth/react', () => ({
  createAuthClient: vi.fn(() => ({ getSession })),
}))

vi.mock('../client', () => ({
  getApiBaseUrl: () => 'http://test.local',
}))

import { isAuthenticated } from './guard'

describe('isAuthenticated', () => {
  it('liefert true bei einer Session mit Benutzer', async () => {
    getSession.mockResolvedValue({
      data: {
        session: { id: 's1' },
        user: { id: 'u1', name: 'Tom', email: 'tom@example.com' },
      },
      error: null,
    })

    await expect(isAuthenticated()).resolves.toBe(true)
    expect(getSession).toHaveBeenCalledOnce()
  })

  it('liefert false ohne Session', async () => {
    getSession.mockResolvedValue({ data: null, error: null })

    await expect(isAuthenticated()).resolves.toBe(false)
  })

  it('liefert false, wenn der Session-Request fehlschlägt (fail-closed)', async () => {
    getSession.mockRejectedValue(new Error('API nicht erreichbar'))

    await expect(isAuthenticated()).resolves.toBe(false)
  })
})