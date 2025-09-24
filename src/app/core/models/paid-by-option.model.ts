export type PaidByOptionId =
  | 'you_paid_equal'
  | 'you_are_owed'
  | 'other_paid_equal'
  | 'other_is_owed'
  | 'default';

export interface PaidByOption {
  readonly id: PaidByOptionId;
  readonly label: string;
}
