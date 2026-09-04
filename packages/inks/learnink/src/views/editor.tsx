import type {
  AnswerOptionDto,
  Appearance,
  QuestionType,
  Scoring,
  StackDto,
} from '@inkink/api'
import { useCreateStack, useStack, useUpdateStack } from '@inkink/api'
import { useTranslations } from '@inkink/i18n'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Input,
  Link,
  PageContainer,
  PageHeader,
  TextareaField,
  TextField,
} from '@inkink/ui'
import { useAuthStore } from '@inkink/ui-auth'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { randomDefaultName } from '../constants'

interface SliderOption<T extends string> {
  value: T
  label: string
}

/**
 * Segmentiertes Slider-Select: Die aktive Option wird von einer animierten
 * „Schiebe“-Markierung hinterlegt (z. B. für Offen/Geschlossen).
 */
function SliderSelect<T extends string>({
  value,
  options,
  onValueChange,
  className,
}: {
  value: T
  options: Array<SliderOption<T>>
  onValueChange: (value: T) => void
  className?: string
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const cellWidth = `${100 / options.length}%`
  const cellLeft = `${(activeIndex * 100) / options.length}%`

  return (
    <div
      className={cn(
        'relative inline-flex w-full rounded-lg border border-input bg-background p-1',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute bottom-1 left-0 top-1 rounded-md bg-primary/15 transition-all duration-300"
        style={{ width: cellWidth, left: cellLeft }}
      />
      <div
        className="relative z-10 grid w-full"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onValueChange(option.value)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface SelectOption<T extends string> {
  value: T
  label: string
}

/** Einfaches Dropdown (natives <select>), optisch passend zu `Input`. */
function Select<T extends string>({
  value,
  options,
  onValueChange,
  className,
}: {
  value: T
  options: Array<SelectOption<T>>
  onValueChange: (value: T) => void
  className?: string
}) {
  return (
    <select
      className={cn(
        'h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        className,
      )}
      value={value}
      onChange={(event) => onValueChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

interface DraftOption extends AnswerOptionDto {}

interface DraftQuestion {
  id: string
  type: QuestionType
  appearance: Appearance
  question: string
  explanation: string
  points: number
  scoring: Scoring
  answerOptions: DraftOption[]
}

function newQuestion(): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    type: 'closed',
    appearance: 'learn & proof',
    question: '',
    explanation: '',
    points: 1,
    scoring: 'all',
    answerOptions: [
      { id: crypto.randomUUID(), text: '', correct: true },
      { id: crypto.randomUUID(), text: '', correct: false },
    ],
  }
}

function toDraft(stack: StackDto): DraftQuestion[] {
  return stack.questions.map((question) => ({
    id: question.id,
    type: question.type,
    appearance: question.appearance,
    question: question.question,
    explanation: question.explanation,
    points: question.points,
    scoring: question.scoring ?? 'all',
    answerOptions: question.answerOptions.map((option) => ({ ...option })),
  }))
}

export function EditorView() {
  const t = useTranslations()
  const routeParams = useParams({ strict: false })
  const id = typeof routeParams.id === 'string' ? routeParams.id : undefined
  const isNew = !id || id === 'new'
  const stackId = isNew ? undefined : id

  const { data, isLoading, isError } = useStack(stackId)
  const create = useCreateStack()
  const update = useUpdateStack()
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  // Neue Stacks starten direkt mit Username/Default-Name; beim Bearbeiten
  // wird der Name nach dem Laden durch die Daten ersetzt.
  const [creatorName, setCreatorName] = useState<string>(
    isNew ? (user?.username ?? randomDefaultName()) : '',
  )
  const [examMinutes, setExamMinutes] = useState<number>(10)
  const [passingScore, setPassingScore] = useState<number>(0)
  const [questions, setQuestions] = useState<DraftQuestion[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.name)
    setCreatorName(data.creatorName)
    setExamMinutes(Math.max(1, Math.round(data.examTime / 60)))
    setPassingScore(data.passingScore ?? 0)
    setQuestions(toDraft(data))
  }, [data])

  function updateQuestion(id: string, patch: Partial<DraftQuestion>) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    )
  }

  function updateOption(
    questionId: string,
    optionId: string,
    patch: Partial<DraftOption>,
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answerOptions: question.answerOptions.map((option) =>
                option.id === optionId ? { ...option, ...patch } : option,
              ),
            }
          : question,
      ),
    )
  }

  function removeQuestion(id: string) {
    setQuestions((current) => current.filter((question) => question.id !== id))
  }

  function removeOption(questionId: string, optionId: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answerOptions: question.answerOptions.filter(
                (option) => option.id !== optionId,
              ),
            }
          : question,
      ),
    )
  }

  function addOption(question: DraftQuestion) {
    updateQuestion(question.id, {
      answerOptions: [
        ...question.answerOptions,
        { id: crypto.randomUUID(), text: '', correct: false },
      ],
    })
  }
  async function handleSave() {
    if (name.trim().length === 0) {
      setSaveError(t('learnink.editor.nameRequired'))
      return
    }

    setSaving(true)
    setSaveError(null)

    const input = {
      name: name.trim(),
      creatorName: creatorName.trim() || randomDefaultName(),
      examTime: examMinutes * 60,
      passingScore: Math.max(0, Math.floor(passingScore)),
      questions: questions.map((question) => ({
        id: question.id,
        type: question.type,
        appearance: question.appearance,
        question: question.question.trim(),
        explanation: question.explanation.trim(),
        points: Math.max(0, Math.floor(question.points)),
        scoring: question.scoring,
        answerOptions:
          question.type === 'closed'
            ? question.answerOptions.map((option) => ({
                id: option.id,
                text: option.text.trim(),
                correct: option.correct,
              }))
            : [],
      })),
    }

    try {
      if (isNew) {
        await create.mutateAsync(input)
      } else {
        await update.mutateAsync({ id: stackId, input })
      }
      await navigate({ to: '/learnink/stacks' })
    } catch (error) {
      setSaving(false)
      setSaveError(
        error instanceof Error ? error.message : t('learnink.editor.saveError'),
      )
    }
  }

  const appearanceOptions: Array<{ value: Appearance; label: string }> = [
    { value: 'learn', label: t('learnink.editor.appearance.learn') },
    { value: 'proof', label: t('learnink.editor.appearance.proof') },
    { value: 'learn & proof', label: t('learnink.editor.appearance.both') },
    { value: 'inactive', label: t('learnink.editor.appearance.inactive') },
  ]
  function renderQuestion(question: DraftQuestion) {
    const correctCount = question.answerOptions.filter((o) => o.correct).length

    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            {question.question.trim().length > 0
              ? question.question.trim()
              : t('learnink.editor.questionText')}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('learnink.editor.removeQuestion')}
            onClick={() => removeQuestion(question.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <TextField
            label={t('learnink.editor.questionText')}
            value={question.question}
            onChange={(e) =>
              updateQuestion(question.id, { question: e.target.value })
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('learnink.editor.type')}
              </p>
              <SliderSelect
                className="mt-1.5"
                value={question.type}
                options={[
                  { value: 'open', label: t('learnink.editor.type.open') },
                  { value: 'closed', label: t('learnink.editor.type.closed') },
                ]}
                onValueChange={(value) =>
                  updateQuestion(question.id, { type: value })
                }
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {question.type === 'open'
                  ? t('learnink.editor.type.openDesc')
                  : t('learnink.editor.type.closedDesc')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('learnink.editor.points')}
              </p>
              <Input
                type="number"
                min={0}
                className="mt-1.5"
                value={String(question.points)}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10)
                  updateQuestion(question.id, {
                    points: Number.isNaN(parsed) ? 0 : Math.max(0, parsed),
                  })
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">
              {t('learnink.editor.appearance')}
            </p>
            <Select
              className="mt-1.5"
              value={question.appearance}
              options={appearanceOptions}
              onValueChange={(value) =>
                updateQuestion(question.id, { appearance: value })
              }
            />
          </div>
          <div className="mt-4">
            <TextareaField
              label={t('learnink.editor.explanation')}
              placeholder={t('learnink.editor.explanationPlaceholder')}
              value={question.explanation}
              onChange={(e) =>
                updateQuestion(question.id, { explanation: e.target.value })
              }
            />
          </div>

          {question.type === 'closed' && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground">
                {t('learnink.editor.options')}
              </p>
              <p className="text-xs text-muted-foreground">
                {correctCount > 1
                  ? t('learnink.editor.multiHint')
                  : t('learnink.editor.singleHint')}
              </p>
              {correctCount > 1 && (
                <div className="mt-2.5 flex flex-col gap-1.5 rounded-md border border-border bg-background p-3">
                  <p className="text-sm font-medium text-foreground">
                    {t('learnink.editor.scoring')}
                  </p>
                  <SliderSelect
                    value={question.scoring}
                    options={[
                      {
                        value: 'partial',
                        label: t('learnink.editor.scoring.partial'),
                      },
                      { value: 'all', label: t('learnink.editor.scoring.all') },
                    ]}
                    onValueChange={(value) =>
                      updateQuestion(question.id, { scoring: value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {question.scoring === 'partial'
                      ? t('learnink.editor.scoring.partialDesc')
                      : t('learnink.editor.scoring.allDesc')}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2.5">
                {question.answerOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
                  >
                    <input
                      type="checkbox"
                      checked={option.correct}
                      title={t('learnink.editor.correct')}
                      onChange={(e) =>
                        updateOption(question.id, option.id, {
                          correct: e.target.checked,
                        })
                      }
                    />
                    <Input
                      className="flex-1"
                      value={option.text}
                      placeholder={t('learnink.editor.optionText')}
                      onChange={(e) =>
                        updateOption(question.id, option.id, {
                          text: e.target.value,
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('learnink.editor.removeOption')}
                      onClick={() => removeOption(question.id, option.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => addOption(question)}
              >
                <Plus className="size-4" />
                {t('learnink.editor.addOption')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  if (!isNew && isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t('learnink.editor.edit')} />
        <p className="text-sm text-muted-foreground">
          {t('learnink.editor.loading')}
        </p>
      </PageContainer>
    )
  }

  if (!isNew && (isError || !data)) {
    return (
      <PageContainer>
        <PageHeader title={t('learnink.editor.edit')} />
        <p className="text-sm text-destructive">{t('learnink.editor.error')}</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={isNew ? t('learnink.editor.new') : t('learnink.editor.edit')}
        actions={
          <Link to="learnink.stacks" variant="outline" type="back">
            {t('learnink.result.back')}
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('learnink.editor.name')}</CardTitle>
          </CardHeader>
          <CardContent>
            <TextField
              label={t('learnink.editor.name')}
              placeholder={t('learnink.editor.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField
                label={t('learnink.editor.creator')}
                description={t('learnink.editor.creatorHint')}
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
              />
              <TextField
                label={t('learnink.editor.examTime')}
                type="number"
                min={1}
                value={String(examMinutes)}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10)
                  setExamMinutes(Math.max(1, Number.isNaN(parsed) ? 1 : parsed))
                }}
              />
            </div>
            <div className="mt-4">
              <TextField
                label={t('learnink.editor.passingScore')}
                description={t('learnink.editor.passingScoreHint')}
                type="number"
                min={0}
                className="sm:max-w-xs"
                value={String(passingScore)}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10)
                  setPassingScore(
                    Math.max(0, Number.isNaN(parsed) ? 0 : parsed),
                  )
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('learnink.editor.questions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('learnink.editor.questionsEmpty')}
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {questions.map((question) => renderQuestion(question))}
              </div>
            )}
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => setQuestions([...questions, newQuestion()])}
            >
              <Plus className="size-4" />
              {t('learnink.editor.addQuestion')}
            </Button>
          </CardContent>
        </Card>

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}

        <Button disabled={saving} onClick={handleSave} className="w-fit">
          <Save className="size-4" />
          {t('learnink.editor.save')}
        </Button>
      </div>
    </PageContainer>
  )
}
