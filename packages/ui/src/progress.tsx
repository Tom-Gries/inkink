import { Progress } from '@base-ui-components/react/progress'
import { cn } from './cn'

export type ProgressControlProps = Progress.Root.Props

/** shadcn/ui-Base-UI-Progress: Track + Indicator, angetrieben über `value`. */
export function ProgressControl({ className, ...props }: ProgressControlProps) {
  return (
    <Progress.Root {...props} className={cn('w-full', className)}>
      <Progress.Track className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <Progress.Indicator className="h-full bg-primary transition-[width] duration-300 ease-linear data-[status=complete]:bg-primary" />
      </Progress.Track>
    </Progress.Root>
  )
}
