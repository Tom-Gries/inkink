import { Dialog } from '@base-ui-components/react/dialog'
import type { VisibleInkRoute } from '@inkink/core'
import { getVisibleInkRoutes, resolveInkRoute } from '@inkink/core'
import { useTranslations } from '@inkink/i18n'
import { Link as TanStackLink, useLocation } from '@tanstack/react-router'
import { Circle, Menu, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { AvatarControl } from './avatar'
import { cn } from './cn'

export interface SidebarItem {
  /** Eindeutiger Schlüssel innerhalb der Gruppe. */
  key: string
  label: ReactNode
  to?: string
  icon?: ReactNode
  onClick?: () => void
}

export interface SidebarGroup {
  label?: ReactNode
  items: Array<SidebarItem>
}

/**
 * Mock-Profil für den Standard-Sidebar-Footer. Wird später
 * durch die Daten der Auth-Session ersetzt.
 */
export interface ShellProfile {
  name: string
  handle?: string
  level?: number
  xp?: number
}

export interface AppShellProps {
  /** Zusätzliche manuelle Gruppen unterhalb der automatischen Navigation. */
  groups?: Array<SidebarGroup>
  /** Brand-Bereich oben; Default ist der InkInk-Schriftzug. */
  brand?: ReactNode
  /** Footer unten; ohne Angabe wird ein Platzhalter-Profil angezeigt. */
  footer?: ReactNode
  /** Profil für den Standard-Footer; Default ist ein Mock-Profil. */
  profile?: ShellProfile
  children: ReactNode
}

const DEFAULT_PROFILE: ShellProfile = {
  name: 'Tom Gries',
  handle: '@tommylein',
  level: 12,
  xp: 1240,
}

/** Baut die Sidebar-Items automatisch aus allen sichtbaren Ink-Routen. */
function useAutoNavItems() {
  const t = useTranslations()

  return getVisibleInkRoutes().map((route: VisibleInkRoute) => ({
    key: route.routeName,
    label: t(`${route.inkName}.nav.${route.routeName}`),
    to: route.ref,
    icon: route.icon ?? <Circle className="size-4" />,
  }))
}

function DefaultProfileFooter({ profile }: { profile: ShellProfile }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
      <AvatarControl name={profile.name} className="size-8 text-xs" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{profile.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {profile.level !== undefined && profile.xp !== undefined
            ? `Level ${profile.level} · ${profile.xp.toLocaleString('de-DE')} XP`
            : profile.handle}
        </p>
      </div>
    </div>
  )
}

function AppBrand({ brand }: { brand?: ReactNode }) {
  return (
    <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
      {brand ?? (
        <>
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="ml-2 text-sm font-semibold tracking-tight">
            InkInk
          </span>
        </>
      )}
    </div>
  )
}

function SidebarItemLink({
  item,
  onNavigate,
}: {
  item: SidebarItem
  onNavigate?: () => void
}) {
  const pathname = useLocation().pathname

  if (item.to) {
    const path = resolveInkRoute(item.to)
    const active = pathname === path

    return (
      <TanStackLink
        to={path}
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active && 'bg-accent text-accent-foreground',
        )}
      >
        {item.icon}
        <span className="truncate">{item.label}</span>
      </TanStackLink>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        item.onClick?.()
        onNavigate?.()
      }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {item.icon}
      <span className="truncate">{item.label}</span>
    </button>
  )
}

function SidebarNav({
  groups,
  onNavigate,
}: {
  groups: Array<SidebarGroup>
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <div key={group.label ? String(group.label) : `group-${index}`}>
          {group.label && (
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.key}>
                <SidebarItemLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/**
 * Grundgerüst der Anwendung: feste Sidebar auf Desktop/Tablet,
 * Off-Canvas-Drawer (Base UI Dialog) auf Mobile, Inhaltsbereich rechts.
 */
export function AppShell({
  groups,
  brand,
  footer,
  profile = DEFAULT_PROFILE,
  children,
}: AppShellProps) {
  const autoItems = useAutoNavItems()

  const sidebarGroups: Array<SidebarGroup> = [
    { items: autoItems },
    ...(groups ?? []),
  ]

  const sidebarFooter =
    footer === undefined ? <DefaultProfileFooter profile={profile} /> : footer

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Desktop- & Tablet-Sidebar – fest am linken Rand, scrollt nicht mit */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-52 flex-col border-r border-border bg-background lg:flex">
        <AppBrand brand={brand} />
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav groups={sidebarGroups} />
        </div>
        {sidebarFooter && (
          <div className="shrink-0 border-t border-border p-3">
            {sidebarFooter}
          </div>
        )}
      </aside>

      {/* Mobile: Topbar + Drawer */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-52">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 lg:hidden">
          <Dialog.Root>
            <Dialog.Trigger
              aria-label="Menü öffnen"
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="size-5" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
              <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-background shadow-md transition-transform duration-200 data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full">
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                  {brand ?? (
                    <>
                      <span className="size-2.5 rounded-full bg-primary" />
                      <span className="ml-2 text-sm font-semibold tracking-tight">
                        InkInk
                      </span>
                    </>
                  )}
                  <Dialog.Close
                    aria-label="Menü schließen"
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-5" />
                  </Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <SidebarNav
                    groups={sidebarGroups}
                    onNavigate={() => undefined}
                  />
                </div>
                {sidebarFooter && (
                  <div className="shrink-0 border-t border-border p-3">
                    {sidebarFooter}
                  </div>
                )}
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
          <span className="text-sm font-semibold tracking-tight">
            {brand ?? 'InkInk'}
          </span>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
