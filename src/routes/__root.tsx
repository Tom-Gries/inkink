import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useLocaleStore } from '../i18n/index'
import { AppShell } from '../ui/index'
import { AuthProvider, LoginButton, useAuthStore } from '../ui-auth/index'

export const Route = createRootRoute({
  component: RootLayout,
})

/**
 * Root-Layout der SPA (kein SSR mehr): AppShell + AuthGate als einziges
 * Gerüst. Provider (QueryClient / I18n) umschließen den Router in main.tsx.
 */
function RootLayout() {
  const user = useAuthStore((state) => state.user)
  const locale = useLocaleStore((state) => state.locale)

  // Client-seitig die gespeicherte Sprache laden (nach Mount).
  useEffect(() => {
    useLocaleStore.getState().hydrate()
  }, [])

  const isAuthenticated = user !== null

  return (
    <AppShell
      authenticated={isAuthenticated}
      profile={
        isAuthenticated
          ? {
            name: user?.username ?? user?.name ?? '',
          }
          : undefined
      }
      footer={
        !isAuthenticated ? (
          <LoginButton className="w-full">
            {locale === 'de' ? 'Anmelden' : 'Sign in'}
          </LoginButton>
        ) : undefined
      }
    >
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </AppShell>
  )
}
