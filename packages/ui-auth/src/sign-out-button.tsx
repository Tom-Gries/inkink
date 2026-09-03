import { useTranslations } from '@inkink/i18n'
import { Button } from '@inkink/ui'
import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useAuthStore } from './store'

export interface SignOutButtonProps {
  className?: string
  children?: ReactNode
}

/**
 * Wiederverwendbarer Abmelden-Button des Auth-Moduls.
 *
 * Kapselt den vollständigen Logout-Ablauf: Auth-Store leeren
 * (`signOut`, inkl. Server-Session über authClient) und anschließend
 * zur öffentlichen Startseite navigieren. Views/Inks müssen nur diese
 * Komponente rendern – keine eigene Auth-Logik.
 */
export function SignOutButton({ className, children }: SignOutButtonProps) {
  const t = useTranslations()
  const navigate = useNavigate()
  const signOut = useAuthStore((state) => state.signOut)
  const [pending, setPending] = useState(false)

  async function handleSignOut() {
    setPending(true)
    try {
      await signOut()
      // Zurück zur öffentlichen Home-Route (kein Coupling an einen
      // konkreten Ink); nach der Abmeldung hat der User keine Session.
      await navigate({ to: '/' })
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant="destructive"
      className={className}
      disabled={pending}
      onClick={handleSignOut}
    >
      {children ?? t('auth.signOut')}
    </Button>
  )
}
