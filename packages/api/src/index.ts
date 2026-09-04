export {
  type AuthClient,
  authClient,
  isAuthenticated,
} from './auth'
export {
  type ApiClient,
  createApiClient,
  getApiBaseUrl,
  getApiClient,
} from './client'
export { ApiError, assertOk } from './errors'
export { useMe } from './hooks/use-me'
export {
  useCreateTestMessage,
  useTestMessages,
} from './hooks/use-test-messages'
export { getMe, type MeResponse } from './resources/me'
export {
  getProfile,
  type ProfileDto,
  type ProfileResponse,
  updateProfileUsername,
} from './resources/profile'
export {
  createTestMessage,
  deleteTestMessage,
  getTestMessage,
  listTestMessages,
  type TestMessageDto,
} from './resources/test'
