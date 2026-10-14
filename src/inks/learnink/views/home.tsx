import { GraduationCap } from 'lucide-react'
import { useTranslations } from '../../../i18n/index'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Link,
} from '../../../ui/index'

/**
 * Home-Karte von Learnink auf der Startseite: kurzer Nutzen-Satz und
 * ein Link in die Übersicht der Lernstacks.
 */
export function LearninkHome() {
  const t = useTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="size-4" aria-hidden="true" />
          {t('learnink.home.title')}
        </CardTitle>
        <CardDescription>{t('learnink.home.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="learnink.stacks" type="next" className="w-full">
          {t('learnink.home.cta')}
        </Link>
      </CardContent>
    </Card>
  )
}
