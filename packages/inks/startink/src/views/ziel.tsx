import { useTranslations } from '@inkink/i18n'

export function ZielView() {
  const t = useTranslations()

  return <h1>{t('startink.ziel')}</h1>
}
