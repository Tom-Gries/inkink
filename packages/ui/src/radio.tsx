import { Radio, type RadioRootProps } from '@base-ui-components/react/radio'
import {
  RadioGroup,
  type RadioGroupProps,
} from '@base-ui-components/react/radio-group'
import type { ReactNode } from 'react'
import { cn } from './cn'

export function RadioGroupControl({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroup className={cn('flex flex-col gap-2.5', className)} {...props} />
  )
}

export interface RadioOptionProps extends RadioRootProps {
  label: ReactNode
  description?: ReactNode
}

export function RadioOption({
  label,
  description,
  className,
  ...props
}: RadioOptionProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI Radio rendert ein verstecktes <input> im Control-Root
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3.5 transition-colors hover:bg-muted/50 has-[[data-checked]]:border-primary/40 has-[[data-checked]]:bg-accent/40',
        className,
      )}
    >
      <Radio.Root
        {...props}
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 data-[checked]:border-success data-[checked]:bg-success"
      >
        <Radio.Indicator className="flex size-4 items-center justify-center">
          <span className="size-1.5 rounded-full bg-white data-[unchecked]:bg-transparent" />
        </Radio.Indicator>
      </Radio.Root>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}
