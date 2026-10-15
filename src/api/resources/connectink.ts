import type { ApiClient } from '../client'
import { assertOk } from '../errors'

/**
 * Relation des anfragenden Nutzers zu einem gefundenen Nutzer.
 * Muss dem API-Schema entsprechen (api/src/schemas/connectink.ts).
 */
export type ConnectionRelation =
  | 'none'
  | 'outgoingPending'
  | 'incomingPending'
  | 'accepted'
  | 'rejected'
  | 'ignored'

/** Nutzer-Treffer inkl. Relation, wie die API ihn für die Suche liefert. */
export interface UserSearchDto {
  id: string
  name: string
  image: string | null
  relation: ConnectionRelation
}

/** Kompakter Gegenüber-Nutzer für Anfragen/Verbindungen. */
export interface CounterpartUserDto {
  id: string
  name: string
  image: string | null
}

/** Connect-Anfrage (eingehend oder ausgehend). */
export interface ConnectRequestDto {
  id: string
  user: CounterpartUserDto
  createdAt: string
  /** 'incoming' = an mich gerichtet, 'outgoing' = von mir gesendet. */
  direction: 'incoming' | 'outgoing'
}

export interface ConnectRequestsResponse {
  incoming: ConnectRequestDto[]
  outgoing: ConnectRequestDto[]
}

/** Verbundener Nutzer in der Verbunden-Liste. */
export interface ConnectedUserDto {
  id: string
  user: CounterpartUserDto
  since: string
}

/**
 * Verwaltungs-Richtlinie einer Gruppe (vom Owner änderbar).
 * Muss dem API-Schema entsprechen (api/src/schemas/connectink.ts).
 */
export type GroupManagement = 'owner' | 'members_add' | 'members_full'

/** Rolle eines Mitglieds in einer Gruppe. */
export type GroupRole = 'owner' | 'admin' | 'member'

/** Status einer Gruppen-Einladung (wie bei Connect-Anfragen). */
export type GroupInvitationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'ignored'

/** Mitglied einer Gruppe (mit aufgelöstem Nutzer). */
export interface GroupMemberDto {
  userId: string
  name: string
  image: string | null
  role: GroupRole
  addedAt: string
}

/** Gruppe inkl. meiner Rolle, Richtlinie, Mitgliedern und offenen Einladungen. */
export interface GroupDto {
  id: string
  name: string
  ownerId: string
  management: GroupManagement
  /** Rolle des anfragenden Nutzers in dieser Gruppe. */
  myRole: GroupRole
  createdAt: string
  /** Aktive Mitglieder (acceptierte Einladungen + Owner). */
  members: GroupMemberDto[]
  /** Offene Einladungen (warten auf Antwort). */
  invitations: GroupMemberDto[]
}

/** Offene Gruppen-Einladung (an mich), mit Gruppe und Einladendem. */
export interface GroupInvitationDto {
  id: string
  group: { id: string; name: string }
  invitedBy: CounterpartUserDto
  status: GroupInvitationStatus
  createdAt: string
}

/**
 * Explizit typisierte Subrouten (wie beim Feelings-/Stacks-Resource). Die
 * über wasserdichte Hono-Routen abgeleitete AppType verliert bei tief
 * verschachtelten Pfaden (z. B. „/requests/:id/accept") gelegentlich den Typ –
 * daher wird der Sub-Client hier schmal und stabil definiert.
 */
type RequestActionClient = {
  $post: (options: { param: { id: string } }) => Promise<Response>
}

type ConnectinkRequestsClient = {
  $get: () => Promise<Response>
  $post: (options: { json: { toUserId: string } }) => Promise<Response>
  ':id': {
    accept: RequestActionClient
    reject: RequestActionClient
    ignore: RequestActionClient
  }
}

type ConnectinkConnectionsClient = {
  $get: () => Promise<Response>
  ':id': { $delete: (options: { param: { id: string } }) => Promise<Response> }
}

type GroupActionClient = {
  $post: (options: {
    param: { id: string }
    json: { userId: string }
  }) => Promise<Response>
  ':userId': {
    $delete: (options: {
      param: { id: string; userId: string }
    }) => Promise<Response>
  }
}

