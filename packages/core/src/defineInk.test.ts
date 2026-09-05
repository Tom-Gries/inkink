import { describe, expect, it } from 'vitest'
import { defineInk } from './defineInk'
import { resolveInkRoute } from './registry'

describe('defineInk', () => {
  it('registriert die Routen des Inks und gibt die Definition unverändert zurück', () => {
    const component = () => null
    const definition = defineInk({
      name: 'defineink-test',
      routes: [{ name: 'seite', path: '/defineink-test/seite', component }],
      translations: { de: {}, en: {} },
    })

    expect(definition.name).toBe('defineink-test')
    expect(definition.routes).toHaveLength(1)
    expect(resolveInkRoute('defineink-test.seite')).toBe(
      '/defineink-test/seite',
    )
  })
})
