import { useTranslations } from '../../../i18n/index'
import { Link, PageContainer, PageHeader } from '../../../ui/index'

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
