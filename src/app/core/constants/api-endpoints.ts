export const API_ENDPOINTS = {
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  CREATE_GROUP: '/groups/create',
  GET_GROUPS: '/groups',
  GET_GROUP_DETAIL: (groupId: number) => `/groups/${groupId}`,
  CREATE_EXPENSE: '/expenses/create',
  // GET_EXPENSES_BY_GROUP: (groupId: number) => `/expenses/group/${groupId}`,
};

