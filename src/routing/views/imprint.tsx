import { useTranslations } from '../../i18n/index'
import { PageContainer, PageHeader } from '../../ui/index'

export function ImprintView() {
  const t = useTranslations()

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title={t('routing.imprint')}
        description={t('routing.imprint.legalBasis')}
      />

      <div className="space-y-8 text-sm leading-7">
        <section aria-labelledby="imprint-operator">
          <h2 id="imprint-operator" className="mb-2 text-base font-semibold">
            {t('routing.imprint.operator')}
          </h2>
          <address className="not-italic">
            Tom Gries
            <br />
            Friedensalle 72
            <br />
            22765 Hamburg
            <br />
            {t('routing.imprint.country')}
          </address>
        </section>

        <section aria-labelledby="imprint-contact">
          <h2 id="imprint-contact" className="mb-2 text-base font-semibold">
            {t('routing.imprint.contact')}
          </h2>
          <p>
            {t('routing.imprint.email')}{' '}
            <a
              href="mailto:Kontakt.tomgries@gmail.com"
              className="break-all text-primary underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Kontakt.tomgries@gmail.com
            </a>
          </p>
        </section>
      </div>
    </PageContainer>
  )
}
