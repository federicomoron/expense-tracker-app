export const API_ENDPOINTS = {
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  CREATE_GROUP: '/groups/create',
  GET_GROUPS: '/groups',
  GET_GROUP_DETAIL: (groupId: number) => `/groups/${groupId}`,
  CREATE_EXPENSE: '/expenses/create',
  UPLOAD_GROUP_IMAGE: '/uploads/groups',
  DELETE_GROUP: (groupId: number) => `/groups/${groupId}`,
  SEND_INVITATION: '/invitations/send',
  GET_INVITATIONS: '/invitations/all',
  ACCEPT_INVITATION: '/invitations/accept',
  REJECT_INVITATION: '/invitations/reject',
};
