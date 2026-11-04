import { useLocaleStore } from '../../i18n/index'
import { Link, PageContainer, PageHeader } from '../../ui/index'
import { privacyContent } from '../privacy-content'

const textLink =
  'text-primary underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function PrivacyView() {
  const locale = useLocaleStore((state) => state.locale)
  const content = privacyContent[locale]

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title={content.title} description={content.description} />
      <article className="space-y-8 text-sm leading-7">
        <p className="text-muted-foreground">{content.updated}</p>

        <aside className="rounded-lg border border-border bg-muted p-4">
          <p>{content.hostingNotice}</p>
        </aside>

        <section aria-labelledby="privacy-controller">
          <h2 id="privacy-controller" className="mb-2 text-base font-semibold">
            {content.controller}
          </h2>
          <address className="not-italic">
            Tom Gries
            <br />
            Friedensalle 72
            <br />
            22765 Hamburg
            <br />
            {content.country}
          </address>
          <p className="mt-3">{content.contact}</p>
          <a href="mailto:Kontakt.tomgries@gmail.com" className={textLink}>
            Kontakt.tomgries@gmail.com
          </a>
        </section>

        <nav aria-label={content.contents}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {content.sections.map((section) => (
              <li key={section.id}>
                <a href={`#privacy-${section.id}`} className={textLink}>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {content.sections.map((section) => (
          <section key={section.id} aria-labelledby={`privacy-${section.id}`}>
            <h2
              id={`privacy-${section.id}`}
              className="mb-3 scroll-mt-6 text-base font-semibold"
            >
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {'items' in section && section.items && (
                <ul className="list-disc space-y-3 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {'links' in section && section.links && (
                <ul className="flex flex-col gap-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={textLink}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        <p>
          <Link to="settink.settings" variant="link" className="h-auto p-0">
            {content.settings}
          </Link>
        </p>
      </article>
    </PageContainer>
  )
}
