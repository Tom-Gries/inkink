import { describe, expect, it } from 'vitest'
import {
  getVisibleInkRoutes,
  registerInkRoutes,
  resolveInkRoute,
} from './registry'

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
    expect(() => resolveInkRoute('gibts.nicht')).toThrowError(
      /registry-test\.a/,
    )
  })
})

describe('getVisibleInkRoutes', () => {
  it('liefert nur Routen mit nav.visible: true', () => {
    registerInkRoutes('visible-test', [
      { name: 'hidden', path: '/hidden', nav: { visible: false } },
      { name: 'shown', path: '/shown', nav: { visible: true } },
      { name: 'no-nav', path: '/no-nav' },
    ])

    const refs = getVisibleInkRoutes()
      .filter((route) => route.inkName === 'visible-test')
      .map((route) => route.ref)
    expect(refs).toEqual(['visible-test.shown'])
  })

  it('sortiert aufsteigend nach weight – höhere Zahl weiter unten', () => {
    registerInkRoutes('weight-test', [
      { name: 'a', path: '/a', nav: { visible: true, weight: 2 } },
      { name: 'b', path: '/b', nav: { visible: true, weight: 0 } },
      { name: 'c', path: '/c', nav: { visible: true, weight: 1 } },
    ])

    const refs = getVisibleInkRoutes()
      .filter((route) => route.inkName === 'weight-test')
      .map((route) => route.ref)
    expect(refs).toEqual(['weight-test.b', 'weight-test.c', 'weight-test.a'])
  })

  it('behält Registrierungsreihenfolge, wenn kein weight gesetzt ist', () => {
    registerInkRoutes('weight-default-test', [
      { name: 'a', path: '/a', nav: { visible: true } },
      { name: 'b', path: '/b', nav: { visible: true } },
      { name: 'c', path: '/c', nav: { visible: true } },
    ])

    const refs = getVisibleInkRoutes()
      .filter((route) => route.inkName === 'weight-default-test')
      .map((route) => route.ref)
    expect(refs).toEqual([
      'weight-default-test.a',
      'weight-default-test.b',
      'weight-default-test.c',
    ])
  })

  it('mischt negative Gewichte, ungewichtete und positive Gewichte', () => {
    registerInkRoutes('weight-mixed-test', [
      { name: 'a', path: '/a', nav: { visible: true, weight: 1 } },
      { name: 'b', path: '/b', nav: { visible: true } },
      { name: 'c', path: '/c', nav: { visible: true, weight: -1 } },
      { name: 'd', path: '/d', nav: { visible: true } },
    ])

    const refs = getVisibleInkRoutes()
      .filter((route) => route.inkName === 'weight-mixed-test')
      .map((route) => route.ref)
    expect(refs).toEqual([
      'weight-mixed-test.c',
      'weight-mixed-test.b',
      'weight-mixed-test.d',
      'weight-mixed-test.a',
    ])
  })
})
