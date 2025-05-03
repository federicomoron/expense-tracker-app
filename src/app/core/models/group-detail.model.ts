import { Expense } from './expenses.model';

export interface GroupDetail {
  id: number;
  name: string;
  type: string;
  members: {
    userId: number;
    name: string;
  }[];
  balanceSummary: {
    currency: string;
    amount: number;
  }[];
  memberBalances: {
    userId: number;
    name: string;
    currency: string;
    amount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

//se agrega el detalle del grupo con los gastos, hasta que este el endpoint terminado
export interface GroupDetailWithExpenses extends GroupDetail {
  expenses?: Expense[];
}

