import { LogIn } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslations } from '../i18n/index'
import { Button } from '../ui/index'
import { useAuthStore } from './store'

export interface LoginButtonProps {
  className?: string
  children?: ReactNode
}

/**
 * Wiederverwendbarer Login-Button des Auth-Moduls (Google-OAuth).
 *
 * Kapselt den vollständigen Anmelde-Flow aus dem LoginGate, damit
 * auch andere Stellen (z. B. der Sidebar-Footer der AppShell) denselben
 * Button verwenden können – ohne die Ziel-URL-Logik zu duplizieren.
 */
export function LoginButton({ className, children }: LoginButtonProps) {
  const t = useTranslations()
  const status = useAuthStore((state) => state.status)
  const pendingTarget = useAuthStore((state) => state.pendingTarget)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)

  const pending = status === 'idle' || status === 'loading'

  async function handleGoogleSignIn() {
    // Ziel immer ABSOLUT auf den Web-Origin machen: Der Auth-Guard
    // meldet das Ziel als relativen Pfad (location.href), z. B.
    // "/startink/ziel". Ein relativer callbackURL würde Better Auth
    // nach dem OAuth-Callback relativ zur API-Base (localhost:8787)
    // auflösen – der Benutzer landete also nicht auf der Web-App
    // (localhost:3000). new URL() löst relative Pfade gegen den
    // aktuellen Origin auf und lässt absolute Ziel-URLs unverändert.
    const fallback = window.location.pathname + window.location.search
    const target = new URL(
      pendingTarget ?? fallback,
      window.location.origin,
    ).toString()

    try {
      await signInWithGoogle(target)
    } catch {
      // Fehler bewusst geschluckt: Das LoginGate bleibt offen, der Nutzer
      // kann es erneut versuchen – kein Logging aus dem Auth-Flow.
    }
  }

  return (
    <Button
      variant="default"
      className={className}
      disabled={pending}
      onClick={handleGoogleSignIn}
    >
      <LogIn className="size-4" />
      {children ?? t('auth.login.google')}
    </Button>
  )
}
