import type { ReactNode } from 'react'

/**
 * Rendert ein begrenztes Markdown-Subset der „Lösung / Erklärung“ sicher als
 * React-Knoten (ohne dangerouslySetInnerHTML):
 * **fett**, *kursiv*, Zeilenumbrüche, Listen (`- `, `1. `) und Einrückungen
 * als Zitat (`> `).
 */

/** Verarbeitet `**fett**` und `*kursiv*` innerhalb einer Textzeile. */
function renderInline(text: string): ReactNode {
  const bold = text.match(/\*\*([^*]+)\*\*/)
  if (bold) {
    const start = bold.index ?? 0
    return (
      <>
        {text.slice(0, start)}
        <strong>{renderInline(bold[1])}</strong>
        {renderInline(text.slice(start + bold[0].length))}
      </>
    )
  }

  const italic = text.match(/\*([^*]+)\*/)
  if (italic) {
    const start = italic.index ?? 0
    return (
      <>
        {text.slice(0, start)}
        <em>{renderInline(italic[1])}</em>
        {renderInline(text.slice(start + italic[0].length))}
      </>
    )
  }

  return text
}

/** Rendert Block-Zeilen mit <br />-Trennern (index-frei, ohne Keys). */
function renderLines(lines: string[], offset = 0): ReactNode {
  if (offset >= lines.length) return null
  return (
    <>
      {offset > 0 && <br />}
      {renderInline(lines[offset])}
      {renderLines(lines, offset + 1)}
    </>
  )
}

/** Rendert Listen-Items (index-frei, ohne Keys). */
function renderListItems(items: string[], offset = 0): ReactNode {
  if (offset >= items.length) return null
  return (
    <>
      <li>{renderInline(items[offset])}</li>
      {renderListItems(items, offset + 1)}
    </>
  )
}

type RichBlock =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'quote'; lines: string[] }
  | { type: 'bullets'; lines: string[] }
  | { type: 'numbers'; lines: string[] }

/** Zerlegt den Text in Absätze, Zitate, Aufzählungen und Nummerierungen. */
function parseBlocks(text: string): RichBlock[] {
  const blocks: RichBlock[] = []
  let current: RichBlock | null = null

  function flush() {
    if (current) {
      blocks.push(current)
      current = null
    }
  }

  for (const rawLine of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd()
    if (line.trim().length === 0) {
      flush()
      continue
    }

    let type: RichBlock['type'] = 'paragraph'
    let content = line
    if (line.startsWith('> ')) {
      type = 'quote'
      content = line.slice(2)
    } else if (line.startsWith('- ')) {
      type = 'bullets'
      content = line.slice(2)
    } else if (/^\d+\.\s/.test(line)) {
      type = 'numbers'
      content = line.replace(/^\d+\.\s/, '')
    }

    if (!current || current.type !== type) {
      flush()
      current = { type, lines: [content] }
    } else {
      current.lines.push(content)
    }
  }
  flush()
  return blocks
}

function renderBlock(block: RichBlock): ReactNode {
  switch (block.type) {
    case 'quote':
      return (
        <blockquote className="border-l-2 border-border pl-3">
          {renderLines(block.lines)}
        </blockquote>
      )
    case 'bullets':
      return <ul className="list-disc pl-5">{renderListItems(block.lines)}</ul>
    case 'numbers':
      return (
        <ol className="list-decimal pl-5">{renderListItems(block.lines)}</ol>
      )
    case 'paragraph':
      return <p>{renderLines(block.lines)}</p>
  }
}

function renderBlocks(blocks: RichBlock[], offset = 0): ReactNode {
  if (offset >= blocks.length) return null
  return (
    <>
      {renderBlock(blocks[offset])}
      {renderBlocks(blocks, offset + 1)}
    </>
  )
}

export function RichText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  return <div className={className}>{renderBlocks(parseBlocks(text))}</div>
}
