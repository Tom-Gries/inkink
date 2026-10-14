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

type ConnectinkApiClientShape = {
  connectink: {
    users: { $get: (options: { query: { q: string } }) => Promise<Response> }
    requests: ConnectinkRequestsClient
    connections: ConnectinkConnectionsClient
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
