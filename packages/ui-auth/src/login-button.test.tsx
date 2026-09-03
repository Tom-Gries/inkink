import { I18nProvider } from '@inkink/i18n'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authClient = vi.hoisted(() => ({
  getSession: vi.fn(),
  signIn: { social: vi.fn() },
  signOut: vi.fn(),
}))

vi.mock('@inkink/api', () => ({ authClient }))

import { LoginButton } from './login-button'
import { useAuthStore } from './store'
import { authTranslations } from './translations'

function renderButton(children?: React.ReactNode) {
  return render(
    <I18nProvider locale="de" translations={authTranslations}>
      <LoginButton>{children}</LoginButton>
    </I18nProvider>,
  )
}

describe('LoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      status: 'unauthenticated',
      error: null,
      loginRequired: false,
      pendingTarget: null,
    })
  })

  it('zeigt das Google-Label bzw. ein überschreibendes Label', () => {
    renderButton()
    expect(
      screen.getByRole('button', { name: 'Mit Google anmelden' }),
    ).toBeTruthy()

    renderButton('Anmelden')
    expect(screen.getByRole('button', { name: 'Anmelden' })).toBeTruthy()
  })

  it('deaktiviert den Button, solange die Session geladen wird', () => {
    useAuthStore.setState({ status: 'loading' })

    renderButton()

    const button = screen.getByRole('button', {
      name: 'Mit Google anmelden',
    }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('startet den Google-Flow mit ABSOLUTER Ziel-URL auf den Web-Origin', () => {
    useAuthStore.setState({ pendingTarget: '/guard-test/seite' })

    renderButton()
    fireEvent.click(screen.getByRole('button', { name: 'Mit Google anmelden' }))

    // Relativer pendingTarget → absolut auf localhost:3000 (Web-Origin).
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: 'http://localhost:3000/guard-test/seite',
    })
  })
})
