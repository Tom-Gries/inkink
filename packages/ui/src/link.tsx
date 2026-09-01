import { useRender } from '@base-ui-components/react/use-render'
import { resolveInkRoute, type InkRouteRef } from '@inkink/core'
import {
  Link as TanStackLink,
  type LinkProps as TanStackLinkProps,
} from '@tanstack/react-router'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import type { ComponentType, ReactElement, ReactNode } from 'react'

export const linkVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type LinkType = 'next' | 'back' | 'external'

const linkTypeIcons: Record<LinkType, ComponentType> = {
  next: ArrowRight,
  back: ArrowLeft,
  external: ExternalLink,
}

export type LinkProps = Omit<TanStackLinkProps, 'to'> &
  VariantProps<typeof linkVariants> & {
    className?: string
    children?: ReactNode
    render?: ReactElement
    type?: LinkType
    /** Typsichere Referenz auf eine registrierte Ink-Route, z.B. "startink.ziel". */
    to?: InkRouteRef
  }

export function Link({ className, variant, size, render, type, children, to, ...props }: LinkProps) {
  const Icon = type ? linkTypeIcons[type] : null
  const path = to !== undefined ? resolveInkRoute(to) : undefined

  const renderedChildren = Icon ? (
    <>
      {type === 'back' && <Icon />}
      {children}
      {(type === 'next' || type === 'external') && <Icon />}
    </>
  ) : children

  return useRender({
    render: render ?? <TanStackLink {...props} to={path} />,
    props: {
      className: [linkVariants({ variant, size }), className].filter(Boolean).join(' '),
      children: renderedChildren,
    },
  })
}