import { useArchiveStack, useStacks } from '@inkink/api'
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
} from '@inkink/ui'
import {
  Archive,
  BookOpen,
  FilePen,
  GraduationCap,
  Plus,
  Trophy,
} from 'lucide-react'
import { formatExamTime } from '../lib'

const TOP3_MEDALS = ['🥇', '🥈', '🥉']

export function StacksView() {
  const t = useTranslations()
  const { data, isLoading, isError } = useStacks()
  const archive = useArchiveStack()

  function handleArchive(id: string) {
    if (window.confirm(t('learnink.stack.archiveConfirm'))) {
      void archive.mutate(id)
    }
  }

  const stacks = data ?? []

  return (
    <PageContainer>
      <PageHeader
        title={t('learnink.stacks')}
        description={t('learnink.stacksSubtitle')}
        actions={
          <Link to="learnink.editNew" type="next">
            <Plus className="size-4" />
            {t('learnink.stacks.create')}
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t('learnink.stacks.loading')}
        </p>
      ) : isError ? (
        <p className="text-sm text-destructive">{t('learnink.stacks.error')}</p>
      ) : stacks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <GraduationCap className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {t('learnink.stacks.empty')}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {stacks.map((stack) => (
            <li key={stack.id}>
              <Card>
                <CardHeader className="flex-row items-start justify-between">
                  <div className="min-w-0">
                    <CardTitle className="flex flex-wrap items-center gap-2">
                      {stack.name}
                      {stack.archived && (
                        <Badge variant="outline">
                          {t('learnink.stack.archived')}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {stack.creatorName}
                      {' · '}
                      {t('learnink.stack.questions').replace(
                        '{count}',
                        String(stack.questions.length),
                      )}
                      {' · '}
                      {formatExamTime(stack.examTime)}
                    </CardDescription>
                  </div>
                  {!stack.archived && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleArchive(stack.id)}
                    >
                      <Archive className="size-4" />
                      {t('learnink.stack.archive')}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-foreground">
                    {t('learnink.stack.leaderboardTitle')}
                  </p>
                  {stack.leaderboard.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('learnink.stack.leaderboardEmpty')}
                    </p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {stack.leaderboard.map((entry, index) => (
                        <li key={`${entry.name}-${index}`} className="text-sm">
                          <span className="mr-2">
                            {TOP3_MEDALS[index] ?? '·'}
                          </span>
                          <span className="text-foreground">{entry.name}</span>
                          <span className="text-muted-foreground">
                            {' — '}
                            {entry.score} {t('learnink.stack.points')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {!stack.archived && (
                      <Link
                        to="learnink.learn"
                        params={{ id: stack.id }}
                        variant="default"
                        type="next"
                      >
                        <BookOpen className="size-4" />
                        {t('learnink.stack.learn')}
                      </Link>
                    )}
                    {!stack.archived && (
                      <Link
                        to="learnink.proof"
                        params={{ id: stack.id }}
                        variant="outline"
                        type="next"
                      >
                        <Trophy className="size-4" />
                        {t('learnink.stack.proof')}
                      </Link>
                    )}
                    <Link
                      to="learnink.edit"
                      params={{ id: stack.id }}
                      variant="ghost"
                      type="next"
                    >
                      <FilePen className="size-4" />
                      {t('learnink.stack.edit')}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  )
}
