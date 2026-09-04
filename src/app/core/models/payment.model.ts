import { Expense } from '@models/expenses.model';

export interface Payment {
  readonly id: number;
  readonly groupId: number;
  readonly fromUserId: number;
  readonly toUserId: number;
  readonly amount: number;
  readonly currency: string;
  readonly title: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly isPending?: boolean;
}

export interface CreatePaymentPayload {
  groupId: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: string;
  title: string;
  description?: string;
  createdAt?: string;
  clientRequestId: string;
}

export interface UpdatePaymentPayload {
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: string;
  title: string;
  description?: string;
}

export interface PaymentResponse {
  readonly success: boolean;
  readonly data: Payment;
}

export interface PendingPayment {
  readonly localId: string;
  readonly groupId: number;
  readonly request: CreatePaymentPayload;
  readonly createdAt: string;
}

export interface PaymentActivityItem extends Payment {
  readonly type: 'payment';
  readonly participants: ReadonlyArray<{
    readonly userId: number;
    readonly amount: number;
  }>;
}

export type ExpenseActivityItem = Expense & { readonly type: 'expense' };

export type GroupActivityItem = ExpenseActivityItem | PaymentActivityItem;
