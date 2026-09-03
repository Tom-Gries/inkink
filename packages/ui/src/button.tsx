import {
  Button as BaseButton,
  type ButtonProps,
} from '@base-ui-components/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from './cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive:
          'bg-destructive-soft text-destructive hover:bg-destructive-soft/75',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-[0.8125rem]',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export type AppButtonProps = ButtonProps & {
  className?: string
  variant?: ButtonVariantProps['variant']
  size?: ButtonVariantProps['size']
}

export const Button = forwardRef<HTMLElement, AppButtonProps>(function Button(
  { className, variant, size, ...props },
  ref,
) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
    />
  )
})
