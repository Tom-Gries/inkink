import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../../i18n/index'
import { translations } from '../translations'

const state = vi.hoisted(() => ({
  enabled: true,
  create: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('../../../api/index', () => ({
  useFeelings: () => ({ data: [], isLoading: false, isError: false }),
  useFeelingsStatus: () => ({
    data: { enabled: state.enabled },
    isLoading: false,
  }),
  useCreateFeeling: () => ({
    mutate: state.create,
    isPending: false,
    isError: false,
  }),
  useDeleteFeeling: () => ({ mutate: state.remove, isPending: false }),
}))

import { FeelView } from './feel'

function show() {
  render(
    <I18nProvider locale="de" translations={translations}>
      <FeelView />
    </I18nProvider>,
  )
}

describe('Feelink consent', () => {
  beforeEach(() => {
    state.enabled = true
    vi.clearAllMocks()
  })

  it('verlangt vor jedem Speichern eine erneute ausdrückliche Einwilligung', () => {
    show()
    fireEvent.click(screen.getByRole('button', { name: 'Fröhlich' }))
    const save = screen.getByRole('button', { name: 'Feel' })
    expect(save).toHaveProperty('disabled', true)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(save).toHaveProperty('disabled', false)
    fireEvent.click(save)
    expect(state.create).toHaveBeenCalledWith(
      {
        moods: ['happy'],
        note: '',
        consent: { granted: true, version: '2026-10-27' },
      },
      expect.any(Object),
    )
    act(() => state.create.mock.calls[0][1].onSuccess())
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', false)
  })

  it('fordert bei gesperrter Speicherung keine sensiblen Eingaben an', () => {
    state.enabled = false
    show()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(
      screen.getByText(
        'Neue Gefühlseinträge sind derzeit nicht verfügbar. Vorhandene Einträge kannst du weiterhin ansehen und löschen.',
      ),
    ).toBeTruthy()
    expect(state.create).not.toHaveBeenCalled()
  })
})
