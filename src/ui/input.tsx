import { Field } from '@base-ui-components/react/field'
import {
  Input as BaseInput,
  type InputProps,
} from '@base-ui-components/react/input'
import type { ReactNode } from 'react'
import { cn } from './cn'

export function Input({ className, ...props }: InputProps) {
  return (
    <BaseInput
      className={cn(
        'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive data-[invalid]:focus-visible:ring-destructive',
        className,
      )}
      {...props}
    />
  )
}

export interface TextFieldProps extends InputProps {
  label: ReactNode
  description?: ReactNode
}

export function TextField({
  label,
  description,
  className,
  ...props
}: TextFieldProps) {
  return (
    <Field.Root className={cn('flex w-full flex-col gap-1.5', className)}>
      <Field.Label className="text-sm font-medium text-foreground">
        {label}
      </Field.Label>
      <Input {...props} />
      {description && (
        <Field.Description className="text-xs leading-5 text-muted-foreground">
          {description}
        </Field.Description>
      )}
    </Field.Root>
  )
}
