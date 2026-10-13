import { Check, Heart, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  type FeelingDto,
  type FeelingMood,
  useCreateFeeling,
  useDeleteFeeling,
  useFeelings,
} from '../../../api/index'
import { useTranslations } from '../../../i18n/index'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  cn,
  PageContainer,
  PageHeader,
  TextareaField,
} from '../../../ui/index'
import { FEELINGS } from '../constants'

export function FeelView() {
  const t = useTranslations()
  const { data, isLoading, isError } = useFeelings()
  const create = useCreateFeeling()
  const remove = useDeleteFeeling()

  const [selected, setSelected] = useState<FeelingMood | null>(null)
  const [note, setNote] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FeelingDto | null>(null)

  const entries = data ?? []
  const canSave = selected !== null && !create.isPending

  function handleSave() {
    if (selected === null) return

    create.mutate(
      { mood: selected, note: note.trim() },
      {
        onSuccess: () => {
          setSelected(null)
          setNote('')
          setJustSaved(true)
          window.setTimeout(() => setJustSaved(false), 2000)
        },
      },
    )
  }

  function confirmDelete() {
    if (deleteTarget) {
      void remove.mutate(deleteTarget.id)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('feelink.feel')}
        description={t('feelink.feelSubtitle')}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('feelink.question')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <fieldset className="m-0 grid min-w-0 grid-cols-4 gap-2 border-0 p-0 sm:grid-cols-8">
            <legend className="sr-only">{t('feelink.question')}</legend>
            {FEELINGS.map((feeling) => {
              const isSelected = selected === feeling.id
              return (
                <button
                  key={feeling.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelected(feeling.id)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isSelected
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <feeling.icon className="size-6" aria-hidden="true" />
                  {t(`feelink.mood.${feeling.id}`)}
                </button>
              )
            })}
          </fieldset>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextareaField
              label={t('feelink.note.label')}
              placeholder={t('feelink.note.placeholder')}
              value={note}
              maxLength={280}
              rows={2}
              onChange={(event) => setNote(event.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="w-fit"
            >
              {justSaved ? (
                <Check className="size-4" />
              ) : (
                <Heart className="size-4" />
              )}
              {justSaved ? t('feelink.saved') : t('feelink.save')}
            </Button>
          </div>

          {create.isError && (
            <p className="text-sm text-destructive">
              {create.error instanceof Error
                ? create.error.message
                : t('feelink.saveError')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('feelink.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t('feelink.loading')}
            </p>
          ) : isError ? (
            <p className="text-sm text-destructive">{t('feelink.loadError')}</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('feelink.historyEmpty')}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {entries.map((entry) => {
                const feeling = FEELINGS.find((f) => f.id === entry.mood)
                return (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {feeling ? (
                          <feeling.icon className="size-4" aria-hidden="true" />
                        ) : null}
                        {t(`feelink.mood.${entry.mood}`)}
                      </p>
                      {entry.note && (
                        <p className="mt-0.5 text-sm break-words text-muted-foreground">
                          {entry.note}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t('feelink.delete')}
                      onClick={() => setDeleteTarget(entry)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={deleteTarget ? t(`feelink.mood.${deleteTarget.mood}`) : ''}
        description={t('feelink.deleteConfirm')}
        confirmLabel={t('feelink.delete')}
        cancelLabel={t('feelink.confirm.cancel')}
        destructive
        onConfirm={confirmDelete}
      />
    </PageContainer>
  )
}
