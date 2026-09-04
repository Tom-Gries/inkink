import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  authClient: {
    getSession: vi.fn(),
    signIn: { social: vi.fn() },
    signOut: vi.fn(),
  },
  getApiClient: vi.fn(() => ({})),
  getProfile: vi.fn(async () => null),
  updateProfileUsername: vi.fn(async () => ({ userId: 'u1', username: 'Tom' })),
}))

vi.mock('@inkink/api', () => api)

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
    api.authClient.getSession.mockResolvedValue({
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
      // Kein eigenes Profil vorhanden → Fallback speichert den Vornamen.
      username: 'Tom',
    })
    expect(state.error).toBeNull()
    expect(state.loginRequired).toBe(false)
  })

  it('refresh lädt bei gültiger Session den Benutzernamen aus dem Profil', async () => {
    api.authClient.getSession.mockResolvedValue({
      data: {
        session: { id: 's1' },
        user: {
          id: 'u1',
          name: 'Tom Gries',
          email: 'tom@example.com',
          image: null,
        },
      },
      error: null,
    })
    api.getProfile.mockResolvedValue({ userId: 'u1', username: 'Tom' } as never)

    await useAuthStore.getState().refresh()

    expect(api.getProfile).toHaveBeenCalledWith({})
    expect(useAuthStore.getState().user?.username).toBe('Tom')
  })

  it('refresh übernimmt beim ersten Login den vollen Namen als Benutzername, wenn noch keiner vergeben ist', async () => {
    api.authClient.getSession.mockResolvedValue({
      data: {
        session: { id: 'u1' },
        user: {
          id: 'u1',
          name: 'Tom Gries',
          email: 'tom@example.com',
          image: null,
        },
      },
      error: null,
    })
    // Noch kein Profil vorhanden → getProfile null.
    api.getProfile.mockResolvedValue(null)
    api.updateProfileUsername.mockResolvedValue({
      userId: 'u1',
      username: 'Tom Gries',
    } as never)

    await useAuthStore.getState().refresh()

    // Voller Name automatisch als Benutzername gespeichert.
    expect(api.updateProfileUsername).toHaveBeenCalledWith({}, 'Tom Gries')
    expect(useAuthStore.getState().user?.username).toBe('Tom Gries')
  })

  it('refresh überschreibt einen bereits vergebenen Benutzernamen NICHT', async () => {
    api.authClient.getSession.mockResolvedValue({
      data: {
        session: { id: 'u1' },
        user: {
          id: 'u1',
          name: 'Tom Gries',
          email: 'tom@example.com',
          image: null,
        },
      },
      error: null,
    })
    api.getProfile.mockResolvedValue({
      userId: 'u1',
      username: 'tommylein',
    } as never)

    await useAuthStore.getState().refresh()

    expect(api.updateProfileUsername).not.toHaveBeenCalled()
    expect(useAuthStore.getState().user?.username).toBe('tommylein')
  })

  it('refresh setzt unauthenticated ohne Session', async () => {
    api.authClient.getSession.mockResolvedValue({ data: null, error: null })

    await expect(useAuthStore.getState().refresh()).resolves.toBe(false)

    const state = useAuthStore.getState()
    expect(state.status).toBe('unauthenticated')
    expect(state.user).toBeNull()
  })

  it('refresh ist fail-closed, wenn der Session-Request fehlschlägt', async () => {
    api.authClient.getSession.mockRejectedValue(
      new Error('API nicht erreichbar'),
    )

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

    expect(api.authClient.signIn.social).toHaveBeenCalledOnce()
    expect(api.authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: 'http://localhost:3000/startink/ziel',
    })
  })

  it('signOut meldet ab und leert den Store', async () => {
    useAuthStore.setState({
      user: { id: 'u1', name: null, email: null, username: null },
      status: 'authenticated',
    })
    api.authClient.signOut.mockResolvedValue(undefined)

    await useAuthStore.getState().signOut()

    expect(api.authClient.signOut).toHaveBeenCalledOnce()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.status).toBe('unauthenticated')
  })

  it('updateUsername ruft die Profil-API auf und aktualisiert den Benutzer', async () => {
    useAuthStore.setState({
      user: { id: 'u1', name: 'Tom', email: null, username: 'Old' },
      status: 'authenticated',
    })
    api.updateProfileUsername.mockResolvedValue({
      userId: 'u1',
      username: 'Neu',
    } as never)

    await useAuthStore.getState().updateUsername('Neu')

    expect(api.updateProfileUsername).toHaveBeenCalledWith({}, 'Neu')
    expect(useAuthStore.getState().user?.username).toBe('Neu')
  })

  it('updateUsername reicht einen Konflikt (API-Fehler) nach oben weiter', async () => {
    useAuthStore.setState({
      user: { id: 'u1', name: 'Tom', email: null, username: 'Tom' },
      status: 'authenticated',
    })
    api.updateProfileUsername.mockRejectedValue(new Error('vergeben'))

    await expect(
      useAuthStore.getState().updateUsername('Tom2'),
    ).rejects.toThrow('vergeben')
  })

  it('requireLogin setzt loginRequired und das Ziel für den Login', () => {
    useAuthStore.getState().requireLogin('http://localhost:3000/startink/ziel')

    const state = useAuthStore.getState()
    expect(state.loginRequired).toBe(true)
    expect(state.pendingTarget).toBe('http://localhost:3000/startink/ziel')
  })

  it('clearLoginRequired setzt loginRequired und pendingTarget zurück (öffentliche Route)', () => {
    useAuthStore.setState({
      loginRequired: true,
      pendingTarget: 'http://localhost:3000/startink/ziel',
    })

    useAuthStore.getState().clearLoginRequired()

    const state = useAuthStore.getState()
    expect(state.loginRequired).toBe(false)
    expect(state.pendingTarget).toBeNull()
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
