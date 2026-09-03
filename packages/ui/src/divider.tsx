import { Separator } from '@base-ui-components/react/separator'
import { cn } from './cn'

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({
  orientation = 'horizontal',
  className,
}: DividerProps) {
  return (
    <Separator
      orientation={orientation}
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    />
  )
}
