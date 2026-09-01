import { defineInk } from '@inkink/core'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { Link } from './link'

declare module '@inkink/core' {
  interface RouteRegistry {
    'link-test.ziel': '/link-test/ziel'
  }
}

defineInk({
  name: 'link-test',
  routes: [{ name: 'ziel', path: '/link-test/ziel', component: () => null }],
  translations: { de: {}, en: {} },
})

async function renderWithRouter(ui: ReactElement) {
  const rootRoute = createRootRoute({ component: () => ui })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory(),
  })
  await router.load()

  return render(<RouterProvider router={router} />)
}

describe('Link', () => {
  it('rendert Kinder als Anker mit der aufgelösten Ink-Route', async () => {
    await renderWithRouter(<Link to="link-test.ziel">Weiter</Link>)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/link-test/ziel')
    expect(link.textContent).toBe('Weiter')
    expect(link.querySelector('svg')).toBeNull()
  })

  it('platziert das Icon bei type="next" nach dem Text', () => {
    render(
      <Link render={<a href="#x" />} type="next">
        Weiter
      </Link>,
    )

    const link = screen.getByRole('link')
    expect(link.querySelector('svg')).not.toBeNull()
    expect(link.lastElementChild?.tagName).toBe('svg')
  })

  it('platziert das Icon bei type="back" vor dem Text', () => {
    render(
      <Link render={<a href="#x" />} type="back">
        Zurück
      </Link>,
    )

    const link = screen.getByRole('link')
    expect(link.firstElementChild?.tagName).toBe('svg')
  })

  it('vereint Basis-Klassen, Variante und eigene className', () => {
    render(
      <Link render={<a href="#x" />} variant="outline" className="meine-klasse">
        X
      </Link>,
    )

    const link = screen.getByRole('link')
    expect(link.className).toContain('meine-klasse')
    expect(link.className).toContain('inline-flex')
    expect(link.className).toContain('border-input')
    expect(link.className).not.toContain('bg-primary')
  })
})