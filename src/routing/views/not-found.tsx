import { useTranslations } from '../../i18n/index'

export function NotFoundView() {
  const t = useTranslations()

  return <h1>{t('routing.notFound')}</h1>
}
