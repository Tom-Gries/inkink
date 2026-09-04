import type { QuestionDto } from '@inkink/api'
import { useTranslations } from '@inkink/i18n'
import { Badge, cn } from '@inkink/ui'
import { Check, X } from 'lucide-react'

/**
 * Antwortoptionen einer geschlossenen Frage nach dem Auflösen: Jede Antwort
 * zeigt per Icon, ob sie richtig (✓) oder falsch (✗) ist. Ausgewählte Antworten
 * werden schwarz umrandet und mit „Deine Antwort" markiert, richtige zusätzlich
 * mit „Richtig". Wird in Learn und in der Prüfungs-Review verwendet.
 */
export function AnswerOptionsReview({
  question,
  selected,
}: {
  question: QuestionDto
  selected: string[]
}) {
  const t = useTranslations()

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-sm font-medium text-foreground">
        {t('learnink.result.yourAnswer')}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {question.answerOptions.map((option) => {
          const wasChosen = selected.includes(option.id)
          const isCorrect = option.correct
          return (
            <li
              key={option.id}
              className={cn(
                'flex items-center gap-2 rounded-md border p-2.5',
                wasChosen
                  ? 'border-foreground bg-accent/40'
                  : 'border-border bg-background',
              )}
            >
              {isCorrect ? (
                <Check className="size-4 shrink-0 text-success" />
              ) : (
                <X className="size-4 shrink-0 text-destructive" />
              )}
              <span
                className={cn('flex-1 text-sm', wasChosen ? 'font-medium' : '')}
              >
                {option.text}
              </span>
              {isCorrect && (
                <Badge variant="success">
                  {t('learnink.result.correctAnswer')}
                </Badge>
              )}
              {wasChosen && (
                <Badge variant="outline">
                  {t('learnink.result.chosenAnswer')}
                </Badge>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Zeigt die richtige Lösung bzw. Erklärung einer Frage. */
export function AnswerSolution({ question }: { question: QuestionDto }) {
  const t = useTranslations()

  return (
    <div>
      <p className="text-sm font-semibold">{t('learnink.learn.solution')}</p>
      <p className="text-sm text-muted-foreground">
        {question.explanation.trim().length > 0
          ? question.explanation
          : question.answerOptions
              .filter((o) => o.correct)
              .map((o) => o.text)
              .join(', ')}
      </p>
    </div>
  )
}
