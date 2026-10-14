import { Heart } from 'lucide-react'
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
 * Home-Karte von Feelink auf der Startseite: Für Gäste ein
 * Anmelde-Aufruf mit Login-Button, für angemeldete Nutzer ein
 * direkter Link in die Stimmungs-Erfassung.
 */
export function FeelinkHome() {
  const t = useTranslations()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = user !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="size-4" aria-hidden="true" />
          {t('feelink.home.title')}
        </CardTitle>
        <CardDescription>{t('feelink.home.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <Link to="feelink.feel" type="next" className="w-full">
            {t('feelink.home.cta')}
          </Link>
        ) : (
          <LoginButton className="w-full" />
        )}
      </CardContent>
    </Card>
  )
}
