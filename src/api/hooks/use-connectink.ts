import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '../client'
import {
  acceptConnectRequest,
  ignoreConnectRequest,
  listConnections,
  listRequests,
  rejectConnectRequest,
  removeConnection,
  searchUsers,
  sendConnectRequest,
} from '../resources/connectink'

export function connectinkSearchKey(q: string) {
  return ['connectink', 'users', q] as const
}

export function connectinkRequestsKey() {
  return ['connectink', 'requests'] as const
}

export function connectinkConnectionsKey() {
  return ['connectink', 'connections'] as const
}

/**
 * Nutzer-Suche. Die Query ist nur aktiv, wenn ein Suchbegriff vorliegt –
 * die leere Suche wird nie an die API geschickt.
 */
export function useConnectinkSearch(q: string) {
  const trimmed = q.trim()

  return useQuery({
    queryKey: connectinkSearchKey(trimmed),
    queryFn: () => searchUsers(getApiClient(), trimmed),
    enabled: trimmed.length > 0,
  })
}

export function useConnectinkRequests() {
  return useQuery({
    queryKey: connectinkRequestsKey(),
    queryFn: () => listRequests(getApiClient()),
  })
}

export function useConnectinkConnections() {
  return useQuery({
    queryKey: connectinkConnectionsKey(),
    queryFn: () => listConnections(getApiClient()),
  })
}

/**
 * Invalidiert nach jeder Mutation die Anfragen, Verbindungen und die Suche –
 * so bleiben alle Conectink-Bereiche synchron.
 */
function useInvalidateConnectink() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: connectinkRequestsKey() })
    queryClient.invalidateQueries({ queryKey: connectinkConnectionsKey() })
    queryClient.invalidateQueries({ queryKey: ['connectink', 'users'] })
  }
}

export function useSendConnectRequest() {
  const invalidate = useInvalidateConnectink()

  return useMutation({
    mutationFn: (toUserId: string) =>
      sendConnectRequest(getApiClient(), toUserId),
    onSuccess: invalidate,
  })
}

export function useAcceptConnectRequest() {
  const invalidate = useInvalidateConnectink()

  return useMutation({
    mutationFn: (id: string) => acceptConnectRequest(getApiClient(), id),
    onSuccess: invalidate,
  })
}

export function useRejectConnectRequest() {
  const invalidate = useInvalidateConnectink()

  return useMutation({
    mutationFn: (id: string) => rejectConnectRequest(getApiClient(), id),
    onSuccess: invalidate,
  })
}

export function useIgnoreConnectRequest() {
  const invalidate = useInvalidateConnectink()

  return useMutation({
    mutationFn: (id: string) => ignoreConnectRequest(getApiClient(), id),
    onSuccess: invalidate,
  })
}

export function useRemoveConnection() {
  const invalidate = useInvalidateConnectink()

  return useMutation({
    mutationFn: (id: string) => removeConnection(getApiClient(), id),
    onSuccess: invalidate,
  })
}
