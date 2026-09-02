export {
  getApiClient,
  getApiBaseUrl,
  createApiClient,
  type ApiClient,
} from './client'
export { ApiError, assertOk } from './errors'
export {
  authClient,
  authTranslations,
  AuthProvider,
  isAuthenticated,
  LoginGate,
  useAuthStore,
  type AuthClient,
  type AuthStatus,
  type AuthUser,
} from './auth'
export {
  createTestMessage,
  deleteTestMessage,
  getTestMessage,
  listTestMessages,
  type TestMessageDto,
} from './resources/test'
export { getMe, type MeResponse } from './resources/me'
export { useCreateTestMessage, useTestMessages } from './hooks/use-test-messages'
export { useMe } from './hooks/use-me'

