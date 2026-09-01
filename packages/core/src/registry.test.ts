import { describe, expect, it } from 'vitest'
import { registerInkRoutes, resolveInkRoute } from './registry'

describe('registerInkRoutes', () => {
  it('registriert Routen als "<ink-name>.<route-name>"', () => {
    registerInkRoutes('registry-test', [
      { name: 'a', path: '/registry-test/a' },
      { name: 'b', path: '/registry-test/b' },
    ])

    expect(resolveInkRoute('registry-test.a')).toBe('/registry-test/a')
    expect(resolveInkRoute('registry-test.b')).toBe('/registry-test/b')
  })

  it('ergänzt weitere Inks, ohne bestehende Einträge zu verlieren', () => {
    registerInkRoutes('registry-test-2', [{ name: 'only', path: '/zwei' }])

    expect(resolveInkRoute('registry-test.a')).toBe('/registry-test/a')
    expect(resolveInkRoute('registry-test-2.only')).toBe('/zwei')
  })

  it('überschreibt dieselbe Referenz bei erneuter Registrierung', () => {
    registerInkRoutes('registry-test-3', [{ name: 'r', path: '/alt' }])
    registerInkRoutes('registry-test-3', [{ name: 'r', path: '/neu' }])

    expect(resolveInkRoute('registry-test-3.r')).toBe('/neu')
  })
})

describe('resolveInkRoute', () => {
  it('wirft für unbekannte Referenzen einen Fehler mit Hinweis auf die registrierten Routen', () => {
    expect(() => resolveInkRoute('gibts.nicht')).toThrowError(
      /Unbekannte Ink-Route "gibts\.nicht"/,
    )
    expect(() => resolveInkRoute('gibts.nicht')).toThrowError(/registry-test\.a/)
  })
})