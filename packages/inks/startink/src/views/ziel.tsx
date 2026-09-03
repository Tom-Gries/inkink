import { useTranslations } from '@inkink/i18n'
import { Link, PageContainer, PageHeader } from '@inkink/ui'

export function ZielView() {
  const t = useTranslations()

  return (
    <PageContainer>
      <PageHeader
        title={t('startink.ziel')}
        description={t('startink.zielSubtitle')}
      />
      <Link to="startink.start" variant="outline" type="back">
        {t('startink.start')}
      </Link>
    </PageContainer>
  )
}
