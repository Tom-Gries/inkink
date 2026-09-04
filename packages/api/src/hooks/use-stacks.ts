import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '../client'
import type { LeaderboardEntryDto, StackInputDto } from '../resources/stacks'
import {
  addLeaderboardEntry,
  archiveStack,
  createStack,
  getStack,
  listStacks,
  updateStack,
} from '../resources/stacks'

export function stacksListKey() {
  return ['stacks'] as const
}

export function stackKey(id: string) {
  return ['stacks', id] as const
}

export function useStacks() {
  return useQuery({
    queryKey: stacksListKey(),
    queryFn: () => listStacks(getApiClient()),
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: stacksListKey() }),
  })
}

export function useUpdateStack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: string; input: StackInputDto }) =>
      updateStack(getApiClient(), args.id, args.input),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: stacksListKey() })
      queryClient.invalidateQueries({ queryKey: stackKey(id) })
    },
  })
}

export function useArchiveStack() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveStack(getApiClient(), id),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: stacksListKey() })
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
      queryClient.invalidateQueries({ queryKey: stacksListKey() })
      queryClient.invalidateQueries({ queryKey: stackKey(id) })
    },
  })
}
