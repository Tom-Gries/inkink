import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '../client'
import type { FeelingInputDto } from '../resources/feelings'
import {
  createFeeling,
  deleteFeeling,
  listFeelings,
} from '../resources/feelings'

export function feelingsKey() {
  return ['feelings'] as const
}

export function useFeelings() {
  return useQuery({
    queryKey: feelingsKey(),
    queryFn: () => listFeelings(getApiClient()),
  })
}

export function useCreateFeeling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: FeelingInputDto) =>
      createFeeling(getApiClient(), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feelingsKey() }),
  })
}

export function useDeleteFeeling() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFeeling(getApiClient(), id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feelingsKey() }),
  })
}
