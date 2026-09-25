import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient } from '../client'
import { createTestMessage, listTestMessages } from '../resources/test'

const testMessagesKey = ['test-messages'] as const

export function useTestMessages() {
  return useQuery({
    queryKey: testMessagesKey,
    queryFn: () => listTestMessages(getApiClient()),
  })
}

export function useCreateTestMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (message: string) => createTestMessage(getApiClient(), message),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: testMessagesKey }),
  })
}
