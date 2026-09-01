import type { Definition } from '@inkink/core'
import { createRootRoute } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { createInkRouter } from './index'

const testInk: Definition = {
  name: 'routing-test',
  routes: [
    { name: 'seite', path: '/routing-test/seite', component: () => null },
  ],
  translations: { de: {}, en: {} },
}

describe('createInkRouter', () => {
  it('erstellt einen Router, der Home- und Ink-Routen auflöst', async () => {
    const rootRoute = createRootRoute({ component: () => null })
    const router = createInkRouter(rootRoute, [testInk])

    await router.navigate({ to: '/' })
    expect(router.state.location.pathname).toBe('/')

    await router.navigate({ to: '/routing-test/seite' })
    expect(router.state.location.pathname).toBe('/routing-test/seite')
  })

  it('konfiguriert Preloading und Scroll-Restoration', () => {
    const rootRoute = createRootRoute({ component: () => null })
    const router = createInkRouter(rootRoute, [testInk])

    expect(router.options.scrollRestoration).toBe(true)
    expect(router.options.defaultPreload).toBe('intent')
  })
})