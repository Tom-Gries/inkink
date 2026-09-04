import type { QuestionDto } from '@inkink/api'
import { useStack } from '@inkink/api'
import { useTranslations } from '@inkink/i18n'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Link,
  PageContainer,
  PageHeader,
  Textarea,
} from '@inkink/ui'
import { useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLearnQuestions, shuffle } from '../lib'
import { AnswerOptionsReview, AnswerSolution } from './answer-review'

function isSingleAnswer(question: QuestionDto): boolean {
  return (
    question.type === 'closed' &&
    question.answerOptions.filter((o) => o.correct).length === 1
  )
}

function isCorrectSelection(
  question: QuestionDto,
  selected: string[],
): boolean {
  const correct = question.answerOptions
    .filter((o) => o.correct)
    .map((o) => o.id)
    .sort()
  const chosen = [...selected].sort()
  return (
    correct.length === chosen.length &&
    correct.every((id, i) => id === chosen[i])
  )
}

export function LearnView() {
  const t = useTranslations()
  const params = useParams({ strict: false })
  const id = typeof params.id === 'string' ? params.id : undefined
  const { data, isLoading, isError } = useStack(id)

  const [questions, setQuestions] = useState<QuestionDto[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [openAnswer, setOpenAnswer] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (data) setQuestions(shuffle(getLearnQuestions(data)))
  }, [data])

  const total = questions.length
  const question = questions[current]
  const isRevealed = revealed[question?.id ?? ''] ?? false
  const isChecked = checked[question?.id ?? ''] ?? false
  const answerSelection = selected[question?.id ?? ''] ?? []

  function reveal(correct: boolean) {
    if (!question) return
    setChecked((state) => ({ ...state, [question.id]: correct }))
    setRevealed((state) => ({ ...state, [question.id]: true }))
  }

  function toggleOption(optionId: string) {
    if (isRevealed || !question) return
    const chosen = selected[question.id] ?? []

    if (isSingleAnswer(question)) {
      setSelected((state) => ({ ...state, [question.id]: [optionId] }))
      reveal(isCorrectSelection(question, [optionId]))
    } else {
      const next = chosen.includes(optionId)
        ? chosen.filter((id) => id !== optionId)
        : [...chosen, optionId]
      setSelected((state) => ({ ...state, [question.id]: next }))
    }
  }

  function checkMulti() {
    if (isRevealed || !question) return
    reveal(isCorrectSelection(question, answerSelection))
  }

  function checkOpen() {
    if (isRevealed || !question) return
    reveal(true)
  }

  if (total === 0) {
    return (
      <PageContainer>
        <PageHeader
          title={t('learnink.learn.title')}
          description={t('learnink.learn.subtitle')}
        />
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            {t('learnink.learn.loading')}
          </p>
        ) : isError || !data ? (
          <p className="text-sm text-destructive">
            {t('learnink.learn.notFound')}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('learnink.learn.empty')}
          </p>
        )}
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('learnink.learn.title')}
        description={t('learnink.learn.subtitle')}
        actions={
          <Link to="learnink.stacks" variant="outline" type="back">
            {t('learnink.result.back')}
          </Link>
        }
      />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {t('learnink.learn.question')
            .replace('{current}', String(current + 1))
            .replace('{total}', String(total))}
        </p>

        <Card>
          <CardHeader>
            <CardTitle>{question.question}</CardTitle>
            <CardDescription>
              {question.points} {t('learnink.stack.points')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {question.type === 'open' ? (
              <Textarea
                placeholder={t('learnink.learn.answerPlaceholder')}
                value={openAnswer[question.id] ?? ''}
                disabled={isRevealed}
                onChange={(e) =>
                  setOpenAnswer((state) => ({
                    ...state,
                    [question.id]: e.target.value,
                  }))
                }
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {question.answerOptions.map((option) => {
                  const isCorrectAnswer = option.correct
                  const isChosen =
                    isRevealed && answerSelection.includes(option.id)
                  return (
                    <Button
                      key={option.id}
                      variant={
                        isRevealed
                          ? isCorrectAnswer
                            ? 'success'
                            : isChosen
                              ? 'destructive'
                              : 'outline'
                          : answerSelection.includes(option.id)
                            ? 'default'
                            : 'outline'
                      }
                      className="w-full justify-start"
                      disabled={isRevealed}
                      onClick={() => toggleOption(option.id)}
                    >
                      {option.text}
                    </Button>
                  )
                })}
              </div>
            )}

            {question.type === 'closed' &&
            !isSingleAnswer(question) &&
            !isRevealed ? (
              <Button className="mt-3" onClick={checkMulti}>
                {t('learnink.learn.check')}
              </Button>
            ) : null}

            {question.type === 'open' && !isRevealed ? (
              <Button className="mt-3" onClick={checkOpen}>
                {t('learnink.learn.check')}
              </Button>
            ) : null}

            {isRevealed && (
              <div className="mt-4 flex flex-col gap-3 rounded-md border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  {question.type === 'open' ? (
                    <Badge variant="secondary">
                      {t('learnink.learn.answer')}
                    </Badge>
                  ) : isChecked ? (
                    <Badge variant="success">
                      <Check className="size-3" />
                      {t('learnink.learn.correct')}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <X className="size-3" />
                      {t('learnink.learn.wrong')}
                    </Badge>
                  )}
                </div>
                {question.type === 'open' ? (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {t('learnink.result.yourAnswer')}
                    </p>
                    <p className="break-words text-sm">
                      {(openAnswer[question.id] ?? '').trim().length > 0
                        ? openAnswer[question.id]
                        : t('learnink.learn.selectAnswer')}
                    </p>
                    <AnswerSolution question={question} />
                  </>
                ) : (
                  <>
                    <AnswerOptionsReview
                      question={question}
                      selected={answerSelection}
                    />
                    <AnswerSolution question={question} />
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
          >
            <ArrowLeft className="size-4" />
            {t('learnink.learn.back')}
          </Button>
          {current < total - 1 || !isRevealed ? (
            <Button
              variant="default"
              disabled={current >= total - 1}
              onClick={() => setCurrent(current + 1)}
              className="ml-auto"
            >
              {t('learnink.learn.next')}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Link
              to="learnink.stacks"
              variant="default"
              type="back"
              className="ml-auto"
            >
              {t('learnink.result.back')}
            </Link>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
