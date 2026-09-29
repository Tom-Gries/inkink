import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RichText } from './rich-text'

describe('RichText', () => {
  it('rendert **fett** und *kursiv*', () => {
    const { container } = render(<RichText text="**fett** und *kursiv*" />)
    expect(container.querySelector('strong')?.textContent).toBe('fett')
    expect(container.querySelector('em')?.textContent).toBe('kursiv')
  })

  it('rendert Zeilenumbrüche innerhalb eines Absatzes', () => {
    const { container } = render(<RichText text={'Zeile 1\nZeile 2'} />)
    expect(container.querySelectorAll('br')).toHaveLength(1)
  })

  it('rendert Aufzählung, Nummerierung und Zitat', () => {
    const { container } = render(
      <RichText text={'- eins\n- zwei\n\n1. a\n2. b\n\n> Zitat'} />,
    )
    expect(container.querySelectorAll('ul li')).toHaveLength(2)
    expect(container.querySelectorAll('ol li')).toHaveLength(2)
    expect(container.querySelector('blockquote')?.textContent).toBe('Zitat')
  })

  it('gibt Text ohne Markdown unverändert wieder', () => {
    const { container } = render(<RichText text="normaler Text" />)
    expect(container.textContent).toBe('normaler Text')
  })

  it('behandelt leeren Text', () => {
    const { container } = render(<RichText text="" />)
    expect(container.textContent).toBe('')
  })
})
