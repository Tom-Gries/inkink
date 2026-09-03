import type { ReactNode } from 'react'
import { cn } from './cn'

/**
 * Seiten-Container für Inhaltsseiten innerhalb der AppShell.
 * Zentriert den Inhalt auf eine maximale Breite und setzt die
 * horizontalen Abstände responsive.
 */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8 lg:py-10',
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Kopfbereich einer Seite: Titel, optionale Beschreibung und Aktionen.
 * Bricht auf schmalen Viewports bewusst untereinander um.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6',
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}
