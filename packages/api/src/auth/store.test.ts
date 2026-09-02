import { beforeEach, describe, expect, it, vi } from 'vitest'

const authClient = vi.hoisted(() => ({
  getSession: vi.fn(),
  signIn: { social: vi.fn() },
  signOut: vi.fn(),
}))

vi.mock('./client', () => ({ authClient }))

import { useAuthStore } from './store'

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'idle',
      error: null,
      loginRequired: false,
      pendingTarget: null,
    })
  })

  it('refresh setzt authenticated und den Benutzer bei gültiger Session und leert das LoginGate-Flag', async () => {
    authClient.getSession.mockResolvedValue({
      data: {
        session: { id: 's1' },
        user: {
          id: 'u1',
          name: 'Tom',
          email: 'tom@example.com',
          image: null,
        },
      },
      error: null,
    })

    // Gate-Flag zuvor gesetzt (z. B. vom Auth-Guard gemeldet).
    useAuthStore.setState({
      loginRequired: true,
      pendingTarget: 'http://localhost:3000/startink/ziel',
    })

    await expect(useAuthStore.getState().refresh()).resolves.toBe(true)

    const state = useAuthStore.getState()
    expect(state.status).toBe('authenticated')
    expect(state.user).toEqual({
      id: 'u1',
      name: 'Tom',
      email: 'tom@example.com',
      image: null,
    })
    expect(state.error).toBeNull()
    expect(state.loginRequired).toBe(false)
  })

  it('refresh setzt unauthenticated ohne Session', async () => {
    authClient.getSession.mockResolvedValue({ data: null, error: null })

    await expect(useAuthStore.getState().refresh()).resolves.toBe(false)

    const state = useAuthStore.getState()
    expect(state.status).toBe('unauthenticated')
    expect(state.user).toBeNull()
  })

  it('refresh ist fail-closed, wenn der Session-Request fehlschlägt', async () => {
    authClient.getSession.mockRejectedValue(new Error('API nicht erreichbar'))

    await expect(useAuthStore.getState().refresh()).resolves.toBe(false)

    const state = useAuthStore.getState()
    expect(state.status).toBe('unauthenticated')
    expect(state.user).toBeNull()
    expect(state.error).toBe('API nicht erreichbar')
  })

  it('signInWithGoogle startet den Google-Flow mit dem angegebenen callbackURL', async () => {
    await useAuthStore
      .getState()
      .signInWithGoogle('http://localhost:3000/startink/ziel')

    expect(authClient.signIn.social).toHaveBeenCalledOnce()
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: 'http://localhost:3000/startink/ziel',
    })
  })

  it('signOut meldet ab und leert den Store', async () => {
    useAuthStore.setState({
      user: { id: 'u1', name: null, email: null },
      status: 'authenticated',
    })
    authClient.signOut.mockResolvedValue(undefined)

    await useAuthStore.getState().signOut()

    expect(authClient.signOut).toHaveBeenCalledOnce()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.status).toBe('unauthenticated')
  })

  it('requireLogin setzt loginRequired und das Ziel für den Login', () => {
    useAuthStore
      .getState()
      .requireLogin('http://localhost:3000/startink/ziel')

    const state = useAuthStore.getState()
    expect(state.loginRequired).toBe(true)
    expect(state.pendingTarget).toBe('http://localhost:3000/startink/ziel')
  })

  it('resetRequestState setzt die request-relevanten Auth-Flags zurück', () => {
    useAuthStore.setState({
      loginRequired: true,
      pendingTarget: 'http://localhost:3000/startink/ziel',
    })

    useAuthStore.getState().resetRequestState()

    const state = useAuthStore.getState()
    expect(state.loginRequired).toBe(false)
    expect(state.pendingTarget).toBeNull()
  })
})