import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/errors'
import { I18nProvider } from '../../../i18n/index'
import { translations } from '../translations'

const actions = vi.hoisted(() => ({
  deleteOwnAccount: vi.fn(),
  exportOwnData: vi.fn(),
  clear: vi.fn(),
  navigate: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

vi.mock('../../../api/resources/me', () => ({
  deleteOwnAccount: actions.deleteOwnAccount,
  exportOwnData: actions.exportOwnData,
}))
vi.mock('../../../ui-auth/index', () => ({
  useAuthStore: { getState: () => actions },
}))
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => actions.navigate,
}))

import { DataControls } from './data-controls'

function setup() {
  const queryClient = new QueryClient()
  queryClient.setQueryData(['feelings'], [{ note: 'private note' }])
  render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale="de" translations={translations}>
        <DataControls />
      </I18nProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

describe('DataControls', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('verlangt Bestätigung und leert nach Kontolöschung den privaten Query-Cache', async () => {
    actions.deleteOwnAccount.mockResolvedValue(undefined)
    const queryClient = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Konto löschen' }))
    const confirm = screen.getByRole('button', { name: 'Endgültig löschen' })
    expect(confirm).toHaveProperty('disabled', true)
    expect(actions.deleteOwnAccount).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Zum Bestätigen LÖSCHEN eingeben'), {
      target: { value: 'LÖSCHEN' },
    })
    fireEvent.click(confirm)
    await waitFor(() => expect(actions.clear).toHaveBeenCalledOnce())
    expect(actions.deleteOwnAccount).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(['feelings'])).toBeUndefined()
    expect(actions.navigate).toHaveBeenCalledWith({ to: '/' })
  })

  it('fordert bei einer alten Sitzung eine neue Anmeldung und löscht nicht den lokalen Stand', async () => {
    actions.deleteOwnAccount.mockRejectedValue(
      new ApiError('Sign in again', 'RECENT_LOGIN_REQUIRED', 403),
    )
    const queryClient = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Konto löschen' }))
    fireEvent.change(screen.getByLabelText('Zum Bestätigen LÖSCHEN eingeben'), {
      target: { value: 'LÖSCHEN' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Endgültig löschen' }))
    expect(
      await screen.findByRole('button', { name: 'Erneut anmelden' }),
    ).toBeTruthy()
    expect(actions.clear).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(['feelings'])).toEqual([
      { note: 'private note' },
    ])
    expect(actions.signOut).not.toHaveBeenCalled()
  })

  it('zeigt einen fehlgeschlagenen Export als Fehler an', async () => {
    actions.exportOwnData.mockRejectedValue(new Error('No session'))
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Daten herunterladen' }))
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Der Download ist fehlgeschlagen. Bitte erneut versuchen.',
    )
    expect(actions.deleteOwnAccount).not.toHaveBeenCalled()
  })
})
