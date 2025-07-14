export interface ExpenseCategory {
  key: string;
  label: string;
  icon: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { key: 'Food', label: 'Food', icon: '/assets/food.svg' },
  { key: 'Groceries', label: 'Groceries', icon: '/assets/groceries.svg' },
  { key: 'Rent', label: 'Rent', icon: '/assets/home.svg' },
  { key: 'Utilities', label: 'Utilities', icon: '/assets/water.svg' },
  { key: 'Transport', label: 'Transport', icon: '/assets/transport.svg' },
  { key: 'Health', label: 'Health', icon: '/assets/salud.svg' },
  { key: 'Clothing', label: 'Clothing', icon: '/assets/ropa.svg' },
  { key: 'Entertainment', label: 'Entertainment', icon: '/assets/entertainment.svg' },
  { key: 'Subscriptions', label: 'Subscriptions', icon: '/assets/subscription.svg' },
  { key: 'Other', label: 'Other', icon: '/assets/default.svg' },
];
