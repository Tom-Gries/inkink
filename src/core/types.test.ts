import { describe, expect, it } from 'vitest'
import type { RouteRef } from './index'

describe('RouteRegistry', () => {
  it('akzeptiert per Module Augmentation registrierte Route-Referenzen', () => {
    const ref: RouteRef = 'learnink.stacks'

    expect(ref).toBe('learnink.stacks')
  })

  it('lehnt nicht registrierte Route-Referenzen zur Compile-Zeit ab', () => {
    const ref = 'learnink.stacks' as RouteRef

    expect(ref).toBeTypeOf('string')
    // @ts-expect-error – "gibts.nicht" ist nicht im RouteRegistry augmentiert
    const invalid: RouteRef = 'gibts.nicht'
    expect(invalid).toBeTypeOf('string')
  })
})
