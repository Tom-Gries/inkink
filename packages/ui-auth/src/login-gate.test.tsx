import { fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from '@inkink/i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authClient = vi.hoisted(() => ({
  getSession: vi.fn(),
  signIn: { social: vi.fn() },
  signOut: vi.fn(),
}))

vi.mock('@inkink/api', () => ({
  authClient,
  authLog: vi.fn(),
  authWarn: vi.fn(),
  authError: vi.fn(),
}))

import { LoginGate } from './login-gate'
import { useAuthStore } from './store'
import { authTranslations } from './translations'

function renderGate() {
  return render(
    <I18nProvider locale="de" translations={authTranslations}>
      <LoginGate />
    </I18nProvider>,
  )
}

describe('LoginGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'unauthenticated',
      error: null,
      loginRequired: true,
      // Der Auth-Guard meldet das Ziel als RELATIVEN Pfad (location.href).
      pendingTarget: '/startink/ziel',
    })
  })

  it('zeigt den Google-Login, wenn keine Session besteht', () => {
    renderGate()

    expect(
      screen.getByRole('button', { name: 'Mit Google anmelden' }),
    ).toBeTruthy()
  })

  it('übergibt das Ziel als ABSOLUTE URL auf den Web-Origin (relativer pendingTarget → localhost:3000) an Google', () => {
    renderGate()

    fireEvent.click(
      screen.getByRole('button', { name: 'Mit Google anmelden' }),
    )

    // Kein relativer callbackURL: Sonst würde Better Auth den Redirect
    // nach dem Login relativ zur API-Base (localhost:8787) auflösen.
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: 'http://localhost:3000/startink/ziel',
    })
  })

  it('übergibt eine bereits absolute Ziel-URL unverändert', () => {
    useAuthStore.setState({ pendingTarget: 'http://localhost:3000/foo' })

    renderGate()
    fireEvent.click(
      screen.getByRole('button', { name: 'Mit Google anmelden' }),
    )

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: 'http://localhost:3000/foo',
    })
  })

  it('zeigt den Prüf-Hinweis, solange die Session geladen wird', () => {
    useAuthStore.setState({ status: 'loading' })

    renderGate()

    expect(screen.getByText(/Anmeldestatus wird geprüft/)).toBeTruthy()
  })
})