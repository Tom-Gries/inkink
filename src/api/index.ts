export { type AuthClient, authClient, isAuthenticated } from './auth'
export {
  type ApiClient,
  createApiClient,
  getApiBaseUrl,
  getApiClient,
} from './client'
export { ApiError, assertOk } from './errors'
export {
  useAcceptConnectRequest,
  useAcceptGroupInvitation,
  useAddGroupMember,
  useConnectinkConnections,
  useConnectinkGroupInvitations,
  useConnectinkGroups,
  useConnectinkRequests,
  useConnectinkSearch,
  useCreateGroup,
  useDeleteGroup,
  useIgnoreConnectRequest,
  useIgnoreGroupInvitation,
  useRejectConnectRequest,
  useRejectGroupInvitation,
  useRemoveConnection,
  useRemoveGroupAdmin,
  useRemoveGroupMember,
  useSendConnectRequest,
  useSetGroupAdmin,
  useUpdateGroup,
} from './hooks/use-connectink'
export {
  useCreateFeeling,
  useDeleteFeeling,
  useFeelings,
} from './hooks/use-feelings'
export { useMe } from './hooks/use-me'
export {
  useAddLeaderboardEntry,
  useArchiveStack,
  useCreateStack,
  useStack,
  useStacks,
  useUpdateStack,
} from './hooks/use-stacks'
export {
  useCreateTestMessage,
  useTestMessages,
} from './hooks/use-test-messages'
export {
  acceptConnectRequest,
  acceptGroupInvitation,
  addGroupMember,
  type ConnectedUserDto,
  type ConnectionRelation,
  type ConnectRequestDto,
  type ConnectRequestsResponse,
  type CounterpartUserDto,
  createGroup,
  deleteGroup,
  type GroupDto,
  type GroupInvitationDto,
  type GroupInvitationStatus,
  type GroupManagement,
  type GroupMemberDto,
  type GroupRole,
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
  type UserSearchDto,
  updateGroup,
} from './resources/connectink'
export {
  createFeeling,
  deleteFeeling,
  type FeelingDto,
  type FeelingInputDto,
  type FeelingMood,
  listFeelings,
} from './resources/feelings'
export { getMe, type MeResponse } from './resources/me'
export {
  getProfile,
  type ProfileDto,
  type ProfileResponse,
  updateProfileUsername,
} from './resources/profile'
export {
  type AnswerOptionDto,
  type Appearance,
  addLeaderboardEntry,
  archiveStack,
  createStack,
  getStack,
  type LeaderboardEntryDto,
  listStacks,
  type QuestionDto,
  type QuestionType,
  type Scoring,
  type StackDto,
  type StackInputDto,
  updateStack,
} from './resources/stacks'
export {
  createTestMessage,
  deleteTestMessage,
  getTestMessage,
  listTestMessages,
  type TestMessageDto,
} from './resources/test'
