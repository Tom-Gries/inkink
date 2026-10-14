import { Field } from '@base-ui-components/react/field'
import {
  type ChangeEvent,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
} from 'react'
import { cn } from './cn'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>
  /** Fehlerzustand (z. B. fehlende Pflichtangabe): rot umrandet. */
  invalid?: boolean
}

/**
 * Mehrzeiliges Textfeld, gestylt wie `Input` – für Erklärungen,
 * offene Antworten und andere längere Texte. Das Feld wächst automatisch
 * mit dem Inhalt, damit längerer Text nie abgeschnitten wird.
 */
export function Textarea({
  className,
  ref,
  value,
  onChange,
  invalid,
  ...props
}: AppTextareaProps) {
  const innerRef = useRef<HTMLTextAreaElement>(null)

  function setRef(node: HTMLTextAreaElement | null) {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  // Höhe an den Inhalt angleichen: erst auf „auto“ zurücksetzen, damit
  // das Feld auch wieder schrumpfen kann, dann auf scrollHeight setzen.
  function resize(element: HTMLTextAreaElement) {
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }

  // Bei jedem Render an den Inhalt anpassen – deckt Nutzereingaben (zusätzlich
  // direkt in handleChange) und programmatische Wertänderungen ab.
  useEffect(() => {
    const element = innerRef.current
    if (element) resize(element)
  })

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    resize(event.currentTarget)
    onChange?.(event)
  }

  return (
    <textarea
      ref={setRef}
      value={value}
      onChange={handleChange}
      aria-invalid={invalid ? true : undefined}
      className={cn(
        'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive data-[invalid]:focus-visible:ring-destructive',
        invalid && 'border-destructive focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  )
}

export interface TextareaFieldProps extends AppTextareaProps {
  label: ReactNode
  description?: ReactNode
}

export function TextareaField({
  label,
  description,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <Field.Root className={cn('flex w-full flex-col gap-1.5', className)}>
      <Field.Label className="text-sm font-medium text-foreground">
        {label}
      </Field.Label>
      <Textarea {...props} />
      {description && (
        <Field.Description className="text-xs leading-5 text-muted-foreground">
          {description}
        </Field.Description>
      )}
    </Field.Root>
  )
}
