import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../../i18n/index'
import { translations } from '../translations'

const state = vi.hoisted(() => ({
  create: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('../../../api/index', () => ({
  useFeelings: () => ({ data: [], isLoading: false, isError: false }),
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

describe('Feelink entry creation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('speichert ausgewählte Gefühle ohne zusätzliche Checkbox und leert das Formular', () => {
    show()
    const save = screen.getByRole('button', { name: 'Feel' })
    expect(save).toHaveProperty('disabled', true)
    expect(screen.queryByRole('checkbox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Fröhlich' }))
    expect(save).toHaveProperty('disabled', false)
    fireEvent.click(save)
    expect(state.create).toHaveBeenCalledWith(
      {
        moods: ['happy'],
        note: '',
      },
      expect.any(Object),
    )
    act(() => state.create.mock.calls[0][1].onSuccess())
    expect(save).toHaveProperty('disabled', true)
    expect(
      screen
        .getByRole('button', { name: 'Fröhlich' })
        .getAttribute('aria-pressed'),
    ).toBe('false')
  })
})
