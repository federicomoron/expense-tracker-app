import { Expense } from './expenses.model';

export interface GroupMember {
  userId: number;
  name: string;
}

export interface GroupMemberBalance extends GroupMember {
  currency: string;
  amount: number;
}

export interface GroupDetail {
  id: number;
  name: string;
  type: string;
  members: GroupMember[];
  balanceSummary: {
    currency: string;
    amount: number;
  }[];
  memberBalances: GroupMemberBalance[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetailWithExpenses extends GroupDetail {
  expenses?: Expense[];
}
