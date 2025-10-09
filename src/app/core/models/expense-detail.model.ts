import { ExpenseExtended, ExpenseUser } from '@models/expenses.model';

export interface EnrichedExpenseUser extends ExpenseUser {
  name: string;
}

export interface ExpenseForDetail extends ExpenseExtended {
  participants: EnrichedExpenseUser[];
}
