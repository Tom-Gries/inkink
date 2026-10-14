import { UsersRound } from 'lucide-react'
import { useTranslations } from '../../../i18n/index'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Link,
} from '../../../ui/index'
import { LoginButton, useAuthStore } from '../../../ui-auth/index'

/**
 * Home-Karte von Conectink auf der Startseite: Für Gäste ein
 * Anmelde-Aufruf mit Login-Button, für angemeldete Nutzer ein
 * direkter Link in den Conectink-Bereich.
 */
export function ConectinkHome() {
  const t = useTranslations()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = user !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersRound className="size-4" aria-hidden="true" />
          {t('conectink.home.title')}
        </CardTitle>
        <CardDescription>{t('conectink.home.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <Link to="conectink.main" type="next" className="w-full">
            {t('conectink.home.cta')}
          </Link>
        ) : (
          <LoginButton className="w-full" />
        )}
      </CardContent>
    </Card>
  )
}
