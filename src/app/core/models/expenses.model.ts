import { PaidByOptionId } from '@models/paid-by-option.model';

export interface Expense {
  readonly id: number;
  readonly groupId: number;
  readonly description: string;
  readonly total: number | string;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly participants: ReadonlyArray<{
    readonly userId: number;
    readonly amount: number;
  }>;
  readonly category?: string;
  readonly iconUrl?: string;
  readonly isPending?: boolean;
}

export interface ExpenseUser {
  readonly userId: number;
  readonly amount: number;
}

export interface ExpenseRequest {
  groupId: number;
  description: string;
  total: number;
  currency: string;
  createdAt?: string;
  paidBy: ExpenseUser[];
  splits: ExpenseUser[];
  optionId?: PaidByOptionId;
  clientRequestId: string;
}

export interface ExpenseResponse {
  readonly success: boolean;
  readonly data: Expense;
}

export interface ExpenseExtended extends Expense {
  readonly paidBy?: ExpenseUser[];
  readonly splits?: ExpenseUser[];
  readonly optionId?: PaidByOptionId;
  readonly payerName?: string;
}

export interface PendingExpense {
  readonly localId: string;
  readonly groupId: number;
  readonly request: ExpenseRequest;
  readonly createdAt: string;
}

export interface ExpenseCategory {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly keywords?: readonly string[];
}
