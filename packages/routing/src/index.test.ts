import type { Definition, RouteGuard } from '@inkink/core'
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
    const router = createInkRouter(rootRoute, [testInk], {
      // testInk hat keinen Route-Guard – isAuthenticated darf nie
      // aufgerufen werden und schlägt sonst bewusst fehl.
      isAuthenticated: () => {
        throw new Error(
          'isAuthenticated darf ohne Route-Guard nicht aufgerufen werden',
        )
      },
    })

    await router.navigate({ to: '/' })
    expect(router.state.location.pathname).toBe('/')

    await router.navigate({ to: '/routing-test/seite' })
    expect(router.state.location.pathname).toBe('/routing-test/seite')
  })

  it('konfiguriert Preloading und Scroll-Restoration', () => {
    const rootRoute = createRootRoute({ component: () => null })
    const router = createInkRouter(rootRoute, [testInk], {
      // testInk hat keinen Route-Guard – isAuthenticated darf nie
      // aufgerufen werden und schlägt sonst bewusst fehl.
      isAuthenticated: () => {
        throw new Error(
          'isAuthenticated darf ohne Route-Guard nicht aufgerufen werden',
        )
      },
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

  function createGuardRouter(ink: Definition, authenticated: boolean) {
    return createInkRouter(createRootRoute({ component: () => null }), [ink], {
      isAuthenticated: () => authenticated,
      loginPath: '/',
    })
  }

  it('leitet nicht authentifizierte Benutzer bei guard: auth zum Login-/Startziel weiter', async () => {
    const router = createGuardRouter(guardInk('auth'), false)

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/')
  })

  it('blockiert guard: none den Zugriff nicht, wenn der Benutzer nicht authentifiziert ist', async () => {
    const router = createGuardRouter(guardInk(undefined, 'none'), false)

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/guard-test/seite')
  })

  it('erlaubt authentifizierten Benutzern den Zugriff auf guard: auth', async () => {
    const router = createGuardRouter(guardInk('auth'), true)

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/guard-test/seite')
  })

  it('erbt die Route den Auth-Guard des Inks, wenn sie keinen eigenen Guard besitzt', async () => {
    // Ink hat guard: 'auth', Route ohne eigenen Guard – async-Fall (Promise).
    const router = createInkRouter(
      createRootRoute({ component: () => null }),
      [guardInk('auth')],
      {
        isAuthenticated: async () => false,
        loginPath: '/',
      },
    )

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/')
  })

  it('überschreibt der Routen-Guard den Ink-Guard (guard: none → öffentlich)', async () => {
    const router = createGuardRouter(guardInk('auth', 'none'), false)

    await router.navigate({ to: '/guard-test/seite' })

    expect(router.state.location.pathname).toBe('/guard-test/seite')
  })
})