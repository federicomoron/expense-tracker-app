export interface Expense {
  id: number;
  groupId: number;
  description: string;
  total: number | string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  participants: {
    userId: number;
    amount: number;
  }[];
  category?: string;
  iconUrl?: string;
}

export interface ExpenseRequest {
  groupId: number;
  description: string;
  total: number;
  currency: string;
  createdAt?: string;
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

export interface ExpenseExtended extends Expense {
  paidBy?: ExpenseUser[];
  splits?: ExpenseUser[];
}
