import { Field } from '@base-ui-components/react/field'
import type { ReactNode, Ref, TextareaHTMLAttributes } from 'react'
import { cn } from './cn'

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>
}

/**
 * Mehrzeiliges Textfeld, gestylt wie `Input` – für Erklärungen,
 * offene Antworten und andere längere Texte.
 */
export function Textarea({ className, ref, ...props }: AppTextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive data-[invalid]:focus-visible:ring-destructive',
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
