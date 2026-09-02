import { Expense } from '@models/expenses.model';

export interface GroupMember {
  readonly userId: number;
  readonly name: string;
  readonly isGuest: boolean;
}

export interface GroupMemberBalance extends GroupMember {
  readonly currency: string;
  readonly amount: number;
}

export interface GroupDetail {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly members: ReadonlyArray<GroupMember>;
  readonly balanceSummary: ReadonlyArray<{ currency: string; amount: number }>;
  readonly memberBalances: ReadonlyArray<GroupMemberBalance>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GroupDetailWithExpenses extends GroupDetail {
  readonly expenses?: Expense[];
  readonly imageUrl?: string;
}

export interface GroupDetailResponse {
  readonly success: boolean;
  readonly data: GroupDetailWithExpenses;
}
