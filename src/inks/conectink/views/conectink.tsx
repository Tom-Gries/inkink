import {
  BookOpen,
  Check,
  Plus,
  Search,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import {
  type ConnectedUserDto,
  type GroupDto,
  type GroupRole,
  type StackDto,
  type StackInputDto,
  type UserSearchDto,
  useAcceptConnectRequest,
  useAcceptGroupInvitation,
  useAddGroupMember,
  useConnectinkConnections,
  useConnectinkGroupInvitations,
  useConnectinkGroups,
  useConnectinkRequests,
  useConnectinkSearch,
  useCreateGroup,
  useDeleteGroup,
  useGroupStacks,
  useIgnoreConnectRequest,
  useIgnoreGroupInvitation,
  useRejectConnectRequest,
  useRejectGroupInvitation,
  useRemoveConnection,
  useRemoveGroupAdmin,
  useRemoveGroupMember,
  useSendConnectRequest,
  useSetGroupAdmin,
  useStacks,
  useUpdateGroup,
  useUpdateStack,
} from '../../../api/index'
import { useTranslations } from '../../../i18n/index'
import {
  AvatarControl,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  cn,
  Input,
  Link,
  PageContainer,
  PageHeader,
} from '../../../ui/index'

type Tab = 'discover' | 'requests' | 'connections'

type RequestsQueryResult = ReturnType<typeof useConnectinkRequests>
type ConnectionsQueryResult = ReturnType<typeof useConnectinkConnections>
type GroupsQueryResult = ReturnType<typeof useConnectinkGroups>

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

/**
 * Conectink-Hauptseite: Drei Bereiche (Entdecken / Anfragen / Verbunden),
 * über eine leichte Tab-Leiste umschaltbar. Der "Anfragen"-Tab zeigt die
 * Anzahl offener eingehender Anfragen als Badge. Unterhalb der Tabs folgt
 * die Gruppen-Verwaltung als eigene Box.
 */
export function ConectinkView() {
  const t = useTranslations()
  const [tab, setTab] = useState<Tab>('discover')

  const requests = useConnectinkRequests()
  const connections = useConnectinkConnections()
  const groups = useConnectinkGroups()

  const send = useSendConnectRequest()
  const accept = useAcceptConnectRequest()
  const reject = useRejectConnectRequest()
  const ignore = useIgnoreConnectRequest()
  const remove = useRemoveConnection()
  const deleteGroup = useDeleteGroup()

  const [removeTarget, setRemoveTarget] = useState<ConnectedUserDto | null>(
    null,
  )
  const [groupDeleteTarget, setGroupDeleteTarget] = useState<GroupDto | null>(
    null,
  )

  const pendingIncoming = requests.data?.incoming.length ?? 0

  function confirmRemove() {
    if (removeTarget) {
      remove.mutate(removeTarget.id)
    }
  }

  function confirmDeleteGroup() {
    if (groupDeleteTarget) {
      deleteGroup.mutate(groupDeleteTarget.id)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('conectink.page.title')}
        description={t('conectink.page.description')}
      />

      <div
        role="tablist"
        aria-label={t('conectink.tabs.label')}
        className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1"
      >
        <TabButton
          active={tab === 'discover'}
          onClick={() => setTab('discover')}
        >
          {t('conectink.tabs.discover')}
        </TabButton>
        <TabButton
          active={tab === 'requests'}
          badge={pendingIncoming}
          onClick={() => setTab('requests')}
        >
          {t('conectink.tabs.requests')}
        </TabButton>
        <TabButton
          active={tab === 'connections'}
          onClick={() => setTab('connections')}
        >
          {t('conectink.tabs.connections')}
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === 'discover' ? (
          <DiscoverTab send={send} onGoToRequests={() => setTab('requests')} />
        ) : null}
        {tab === 'requests' ? (
          <RequestsTab
            requests={requests}
            accept={accept}
            reject={reject}
            ignore={ignore}
          />
        ) : null}
        {tab === 'connections' ? (
          <ConnectionsTab
            connections={connections}
            onRemove={setRemoveTarget}
          />
        ) : null}
      </div>

      {/* Gruppen als eigene Box unterhalb der Tabs. */}
      <GroupsTab groups={groups} onDelete={setGroupDeleteTarget} />

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
        title={
          removeTarget
            ? t('conectink.connections.removeConfirmTitle').replace(
                '{name}',
                removeTarget.user.name,
              )
            : ''
        }
        description={t('conectink.connections.removeConfirmDescription')}
        confirmLabel={t('conectink.connections.remove')}
        cancelLabel={t('conectink.confirm.cancel')}
        destructive
        onConfirm={confirmRemove}
      />

      <ConfirmDialog
        open={groupDeleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setGroupDeleteTarget(null)
        }}
        title={
          groupDeleteTarget
            ? t('conectink.groups.deleteConfirmTitle').replace(
                '{name}',
                groupDeleteTarget.name,
              )
            : ''
        }
        description={t('conectink.groups.deleteConfirmDescription')}
        confirmLabel={t('conectink.groups.delete')}
        cancelLabel={t('conectink.confirm.cancel')}
        destructive
        onConfirm={confirmDeleteGroup}
      />
    </PageContainer>
  )
}

