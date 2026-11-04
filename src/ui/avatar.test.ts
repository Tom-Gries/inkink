import { describe, expect, it } from 'vitest'
import { getLocalAvatarSrc } from './avatar'

describe('Avatar privacy', () => {
  it.each([
    'https://lh3.googleusercontent.com/avatar',
    '//example.com/avatar',
    '/\\example.com/avatar',
    '/\n/example.com/avatar',
    '/local/..//tracker.example/pixel',
    'https://inkink.invalid//tracker.example/pixel',
    'data:image/svg+xml,<svg/>',
    'javascript:alert(1)',
  ])('lädt kein fremdes oder aktives Bild: %s', (src) => {
    expect(getLocalAvatarSrc(src)).toBeUndefined()
  })

  it('erlaubt normalisierte lokale Bilder', () => {
    expect(getLocalAvatarSrc('/images/avatar.png')).toBe('/images/avatar.png')
    expect(getLocalAvatarSrc('images/../avatar.png')).toBe('/avatar.png')
  })
})
