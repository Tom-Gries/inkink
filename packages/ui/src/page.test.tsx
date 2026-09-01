import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Page, PageTitle } from './page'

describe('Page', () => {
  it('rendert ein main-Element mit dem Zentrierungs-Layout', () => {
    render(
      <Page>
        <span>Inhalt</span>
      </Page>,
    )

    const main = screen.getByText('Inhalt').closest('main')
    expect(main).not.toBeNull()
    expect(main?.className).toContain('flex')
    expect(main?.className).toContain('min-h-screen')
    expect(main?.className).toContain('items-center')
  })
})

describe('PageTitle', () => {
  it('rendert eine h1-Überschrift', () => {
    render(<PageTitle>Titel</PageTitle>)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBe('Titel')
    expect(heading.className).toContain('text-4xl')
    expect(heading.className).toContain('font-bold')
  })
})