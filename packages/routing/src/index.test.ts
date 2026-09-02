import type { Definition, RouteGuard } from '@inkink/core'
import { createRootRoute } from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { createInkRouter } from './index'

const testInk: Definition = {
  name: 'routing-test',
  routes: [
    { name: 'seite', path: '/routing-test/seite', component: () => null },
  ],
  translations: { de: {}, en: {} },
}

function throwingIsAuthenticated(): boolean {
  throw new Error(
    'isAuthenticated darf ohne Route-Guard nicht aufgerufen werden',
  )
}

describe('createInkRouter', () => {
  it('erstellt einen Router, der Home- und Ink-Routen auflöst', async () => {
    const rootRoute = createRootRoute({ component: () => null })
    const router = createInkRouter(rootRoute, [testInk], {
      isAuthenticated: throwingIsAuthenticated,
    })

    await router.navigate({ to: '/' })
    expect(router.state.location.pathname).toBe('/')

    await router.navigate({ to: '/routing-test/seite' })
    expect(router.state.location.pathname).toBe('/routing-test/seite')
  })

  it('konfiguriert Preloading und Scroll-Restoration', () => {
    const rootRoute = createRootRoute({ component: () => null })
    const router = createInkRouter(rootRoute, [testInk], {
      isAuthenticated: throwingIsAuthenticated,
    })

    expect(router.options.scrollRestoration).toBe(true)
    expect(router.options.defaultPreload).toBe('intent')
  })
})

describe('Route Guards', () => {
  function guardInk(inkGuard?: RouteGuard, routeGuard?: RouteGuard): Definition {
    return {
      name: 'guard-test',
      guard: inkGuard,
      routes: [
        {
          name: 'seite',
          path: '/guard-test/seite',
          guard: routeGuard,
          component: () => null,
        },
      ],
      translations: { de: {}, en: {} },
    }
  }

  function createGuardRouter(
    ink: Definition,
    authenticated: boolean,
    onAuthRequired = vi.fn(),
  ) {
    return createInkRouter(createRootRoute({ component: () => null }), [ink], {
      isAuthenticated: () => authenticated,
      onAuthRequired,
    })
  }

  it('ruft onAuthRequired bei nicht authentifiziertem Zugriff auf eine geschützte Route auf und lässt die URL unverändert', async () => {
    // Ink hat guard: 'auth', Route ohne eigenen Guard → erbt den Guard.
    // isAuthenticated ist async (Promise) – wie in der echten App.
    const onAuthRequired = vi.fn()
    const router = createInkRouter(
      createRootRoute({ component: () => null }),
      [guardInk('auth')],
      {
        isAuthenticated: async () => false,
        onAuthRequired,
      },
    )

    await router.navigate({ to: '/guard-test/seite' })

    // Kein Redirect: URL bleibt unverändert.
    expect(router.state.location.pathname).toBe('/guard-test/seite')

    expect(onAuthRequired).toHaveBeenCalledOnce()
    expect(String(onAuthRequired.mock.calls[0]?.[0])).toContain(
      '/guard-test/seite',
    )
  })

  it('ruft onAuthRequired nicht bei authentifiziertem Zugriff auf', async () => {
    const onAuthRequired = vi.fn()
    const router = createGuardRouter(guardInk('auth'), true, onAuthRequired)

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/guard-test/seite')
    expect(onAuthRequired).not.toHaveBeenCalled()
  })

  it('ruft onAuthRequired nicht bei guard: none auf', async () => {
    const onAuthRequired = vi.fn()
    const router = createGuardRouter(
      guardInk(undefined, 'none'),
      false,
      onAuthRequired,
    )

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/guard-test/seite')
    expect(onAuthRequired).not.toHaveBeenCalled()
  })

  it('überschreibt der Routen-Guard den Ink-Guard (guard: none → öffentlich)', async () => {
    const onAuthRequired = vi.fn()
    const router = createGuardRouter(
      guardInk('auth', 'none'),
      false,
      onAuthRequired,
    )

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/guard-test/seite')
    expect(onAuthRequired).not.toHaveBeenCalled()
  })
})