import { useQuery } from '@tanstack/react-query'
import { getApiClient } from '../client'
import { getMe } from '../resources/me'

/** Ruft /api/me ab; bei 401 (nicht eingeloggt) kommt ein ApiError. */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(getApiClient()),
    retry: false,
  })
}