import { Bold, List, ListOrdered, Quote } from 'lucide-react'
import { type ReactNode, useRef } from 'react'
import { useTranslations } from '../../i18n/index'
import { Textarea } from '../../ui/index'

interface RichTextAreaProps {
  label: ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function getLineStart(text: string, index: number): number {
  return text.lastIndexOf('\n', index - 1) + 1
}

function getLineEnd(text: string, index: number): number {
  const next = text.indexOf('\n', index)
  return next === -1 ? text.length : next
}

/**
 * Textarea mit Mini-Formatierungsleiste für die „Lösung / Erklärung“.
 * Fügt ein begrenztes Markdown-Subset ein, das `RichText` rendert:
 * Fett, Aufzählung, Nummerierung und Einrückung/Zitat.
 */
export function RichTextArea({
  label,
  value,
  onChange,
  placeholder,
}: RichTextAreaProps) {
  const t = useTranslations()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function apply(next: string, start: number, end: number) {
    onChange(next)
    // Nach dem Re-Render (Controlled Component) Fokus und Auswahl wiederherstellen.
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(start, end)
    })
  }

  function wrapBold() {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart: start, selectionEnd: end } = textarea
    const selected = value.slice(start, end)
    if (selected.length === 0) {
      apply(
        `${value.slice(0, start)}****${value.slice(end)}`,
        start + 2,
        start + 2,
      )
      return
    }
    apply(
      `${value.slice(0, start)}**${selected}**${value.slice(end)}`,
      start + 2,
      start + 2 + selected.length,
    )
  }

  /** Fügt ein Präfix an allen betroffenen Zeilen ein oder entfernt es wieder. */
  function togglePrefix(prefix: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart: start, selectionEnd: end } = textarea
    const target = end === start ? start : end - 1
    const blockStart = getLineStart(value, start)
    const blockEnd = getLineEnd(value, target)
    const block = value.slice(blockStart, blockEnd)
    const lines = block.split('\n')
    const active = lines.every((line) => line.startsWith(prefix))
    const nextLines = lines.map((line) => {
      if (active) {
        return line.startsWith(prefix) ? line.slice(prefix.length) : line
      }
      return line.trim().length === 0 ? line : `${prefix}${line}`
    })
    const nextBlock = nextLines.join('\n')
    const next = `${value.slice(0, blockStart)}${nextBlock}${value.slice(blockEnd)}`
    const offset = nextBlock.length - block.length
    apply(next, start, end + offset)
  }

  const tools = [
    {
      label: t('learnink.editor.explanationBold'),
      icon: Bold,
      action: wrapBold,
    },
    {
      label: t('learnink.editor.explanationBullets'),
      icon: List,
      action: () => togglePrefix('- '),
    },
    {
      label: t('learnink.editor.explanationNumbers'),
      icon: ListOrdered,
      action: () => togglePrefix('1. '),
    },
    {
      label: t('learnink.editor.explanationQuote'),
      icon: Quote,
      action: () => togglePrefix('> '),
    },
  ]

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              aria-label={tool.label}
              title={tool.label}
              onClick={tool.action}
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <tool.icon className="size-4" />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs leading-5 text-muted-foreground">
        {t('learnink.editor.explanationHint')}
      </p>
    </div>
  )
}
