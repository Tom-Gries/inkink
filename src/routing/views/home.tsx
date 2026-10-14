import { useTranslations } from '../../i18n/index'
import { inks } from '../../inks'
import { PageContainer, PageHeader } from '../../ui/index'

export function HomeView() {
  const t = useTranslations()

  return (
    <PageContainer>
      <PageHeader
        title={t('routing.home.welcomeTitle')}
        description={t('routing.home.welcomeSubtitle')}
      />

      {/* Jeder Ink kann eine optionale Home-Komponente (`home`) mitbringen,
          die hier als Karte auf der Startseite erscheint – analog zu den Routen. */}
      <div className="grid gap-4 sm:grid-cols-2">
        {inks.map((ink) => {
          const Home = ink.home
          if (Home === undefined) return null
          return <Home key={ink.name} />
        })}
      </div>
    </PageContainer>
  )
}
