export interface Expense {
  id: number;
  groupId: number;
  description: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface ExpenseRequest {
  groupId: number;
  description: string;
  total: number;
  currency: string;
  paidBy: ExpenseUser[];
  splits: ExpenseUser[];
}

export interface ExpenseUser {
  userId: number;
  amount: number;
}

export interface ExpenseResponse {
  success: boolean;
  data: Expense;
}
