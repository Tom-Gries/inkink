import type { QuestionDto } from '@inkink/api'
import { useAddLeaderboardEntry, useStack } from '@inkink/api'
import { useTranslations } from '@inkink/i18n'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Link,
  PageContainer,
  PageHeader,
  ProgressControl,
} from '@inkink/ui'
import { useAuthStore } from '@inkink/ui-auth'
import { useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { randomDefaultName } from '../constants'
import {
  evaluateProof,
  formatTime,
  getProofQuestions,
  qualifiesForTop3,
  shuffle,
} from '../lib'
import { AnswerOptionsReview, AnswerSolution } from './answer-review'

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

export function ProofView() {
  const t = useTranslations()
  const params = useParams({ strict: false })
  const id = typeof params.id === 'string' ? params.id : undefined
  const { data, isLoading, isError } = useStack(id)
  const addEntry = useAddLeaderboardEntry()
  const user = useAuthStore((state) => state.user)

  const [questions, setQuestions] = useState<QuestionDto[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [startedAt, setStartedAt] = useState<number>(0)
  // Startzeit pro Frage (Frage-ID -> Zeitstempel). Wird beim ersten Öffnen
  // gesetzt und beim Zurückgehen NICHT zurückgesetzt.
  const [questionStarted, setQuestionStarted] = useState<
    Record<string, number>
  >({})
  const [now, setNow] = useState<number>(0)
  const [examTime, setExamTime] = useState<number>(0)
  const [done, setDone] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const leaderboardNameState = useState(
    () => user?.username ?? randomDefaultName(),
  )
  const leaderboardName = leaderboardNameState[0]
  const setLeaderboardName = leaderboardNameState[1]

  useEffect(() => {
    if (data) {
      const proofQuestions = shuffle(getProofQuestions(data))
      if (proofQuestions.length > 0) {
        const start = Date.now()
        setQuestions(proofQuestions)
        setExamTime(data.examTime)
        setStartedAt(start)
        setQuestionStarted({})
        setNow(start)
      }
    }
  }, [data])

  function finish() {
    if (!done) setDone(true)
  }

  /** Heartbeat: re-rendert die Ansicht, damit beide Countdowns laufen. */
  useEffect(() => {
    if (done || startedAt === 0) return
    const interval = setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      if ((tick - startedAt) / 1000 >= examTime) setDone(true)
    }, 250)
    return () => clearInterval(interval)
  }, [done, startedAt, examTime])

  /** Setzt die Startzeit einer Frage beim ersten Öffnen (kein Reset zurück). */
  useEffect(() => {
    if (startedAt === 0 || done) return
    const question = questions[current]
    if (!question) return
    setQuestionStarted((state) =>
      state[question.id] === undefined
        ? { ...state, [question.id]: Date.now() }
        : state,
    )
  }, [current, startedAt, done, questions])

  function toggleOption(question: QuestionDto, optionId: string) {
    if (done) return
    const chosen = selected[question.id] ?? []
    const next = chosen.includes(optionId)
      ? chosen.filter((id) => id !== optionId)
      : [...chosen, optionId]
    setSelected((state) => ({ ...state, [question.id]: next }))
  }

  const total = questions.length
  // Verstrichene / verbleibende Gesamtzeit (live über „now"-Tick).
  const elapsed = startedAt > 0 ? Math.max(0, (now - startedAt) / 1000) : 0
  const remaining = Math.max(0, examTime - elapsed)
  // Zu Beginn berechnetes Zeitbudget je Frage; zählt ab Öffnen herunter.
  const perQuestionBudget = total > 0 ? Math.max(1, examTime / total) : 0
  const questionStart =
    questionStarted[questions[current]?.id ?? ''] ?? startedAt
  const currentElapsed =
    startedAt > 0 ? Math.max(0, (now - questionStart) / 1000) : 0
  // Kann ins Minus laufen (Budget überschritten) – Formatierung zeigt ein '-'.
  const perQuestionRemaining = Math.min(
    perQuestionBudget - currentElapsed,
    remaining,
  )
  const perQuestionFraction =
    perQuestionBudget > 0
      ? Math.max(0, Math.min(1, perQuestionRemaining / perQuestionBudget))
      : 0

  const elapsedSeconds = Math.floor(elapsed)

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title={t('learnink.proof.title')} />
        <p className="text-sm text-muted-foreground">
          {t('learnink.proof.loading')}
        </p>
      </PageContainer>
    )
  }

  if (isError || !data) {
    return (
      <PageContainer>
        <PageHeader title={t('learnink.proof.title')} />
        <p className="text-sm text-destructive">
          {t('learnink.proof.notFound')}
        </p>
      </PageContainer>
    )
  }

  if (total === 0 && !done) {
    return (
      <PageContainer>
        <PageHeader title={t('learnink.proof.title')} />
        <p className="text-sm text-muted-foreground">
          {t('learnink.proof.empty')}
        </p>
      </PageContainer>
    )
  }

  const question = questions[current]
  if (!done) {
    return (
      <PageContainer>
        <PageHeader
          title={t('learnink.proof.title')}
          description={t('learnink.proof.subtitle')}
          actions={
            <Link to="learnink.stacks" variant="outline" type="back">
              {t('learnink.result.back')}
            </Link>
          }
        />
        <div className="flex flex-col gap-4">
          {/* Kopfzeile: Frage-Zähler links, Gesamtzeit rechts oben */}
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t('learnink.proof.question')
                .replace('{current}', String(current + 1))
                .replace('{total}', String(total))}
            </p>
            <p className="text-4xl font-bold tabular-nums">
              {formatTime(remaining)}
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{question.question}</CardTitle>
              <CardDescription>
                {question.points} {t('learnink.stack.points')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {question.type === 'open' ? (
                <div className="rounded-md border border-dashed border-border p-4" />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {question.answerOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        selected[question.id]?.includes(option.id)
                          ? 'default'
                          : 'outline'
                      }
                      className="w-full justify-start"
                      onClick={() => toggleOption(question, option.id)}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fragezeit: unter der Frage */}
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('learnink.proof.perQuestion')}
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {formatTime(perQuestionRemaining)}
            </p>
          </div>
          <ProgressControl value={Math.round(perQuestionFraction * 100)} />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              <ArrowLeft className="size-4" />
              {t('learnink.proof.back')}
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (current >= total - 1) {
                  if (window.confirm(t('learnink.proof.submitConfirm')))
                    finish()
                } else {
                  setCurrent(current + 1)
                }
              }}
              className="ml-auto"
            >
              {current >= total - 1
                ? t('learnink.proof.finish')
                : t('learnink.proof.next')}
              {current >= total - 1 ? (
                <Check className="size-4" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </Button>
          </div>

          <Button
            variant="destructive"
            className="w-full sm:w-fit sm:self-end"
            onClick={() => {
              if (window.confirm(t('learnink.proof.submitConfirm'))) finish()
            }}
          >
            {t('learnink.proof.submit')}
          </Button>
        </div>
      </PageContainer>
    )
  }
  const evaluation = evaluateProof(new Map(Object.entries(selected)), questions)
  const passingScore = data.passingScore ?? 0
  const passed = passingScore > 0 ? evaluation.achieved >= passingScore : null
  const entry = {
    name: leaderboardName,
    score: evaluation.achieved,
    time: elapsedSeconds,
  }
  const qualifies = qualifiesForTop3(entry, data.leaderboard)

  async function handleRegister() {
    setRegistering(true)
    setRegisterError(null)
    try {
      await addEntry.mutateAsync({ id: data.id, entry })
      setRegistered(true)
    } catch (error) {
      setRegisterError(
        error instanceof Error ? error.message : t('learnink.result.saveError'),
      )
    } finally {
      setRegistering(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title={t('learnink.result.title')} />

      <Card>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">
            {t('learnink.result.score')
              .replace('{achieved}', String(evaluation.achieved))
              .replace('{possible}', String(evaluation.possible))}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {evaluation.percent} %
          </p>
          {passed !== null && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={passed ? 'success' : 'destructive'}>
                {passed ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
                {passed
                  ? t('learnink.result.passed')
                  : t('learnink.result.failed')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t('learnink.result.passingScore').replace(
                  '{points}',
                  String(passingScore),
                )}
              </span>
            </div>
          )}
          <p className="mt-2 text-sm">
            {t('learnink.result.detail')}: {evaluation.achieved} /{' '}
            {evaluation.possible}
          </p>
          {evaluation.hasOpen && (
            <p className="mt-1 text-sm text-muted-foreground">
              {t('learnink.result.openNote').replace(
                '{points}',
                String(evaluation.openPoints),
              )}
            </p>
          )}
          <p className="mt-3 text-sm">
            {t('learnink.result.time').replace('{time}', formatTime(elapsed))}
          </p>
          {remaining === 0 && (
            <p className="mt-2 text-sm font-medium text-destructive">
              {t('learnink.proof.timeUp')}
            </p>
          )}
        </CardContent>
      </Card>

      {qualifies && !registered && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t('learnink.result.top3')}</CardTitle>
            <CardDescription>
              {t('learnink.result.registerPrompt')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="leaderboard-name"
                className="text-sm font-medium text-foreground"
              >
                {t('learnink.result.name')}
              </label>
              <Input
                id="leaderboard-name"
                value={leaderboardName}
                maxLength={80}
                onChange={(e) => setLeaderboardName(e.target.value)}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button disabled={registering} onClick={handleRegister}>
                <Check className="size-4" />
                {t('learnink.result.yes')}
              </Button>
              <Button
                variant="outline"
                disabled={registering}
                onClick={() => setRegistered(true)}
              >
                {t('learnink.result.no')}
              </Button>
            </div>
            {registerError && (
              <p className="mt-3 text-sm text-destructive">{registerError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {registered && (
        <p className="mt-4 text-sm font-medium text-success">
          {t('learnink.result.registered')}
        </p>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">{t('learnink.result.review')}</h2>
        <div className="mt-3 flex flex-col gap-4">
          {questions.map((question, index) => {
            const chosen = selected[question.id] ?? []
            const correct =
              question.type === 'open'
                ? null
                : isCorrectSelection(question, chosen)
            return (
              <Card key={question.id}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-sm">
                    {index + 1}. {question.question}
                  </CardTitle>
                  {question.type === 'closed' && (
                    <Badge variant={correct ? 'success' : 'destructive'}>
                      {correct ? (
                        <Check className="size-3" />
                      ) : (
                        <X className="size-3" />
                      )}
                      {correct
                        ? t('learnink.learn.correct')
                        : t('learnink.learn.wrong')}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {question.type === 'open' ? (
                    <p className="text-sm text-muted-foreground">
                      {t('learnink.result.yourAnswer')}:{' '}
                      {t('learnink.result.openAnswer')}
                    </p>
                  ) : (
                    <>
                      <AnswerOptionsReview
                        question={question}
                        selected={chosen}
                      />
                      <div className="mt-3">
                        <AnswerSolution question={question} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <Link to="learnink.stacks" variant="outline" type="back">
          {t('learnink.result.back')}
        </Link>
      </div>
    </PageContainer>
  )
}