type ConnectinkGroupsClient = {
  $get: () => Promise<Response>
  $post: (options: { json: { name: string } }) => Promise<Response>
  ':id': {
    $patch: (options: {
      param: { id: string }
      json: { name?: string; management?: GroupManagement }
    }) => Promise<Response>
    $delete: (options: { param: { id: string } }) => Promise<Response>
    members: GroupActionClient
    admins: GroupActionClient
  }
  invitations: {
    $get: () => Promise<Response>
    ':id': {
      accept: RequestActionClient
      reject: RequestActionClient
      ignore: RequestActionClient
    }
  }
}

type ConnectinkApiClientShape = {
  connectink: {
    users: { $get: (options: { query: { q: string } }) => Promise<Response> }
    requests: ConnectinkRequestsClient
    connections: ConnectinkConnectionsClient
    groups: ConnectinkGroupsClient
  }
}

function connectinkClient(
  client: ApiClient,
): ConnectinkApiClientShape['connectink'] {
  return (client as unknown as { api: ConnectinkApiClientShape }).api.connectink
}

/** Sucht Nutzer per Name/Username (eigene Person wird ausgeschlossen). */
export async function searchUsers(
  client: ApiClient,
  q: string,
): Promise<UserSearchDto[]> {
  const res = await connectinkClient(client).users.$get({ query: { q } })
  const body = await assertOk<{ users: UserSearchDto[] }>(res)

  return body.users
}

/** Listet offene Anfragen – eingehend und ausgehend. */
export async function listRequests(
  client: ApiClient,
): Promise<ConnectRequestsResponse> {
  const res = await connectinkClient(client).requests.$get()

  return assertOk<ConnectRequestsResponse>(res)
}

/** Stellt eine Connect-Anfrage an einen anderen Nutzer. */
export async function sendConnectRequest(
  client: ApiClient,
  toUserId: string,
): Promise<ConnectRequestDto> {
  const res = await connectinkClient(client).requests.$post({
    json: { toUserId },
  })

  return assertOk<ConnectRequestDto>(res)
}

/** Akzeptiert eine eingehende Anfrage (→ verbunden). */
export async function acceptConnectRequest(
  client: ApiClient,
  id: string,
): Promise<ConnectRequestDto> {
  const res = await connectinkClient(client).requests[':id'].accept.$post({
    param: { id },
  })

  return assertOk<ConnectRequestDto>(res)
}

/** Lehnt eine eingehende Anfrage ab (Absender darf neu anfragen). */
export async function rejectConnectRequest(
  client: ApiClient,
  id: string,
): Promise<ConnectRequestDto> {
  const res = await connectinkClient(client).requests[':id'].reject.$post({
    param: { id },
  })

  return assertOk<ConnectRequestDto>(res)
}

/** Ignoriert eine eingehende Anfrage (Absender kann nicht mehr anfragen). */
export async function ignoreConnectRequest(
  client: ApiClient,
  id: string,
): Promise<ConnectRequestDto> {
  const res = await connectinkClient(client).requests[':id'].ignore.$post({
    param: { id },
  })

  return assertOk<ConnectRequestDto>(res)
}

/** Listet die verbundenen Nutzer. */
export async function listConnections(
  client: ApiClient,
): Promise<ConnectedUserDto[]> {
  const res = await connectinkClient(client).connections.$get()
  const body = await assertOk<{ connections: ConnectedUserDto[] }>(res)

  return body.connections
}

/**
 * Entfernt eine Verbindung. Die API antwortet mit 204 (ohne Body) – deshalb
 * wird hier nur im Fehlerfall ein JSON-Body geparst.
 */
export async function removeConnection(
  client: ApiClient,
  id: string,
): Promise<void> {
  const res = await connectinkClient(client).connections[':id'].$delete({
    param: { id },
  })

  if (!res.ok) {
    await assertOk<void>(res)
  }
}
/** Listet meine Gruppen (Owner/Admin/Mitglied) inkl. Mitgliedern. */
export async function listGroups(client: ApiClient): Promise<GroupDto[]> {
  const res = await connectinkClient(client).groups.$get()
  const body = await assertOk<{ groups: GroupDto[] }>(res)

  return body.groups
}

