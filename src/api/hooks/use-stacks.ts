import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '../client'
import { listGroupStacks } from '../resources/connectink'
import type { LeaderboardEntryDto, StackInputDto } from '../resources/stacks'
import {
  addLeaderboardEntry,
  archiveStack,
  createStack,
  getStack,
  listStacks,
  updateStack,
} from '../resources/stacks'

export function stacksListKey(mine = false) {
  return ['stacks', mine ? 'mine' : 'all'] as const
}

export function stackKey(id: string) {
  return ['stacks', id] as const
}

export function groupStacksKey(groupId: string) {
  return ['connectink', 'groups', groupId, 'stacks'] as const
}

export function useStacks(options?: { mine?: boolean }) {
  const mine = options?.mine ?? false

  return useQuery({
    queryKey: stacksListKey(mine),
    queryFn: () => listStacks(getApiClient(), { mine }),
  })
}

export function useGroupStacks(groupId: string | undefined) {
  return useQuery({
    queryKey: groupStacksKey(groupId ?? ''),
    queryFn: () => listGroupStacks(getApiClient(), groupId ?? ''),
    enabled: groupId !== undefined,
  })
}

export function useStack(id: string | undefined) {
  return useQuery({
    queryKey: stackKey(id ?? ''),
    queryFn: () => getStack(getApiClient(), id ?? ''),
    enabled: id !== undefined,
  })
}

export function useCreateStack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StackInputDto) => createStack(getApiClient(), input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] })
      // Gruppen-Stacks aktualisieren (Stack kann Gruppen zugeordnet sein).
      queryClient.invalidateQueries({ queryKey: ['connectink', 'groups'] })
    },
  })
}

export function useUpdateStack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: string; input: StackInputDto }) =>
      updateStack(getApiClient(), args.id, args.input),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] })
      queryClient.invalidateQueries({ queryKey: stackKey(id) })
      // Gruppen-Stacks aktualisieren (Zuordnung kann sich geändert haben).
      queryClient.invalidateQueries({ queryKey: ['connectink', 'groups'] })
    },
  })
}

export function useArchiveStack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveStack(getApiClient(), id),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] })
      queryClient.invalidateQueries({ queryKey: stackKey(id) })
    },
  })
}

export function useAddLeaderboardEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: string; entry: LeaderboardEntryDto }) =>
      addLeaderboardEntry(getApiClient(), args.id, args.entry),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['stacks'] })
      queryClient.invalidateQueries({ queryKey: stackKey(id) })
    },
  })
}
