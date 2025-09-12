export const enum ROUTES {
  LOGIN = 'login',
  REGISTER = 'register',
  GROUPS = 'groups',
  NEW_GROUP = 'groups/new',
  GROUP_DETAILS = 'groups/:groupId',
  EXPENSE_DETAILS = 'groups/:groupId/expenses/:expenseId',
  CREATE_EXPENSE = 'groups/:groupId/create-expense',
  NEW_EXPENSE = 'expenses/new',
  SETTINGS = 'settings',
}

export enum NAVIGATION_ROUTES {
  LOGIN = `/${ROUTES.LOGIN}`,
  REGISTER = `/${ROUTES.REGISTER}`,
  GROUPS = `/${ROUTES.GROUPS}`,
  NEW_GROUP = `/${ROUTES.NEW_GROUP}`,
  GROUP_DETAILS = `/${ROUTES.GROUP_DETAILS}`,
  EXPENSE_DETAILS = `/${ROUTES.EXPENSE_DETAILS}`,
  CREATE_EXPENSE = `/${ROUTES.CREATE_EXPENSE}`,
  NEW_EXPENSE = `/${ROUTES.NEW_EXPENSE}`,
  SETTINGS = `/${ROUTES.SETTINGS}`,
}
