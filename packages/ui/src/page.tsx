import type { ReactNode } from 'react'

export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      {children}
    </main>
  )
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-4xl font-bold tracking-tight">{children}</h1>
}