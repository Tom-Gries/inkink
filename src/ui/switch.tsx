import { Switch } from '@base-ui-components/react/switch'
import { cn } from './cn'

export type SwitchControlProps = Switch.Root.Props

export function SwitchControl({ className, ...props }: SwitchControlProps) {
  return (
    <Switch.Root
      {...props}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked]:bg-primary data-[unchecked]:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className,
      )}
    >
      <Switch.Thumb className="pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-transform data-[checked]:translate-x-5 data-[unchecked]:translate-x-0" />
    </Switch.Root>
  )
}
