import { Avatar } from '@base-ui-components/react/avatar'
import { cn } from './cn'

export interface AvatarProps {
  src?: string
  name: string
  className?: string
}

export function AvatarControl({ src, name, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Avatar.Root
      className={cn(
        'inline-flex size-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-accent-foreground',
        className,
      )}
    >
      {src ? (
        <Avatar.Image src={src} alt={name} className="size-full object-cover" />
      ) : null}
      <Avatar.Fallback className="flex size-full items-center justify-center">
        {initials}
      </Avatar.Fallback>
    </Avatar.Root>
  )
}