function TabButton({
  active,
  badge,
  onClick,
  children,
}: {
  active: boolean
  badge?: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
      {badge !== undefined && badge > 0 ? (
        <Badge variant="destructive">{badge}</Badge>
      ) : null}
    </button>
  )
}

/**
 * Entdecken-Tab: Namenssuche mit eigenem Input + Submit. Die Suche wird erst
 * beim Absenden des Formulars gestartet; jeder Treffer zeigt passend zur
 * aktuellen `relation` den richtigen Aktions-Button.
 */
function DiscoverTab({
  send,
  onGoToRequests,
}: {
  send: ReturnType<typeof useSendConnectRequest>
  onGoToRequests: () => void
}) {
  const t = useTranslations()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const search = useConnectinkSearch(submitted)
  const results = search.data ?? []

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(query.trim())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('conectink.search.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('conectink.search.placeholder')}
            aria-label={t('conectink.search.label')}
          />
          <Button type="submit" className="shrink-0">
            <Search className="size-4" />
            {t('conectink.search.button')}
          </Button>
        </form>

        {send.isError ? (
          <p className="text-sm text-destructive">
            {send.error instanceof Error
              ? send.error.message
              : t('conectink.errors.requestFailed')}
          </p>
        ) : null}

        {!submitted ? (
          <p className="text-sm text-muted-foreground">
            {t('conectink.search.emptyQuery')}
          </p>
        ) : search.isLoading ? (
          <p className="text-sm text-muted-foreground">
            {t('conectink.search.loading')}
          </p>
        ) : search.isError ? (
          <p className="text-sm text-destructive">
            {t('conectink.search.error')}
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('conectink.search.noResults').replace('{query}', submitted)}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <AvatarControl
                    name={result.name}
                    src={result.image ?? undefined}
                  />
                  <p className="truncate text-sm font-medium text-foreground">
                    {result.name}
                  </p>
                </div>
                <RelationAction
                  result={result}
                  send={send}
                  onGoToRequests={onGoToRequests}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

/** Relationsabhängiger Aktions-Button/-Badge für einen Sucher-Treffer. */
function RelationAction({
  result,
  send,
  onGoToRequests,
}: {
  result: UserSearchDto
  send: ReturnType<typeof useSendConnectRequest>
  onGoToRequests: () => void
}) {
  const t = useTranslations()

  switch (result.relation) {
    case 'accepted':
      return (
        <Badge variant="success">{t('conectink.relation.connected')}</Badge>
      )
    case 'outgoingPending':
      return (
        <Badge variant="outline">{t('conectink.relation.requestSent')}</Badge>
      )
    case 'ignored':
      return (
        <Badge variant="destructive">{t('conectink.relation.ignored')}</Badge>
      )
    case 'incomingPending':
      return (
        <Button size="sm" variant="outline" onClick={onGoToRequests}>
          {t('conectink.relation.incoming')}
        </Button>
      )
    case 'rejected':
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={send.isPending}
          onClick={() => send.mutate(result.id)}
        >
          {t('conectink.relation.requestAgain')}
        </Button>
      )
    default:
      return (
        <Button
          size="sm"
          disabled={send.isPending}
          onClick={() => send.mutate(result.id)}
        >
          {t('conectink.relation.connect')}
        </Button>
      )
  }
}

/**
 * Anfragen-Tab: Eingehende Anfragen mit Akzeptieren/Ablehnen/Ignorieren,
 * darunter die gesendeten (noch offenen) Anfragen als Statusliste.
 */
function RequestsTab({
  requests,
  accept,
  reject,
  ignore,
}: {
  requests: RequestsQueryResult
  accept: ReturnType<typeof useAcceptConnectRequest>
  reject: ReturnType<typeof useRejectConnectRequest>
  ignore: ReturnType<typeof useIgnoreConnectRequest>
}) {
  const t = useTranslations()
  const incoming = requests.data?.incoming ?? []
  const outgoing = requests.data?.outgoing ?? []

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('conectink.requests.incoming')}</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t('conectink.loading')}
            </p>
          ) : requests.isError ? (
            <p className="text-sm text-destructive">
              {t('conectink.loadError')}
            </p>
          ) : incoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('conectink.requests.incomingEmpty')}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {incoming.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AvatarControl
                      name={request.user.name}
                      src={request.user.image ?? undefined}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {request.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={accept.isPending}
                      onClick={() => accept.mutate(request.id)}
                    >
                      <Check className="size-4" />
                      {t('conectink.requests.accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reject.isPending}
                      onClick={() => reject.mutate(request.id)}
                    >
                      <X className="size-4" />
                      {t('conectink.requests.reject')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={ignore.isPending}
                      onClick={() => ignore.mutate(request.id)}
                    >
                      {t('conectink.requests.ignore')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('conectink.requests.outgoing')}</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t('conectink.loading')}
            </p>
          ) : requests.isError ? (
            <p className="text-sm text-destructive">
              {t('conectink.loadError')}
            </p>
          ) : outgoing.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('conectink.requests.outgoingEmpty')}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {outgoing.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AvatarControl
                      name={request.user.name}
                      src={request.user.image ?? undefined}
                    />
                    <p className="truncate text-sm font-medium text-foreground">
                      {request.user.name}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {t('conectink.requests.waiting')}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/** Verbunden-Tab: Liste der Verbundenen mit Entfernen-Aktion. */
function ConnectionsTab({
  connections,
  onRemove,
}: {
  connections: ConnectionsQueryResult
  onRemove: (connection: ConnectedUserDto) => void
}) {
  const t = useTranslations()
  const items = connections.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('conectink.connections.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {connections.isLoading ? (
          <p className="text-sm text-muted-foreground">
            {t('conectink.loading')}
          </p>
        ) : connections.isError ? (
          <p className="text-sm text-destructive">{t('conectink.loadError')}</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <UsersRound
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              {t('conectink.connections.empty')}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {items.map((connection) => (
              <li
                key={connection.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <AvatarControl
                    name={connection.user.name}
                    src={connection.user.image ?? undefined}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {connection.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('conectink.connections.since').replace(
                        '{date}',
                        formatDate(connection.since),
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onRemove(connection)}
                >
                  <Trash2 className="size-4" />
                  {t('conectink.connections.remove')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
/** Darf ich in der Gruppe ein Mitglied hinzufügen (Rollen-/Richtlinien-Matrix)? */
function canAddHere(group: GroupDto): boolean {
  if (group.myRole === 'owner' || group.myRole === 'admin') return true

  return (
    group.management === 'members_add' || group.management === 'members_full'
  )
}

/** Darf ich in der Gruppe ein Ziel-Mitglied (Rolle) entfernen? */
function canRemoveHere(group: GroupDto, targetRole: GroupRole): boolean {
  if (targetRole === 'owner') return false
  if (group.myRole === 'owner') return true
  if (group.myRole === 'admin') return targetRole === 'member'

  return group.management === 'members_full' && targetRole === 'member'
}

/**
 * Gruppen-Box: Neue Gruppe erstellen und vorhandene Gruppen verwalten
 * (Mitglieder hinzufügen/entfernen, Admins, Umbenennen, Richtlinie, Löschen).
 * Eigene Box unterhalb der Tabs der Conectink-Hauptseite.
 */
function GroupsTab({
  groups,
  onDelete,
}: {
  groups: GroupsQueryResult
  onDelete: (group: GroupDto) => void
}) {
  const t = useTranslations()
  const create = useCreateGroup()
  const connections = useConnectinkConnections()
  const invitations = useConnectinkGroupInvitations()
  const acceptInvitation = useAcceptGroupInvitation()
  const rejectInvitation = useRejectGroupInvitation()
  const ignoreInvitation = useIgnoreGroupInvitation()
  const [newGroupName, setNewGroupName] = useState('')
  const [managedId, setManagedId] = useState<string | null>(null)

  const items = groups.data ?? []
  const pendingInvitations = invitations.data ?? []

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const name = newGroupName.trim()
    if (!name) return
    create.mutate(name, { onSuccess: () => setNewGroupName('') })
  }

  return (
    <section className="mt-10 flex flex-col gap-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
        <UsersRound className="size-5" aria-hidden="true" />
        {t('conectink.groups.title')}
      </h2>

      {pendingInvitations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('conectink.groups.invitations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {pendingInvitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {invitation.group.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('conectink.groups.invitedBy').replace(
                        '{name}',
                        invitation.invitedBy.name,
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={acceptInvitation.isPending}
                      onClick={() =>
                        acceptInvitation.mutate(invitation.group.id)
                      }
                    >
                      <Check className="size-4" />
                      {t('conectink.groups.accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={rejectInvitation.isPending}
                      onClick={() =>
                        rejectInvitation.mutate(invitation.group.id)
                      }
                    >
                      <X className="size-4" />
                      {t('conectink.groups.reject')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={ignoreInvitation.isPending}
                      onClick={() =>
                        ignoreInvitation.mutate(invitation.group.id)
                      }
                    >
                      {t('conectink.groups.ignore')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('conectink.groups.create')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              value={newGroupName}
              onChange={(event) => setNewGroupName(event.target.value)}
              placeholder={t('conectink.groups.namePlaceholder')}
              aria-label={t('conectink.groups.nameLabel')}
            />
            <Button type="submit" className="shrink-0">
              <Plus className="size-4" />
              {t('conectink.groups.createButton')}
            </Button>
          </form>
          {create.isError ? (
            <p className="mt-3 text-sm text-destructive">
              {create.error instanceof Error
                ? create.error.message
                : t('conectink.errors.requestFailed')}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {groups.isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t('conectink.loading')}
        </p>
      ) : groups.isError ? (
        <p className="text-sm text-destructive">{t('conectink.loadError')}</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
          <UsersRound
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            {t('conectink.groups.empty')}
          </p>
        </div>
      ) : (
        items.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            connected={connections.data ?? []}
            managed={managedId === group.id}
            onToggleManage={() =>
              setManagedId((current) =>
                current === group.id ? null : group.id,
              )
            }
            onDelete={() => onDelete(group)}
          />
        ))
      )}
    </section>
  )
}

/** Eine Gruppe als Karte: Mitgliederliste + Verwaltungs-Panel. */
function GroupCard({
  group,
  connected,
  managed,
  onToggleManage,
  onDelete,
}: {
  group: GroupDto
  connected: ConnectedUserDto[]
  managed: boolean
  onToggleManage: () => void
  onDelete: () => void
}) {
  const t = useTranslations()
  const addMember = useAddGroupMember()
  const removeMember = useRemoveGroupMember()
  const setAdmin = useSetGroupAdmin()
  const removeAdmin = useRemoveGroupAdmin()
  const updateGroup = useUpdateGroup()
  const groupStacks = useGroupStacks(group.id)
  const myStacks = useStacks({ mine: true })
  const updateStack = useUpdateStack()

  const [editName, setEditName] = useState(group.name)
  const [policy, setPolicy] = useState(group.management)

  const memberIds = new Set(group.members.map((member) => member.userId))
  const invitedIds = new Set(
    group.invitations.map((invitation) => invitation.userId),
  )
  const addable = connected.filter(
    (connection) =>
      !memberIds.has(connection.user.id) && !invitedIds.has(connection.user.id),
  )

  const groupStackIds = new Set(
    (groupStacks.data ?? []).map((stack) => stack.id),
  )
  const addableStacks = (myStacks.data ?? []).filter(
    (stack) => !groupStackIds.has(stack.id),
  )
  const groupStackList = (groupStacks.data ?? []).filter(
    (stack) => !stack.archived,
  )

  const isOwner = group.myRole === 'owner'
  const isAdmin = group.myRole === 'admin'
  const hasManageRights =
    group.myRole !== 'member' || group.management !== 'owner'

  function handleRename(event: React.FormEvent) {
    event.preventDefault()
    const name = editName.trim()
    if (name && name !== group.name) {
      updateGroup.mutate({ id: group.id, input: { name } })
    }
  }

  function stackToInput(stack: StackDto): StackInputDto {
    return {
      name: stack.name,
      creatorName: stack.creatorName,
      examTime: stack.examTime,
      passingScore: stack.passingScore,
      isPublic: stack.isPublic,
      questions: stack.questions,
      groupIds: stack.groups.map((g) => g.id),
    }
  }

  function addStackToGroup(stack: StackDto) {
    updateStack.mutate({
      id: stack.id,
      input: {
        ...stackToInput(stack),
        groupIds: [...stack.groups.map((g) => g.id), group.id],
      },
    })
  }

  function removeStackFromGroup(stack: StackDto) {
    updateStack.mutate({
      id: stack.id,
      input: {
        ...stackToInput(stack),
        groupIds: stack.groups
          .filter((g) => g.id !== group.id)
          .map((g) => g.id),
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="truncate">{group.name}</span>
          <Badge variant={isOwner ? 'default' : 'secondary'}>
            {t(`conectink.roles.${group.myRole}`)}
          </Badge>
        </CardTitle>
        <CardDescription>
          {group.members.length} {t('conectink.groups.members')}
          {' · '}
          {t(`conectink.policies.${group.management}`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col divide-y divide-border">
          {group.members.map((member) => (
            <li
              key={member.userId}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <AvatarControl
                  name={member.name}
                  src={member.image ?? undefined}
                />
                <p className="truncate text-sm font-medium text-foreground">
                  {member.name}
                </p>
                {member.role !== 'member' ? (
                  <Badge
                    variant={member.role === 'owner' ? 'default' : 'secondary'}
                  >
                    {t(`conectink.roles.${member.role}`)}
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isOwner && member.role === 'member' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={setAdmin.isPending}
                    onClick={() =>
                      setAdmin.mutate({
                        groupId: group.id,
                        userId: member.userId,
                      })
                    }
                  >
                    {t('conectink.groups.makeAdmin')}
                  </Button>
                ) : null}
                {isOwner && member.role === 'admin' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={removeAdmin.isPending}
                    onClick={() =>
                      removeAdmin.mutate({
                        groupId: group.id,
                        userId: member.userId,
                      })
                    }
                  >
                    {t('conectink.groups.removeAdmin')}
                  </Button>
                ) : null}
                {canRemoveHere(group, member.role) ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={removeMember.isPending}
                    onClick={() =>
                      removeMember.mutate({
                        groupId: group.id,
                        userId: member.userId,
                      })
                    }
                    aria-label={t('conectink.groups.removeMember')}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {group.invitations.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">
              {t('conectink.groups.invitations')}
            </p>
            <ul className="flex flex-col divide-y divide-border">
              {group.invitations.map((invitation) => (
                <li
                  key={invitation.userId}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AvatarControl
                      name={invitation.name}
                      src={invitation.image ?? undefined}
                    />
                    <p className="truncate text-sm font-medium text-foreground">
                      {invitation.name}
                    </p>
                    <Badge variant="outline">
                      {t('conectink.groups.invitedWaiting')}
                    </Badge>
                  </div>
                  {canRemoveHere(group, 'member') ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={removeMember.isPending}
                      onClick={() =>
                        removeMember.mutate({
                          groupId: group.id,
                          userId: invitation.userId,
                        })
                      }
                      aria-label={t('conectink.groups.withdrawInvite')}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">
            {t('conectink.groups.stacks')}
          </p>
          {groupStacks.isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t('conectink.loading')}
            </p>
          ) : groupStackList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('conectink.groups.stacksEmpty')}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {groupStackList.map((stack) => (
                <li
                  key={stack.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {stack.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="learnink.learn"
                      params={{ id: stack.id }}
                      variant="outline"
                      type="next"
                    >
                      <BookOpen className="size-4" />
                      {t('conectink.groups.learn')}
                    </Link>
                    {(myStacks.data ?? []).some((s) => s.id === stack.id) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateStack.isPending}
                        onClick={() => removeStackFromGroup(stack)}
                        aria-label={t('conectink.groups.removeStack')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {addableStacks.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">
                {t('conectink.groups.addStack')}
              </p>
              <ul className="flex flex-col divide-y divide-border">
                {addableStacks.map((stack) => (
                  <li
                    key={stack.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2"
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {stack.name}
                    </p>
                    <Button
                      size="sm"
                      disabled={updateStack.isPending}
                      onClick={() => addStackToGroup(stack)}
                    >
                      {t('conectink.groups.addStackButton')}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {updateStack.isError ? (
            <p className="text-sm text-destructive">
              {updateStack.error instanceof Error
                ? updateStack.error.message
                : t('conectink.errors.requestFailed')}
            </p>
          ) : null}
        </div>

        {managed && hasManageRights ? (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4">
            {canAddHere(group) ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {t('conectink.groups.addMembersTitle')}
                </p>
                {addable.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('conectink.groups.noAddable')}
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border">
                    {addable.map((connection) => (
                      <li
                        key={connection.user.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <AvatarControl
                            name={connection.user.name}
                            src={connection.user.image ?? undefined}
                          />
                          <p className="truncate text-sm font-medium text-foreground">
                            {connection.user.name}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={addMember.isPending}
                          onClick={() =>
                            addMember.mutate({
                              groupId: group.id,
                              userId: connection.user.id,
                            })
                          }
                        >
                          {t('conectink.groups.addMember')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {addMember.isError ? (
                  <p className="text-sm text-destructive">
                    {addMember.error instanceof Error
                      ? addMember.error.message
                      : t('conectink.errors.requestFailed')}
                  </p>
                ) : null}
              </div>
            ) : null}

            {isOwner || isAdmin ? (
              <form onSubmit={handleRename} className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {t('conectink.groups.rename')}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    aria-label={t('conectink.groups.nameLabel')}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="shrink-0"
                    disabled={updateGroup.isPending}
                  >
                    {t('conectink.groups.save')}
                  </Button>
                </div>
              </form>
            ) : null}

            {isOwner ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {t('conectink.groups.policyTitle')}
                </p>
                <div className="flex flex-col gap-1.5">
                  {(['owner', 'members_add', 'members_full'] as const).map(
                    (option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                      >
                        <input
                          type="radio"
                          name={`policy-${group.id}`}
                          checked={policy === option}
                          onChange={() => {
                            setPolicy(option)
                            updateGroup.mutate({
                              id: group.id,
                              input: { management: option },
                            })
                          }}
                        />
                        {t(`conectink.policies.${option}`)}
                      </label>
                    ),
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasManageRights ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleManage}
              aria-expanded={managed}
            >
              {managed
                ? t('conectink.groups.manageClose')
                : t('conectink.groups.manage')}
            </Button>
            {isOwner ? (
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="size-4" />
                {t('conectink.groups.delete')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
