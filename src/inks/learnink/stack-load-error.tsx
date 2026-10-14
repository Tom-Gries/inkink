import { ApiError } from '../../api/index'
import { useTranslations } from '../../i18n/index'
import { Link } from '../../ui/index'

/**
 * Fehlerzustand beim Laden eines Stacks. Unterscheidet „nicht gefunden“
 * (privat, gelöscht oder falscher Link → 404) von sonstigen Ladefehlern
 * und bietet immer die Rückkehr zur Stack-Übersicht an.
 */
export function StackLoadError({ error }: { error: unknown }) {
  const t = useTranslations()
  const notFound = error instanceof ApiError && error.status === 404

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-destructive">
        {notFound
          ? t('learnink.stack.notFoundHint')
          : t('learnink.stack.loadError')}
      </p>
      <Link
        to="learnink.stacks"
        variant="outline"
        type="back"
        className="w-fit"
      >
        {t('learnink.result.back')}
      </Link>
    </div>
  )
}
