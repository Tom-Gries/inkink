import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '../client'
import type { GroupManagement } from '../resources/connectink'
import {
  acceptConnectRequest,
  acceptGroupInvitation,
  addGroupMember,
  createGroup,
  deleteGroup,
  ignoreConnectRequest,
  ignoreGroupInvitation,
  listConnections,
  listGroupInvitations,
  listGroups,
  listRequests,
  rejectConnectRequest,
  rejectGroupInvitation,
  removeConnection,
  removeGroupAdmin,
  removeGroupMember,
  searchUsers,
  sendConnectRequest,
  setGroupAdmin,
  updateGroup,
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
export function connectinkGroupsKey() {
  return ['connectink', 'groups'] as const
}

export function connectinkGroupInvitationsKey() {
  return ['connectink', 'groups', 'invitations'] as const
}

export function useConnectinkGroups() {
  return useQuery({
    queryKey: connectinkGroupsKey(),
    queryFn: () => listGroups(getApiClient()),
  })
}

export function useConnectinkGroupInvitations() {
  return useQuery({
    queryKey: connectinkGroupInvitationsKey(),
    queryFn: () => listGroupInvitations(getApiClient()),
  })
}

/** Invalidiert nach Gruppen-Mutationen Gruppen + offene Einladungen. */
function useInvalidateGroups() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: connectinkGroupsKey() })
    queryClient.invalidateQueries({
      queryKey: connectinkGroupInvitationsKey(),
    })
  }
}

export function useCreateGroup() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (name: string) => createGroup(getApiClient(), name),
    onSuccess: invalidate,
  })
}

export function useUpdateGroup() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (args: {
      id: string
      input: { name?: string; management?: GroupManagement }
    }) => updateGroup(getApiClient(), args.id, args.input),
    onSuccess: invalidate,
  })
}

export function useDeleteGroup() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (id: string) => deleteGroup(getApiClient(), id),
    onSuccess: invalidate,
  })
}

export function useAddGroupMember() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (args: { groupId: string; userId: string }) =>
      addGroupMember(getApiClient(), args.groupId, args.userId),
    onSuccess: invalidate,
  })
}

export function useRemoveGroupMember() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (args: { groupId: string; userId: string }) =>
      removeGroupMember(getApiClient(), args.groupId, args.userId),
    onSuccess: invalidate,
  })
}

export function useSetGroupAdmin() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (args: { groupId: string; userId: string }) =>
      setGroupAdmin(getApiClient(), args.groupId, args.userId),
    onSuccess: invalidate,
  })
}

export function useRemoveGroupAdmin() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (args: { groupId: string; userId: string }) =>
      removeGroupAdmin(getApiClient(), args.groupId, args.userId),
    onSuccess: invalidate,
  })
}

export function useAcceptGroupInvitation() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (groupId: string) =>
      acceptGroupInvitation(getApiClient(), groupId),
    onSuccess: invalidate,
  })
}

export function useRejectGroupInvitation() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (groupId: string) =>
      rejectGroupInvitation(getApiClient(), groupId),
    onSuccess: invalidate,
  })
}

export function useIgnoreGroupInvitation() {
  const invalidate = useInvalidateGroups()

  return useMutation({
    mutationFn: (groupId: string) =>
      ignoreGroupInvitation(getApiClient(), groupId),
    onSuccess: invalidate,
  })
}
