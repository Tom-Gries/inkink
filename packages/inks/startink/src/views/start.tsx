import { useTranslations } from '@inkink/i18n'

export function StartView() {
  const t = useTranslations()

  return <h1>{t('startink.start')}</h1>
}
