import { render, screen } from '@testing-library/react'
import { I18nProvider } from '@inkink/i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authClient = vi.hoisted(() => ({
  getSession: vi.fn(),
  signIn: { social: vi.fn() },
  signOut: vi.fn(),
}))

vi.mock('./client', () => ({ authClient }))
vi.mock('better-auth/react', () => ({
  createAuthClient: vi.fn(() => authClient),
}))

import { AuthProvider } from './auth-provider'
import { useAuthStore } from './store'
import { authTranslations } from './translations'

function renderProvider(children: React.ReactNode) {
  return render(
    <I18nProvider locale="de" translations={authTranslations}>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'idle',
      error: null,
      loginRequired: true,
      pendingTarget: 'http://localhost:3000/startink/ziel',
    })
  })

  it('zeigt das LoginGate statt des Inhalts, wenn die Route geschützt ist und keine Session besteht', async () => {
    authClient.getSession.mockResolvedValue({ data: null, error: null })

    renderProvider('geschützter Inhalt')

    expect(
      await screen.findByRole('button', { name: 'Mit Google anmelden' }),
    ).toBeTruthy()
    expect(screen.queryByText('geschützter Inhalt')).toBeNull()
  })

  it('rendert den Inhalt, sobald eine gültige Session vorliegt (Gate schließt sich)', async () => {
    authClient.getSession.mockResolvedValue({
      data: {
        session: { id: 's1' },
        user: { id: 'u1', name: 'Tom', email: 'tom@example.com', image: null },
      },
      error: null,
    })

    renderProvider('geschützter Inhalt')

    expect(await screen.findByText('geschützter Inhalt')).toBeTruthy()
  })
})