/** Erstellt eine Gruppe (der Ersteller wird Owner-Mitglied). */
export async function createGroup(
  client: ApiClient,
  name: string,
): Promise<GroupDto> {
  const res = await connectinkClient(client).groups.$post({ json: { name } })

  return assertOk<GroupDto>(res)
}

/** Aktualisiert Name und/oder Richtlinie einer Gruppe. */
export async function updateGroup(
  client: ApiClient,
  id: string,
  input: { name?: string; management?: GroupManagement },
): Promise<GroupDto> {
  const res = await connectinkClient(client).groups[':id'].$patch({
    param: { id },
    json: input,
  })

  return assertOk<GroupDto>(res)
}

/** Löscht eine Gruppe (nur Owner). */
export async function deleteGroup(
  client: ApiClient,
  id: string,
): Promise<void> {
  const res = await connectinkClient(client).groups[':id'].$delete({
    param: { id },
  })

  if (!res.ok) {
    await assertOk<void>(res)
  }
}

/** Fügt ein verbundenes Mitglied hinzu (nur verbundene Freunde). */
export async function addGroupMember(
  client: ApiClient,
  id: string,
  userId: string,
): Promise<GroupDto> {
  const res = await connectinkClient(client).groups[':id'].members.$post({
    param: { id },
    json: { userId },
  })

  return assertOk<GroupDto>(res)
}

/** Entfernt ein Mitglied aus einer Gruppe. */
export async function removeGroupMember(
  client: ApiClient,
  id: string,
  userId: string,
): Promise<GroupDto> {
  const res = await connectinkClient(client).groups[':id'].members[
    ':userId'
  ].$delete({
    param: { id, userId },
  })

  return assertOk<GroupDto>(res)
}

/** ernennt ein Mitglied zum Admin (nur Owner). */
export async function setGroupAdmin(
  client: ApiClient,
  id: string,
  userId: string,
): Promise<GroupDto> {
  const res = await connectinkClient(client).groups[':id'].admins.$post({
    param: { id },
    json: { userId },
  })

  return assertOk<GroupDto>(res)
}

/** Entzieht den Admin-Status (nur Owner). */
export async function removeGroupAdmin(
  client: ApiClient,
  id: string,
  userId: string,
): Promise<GroupDto> {
  const res = await connectinkClient(client).groups[':id'].admins[
    ':userId'
  ].$delete({
    param: { id, userId },
  })

  return assertOk<GroupDto>(res)
}
/** Listet offene Gruppen-Einladungen, die an mich gerichtet sind. */
export async function listGroupInvitations(
  client: ApiClient,
): Promise<GroupInvitationDto[]> {
  const res = await connectinkClient(client).groups.invitations.$get()
  const body = await assertOk<{ invitations: GroupInvitationDto[] }>(res)

  return body.invitations
}

/** Akzeptiert eine Einladung → ich werde Mitglied der Gruppe. */
export async function acceptGroupInvitation(
  client: ApiClient,
  groupId: string,
): Promise<GroupInvitationDto> {
  const res = await connectinkClient(client).groups.invitations[
    ':id'
  ].accept.$post({
    param: { id: groupId },
  })

  return assertOk<GroupInvitationDto>(res)
}

/** Lehnt eine Einladung ab (Einladende können erneut einladen). */
export async function rejectGroupInvitation(
  client: ApiClient,
  groupId: string,
): Promise<GroupInvitationDto> {
  const res = await connectinkClient(client).groups.invitations[
    ':id'
  ].reject.$post({
    param: { id: groupId },
  })

  return assertOk<GroupInvitationDto>(res)
}

/** Ignoriert eine Einladung (erneutes Einladen ist dann nicht möglich). */
export async function ignoreGroupInvitation(
  client: ApiClient,
  groupId: string,
): Promise<GroupInvitationDto> {
  const res = await connectinkClient(client).groups.invitations[
    ':id'
  ].ignore.$post({
    param: { id: groupId },
  })

  return assertOk<GroupInvitationDto>(res)
}
