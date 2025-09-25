import { TranslateService } from '@ngx-translate/core';

import { Expense, ExpenseExtended, ExpenseUser } from '@models/expenses.model';
import { GroupMember } from '@models/group-detail.model';
import { PaidByOption, PaidByOptionId } from '@models/paid-by-option.model';

type AnyExpense = Expense | ExpenseExtended;

/**
 * Sums all values in a Map<number, number>
 */
export function sumMap(map: Map<number, number>): number {
  let sum = 0;
  for (const value of map.values()) sum += value;
  return sum;
}

/**
 * Splits the total amount equally among all users, rounding the last user's amount
 * so that the sum exactly matches the total.
 */
export function buildSplits(userIds: number[], total: number): ExpenseUser[] {
  const baseAmount = Math.floor((total / userIds.length) * 100) / 100;
  let accumulated = 0;

  return userIds.map((userId, index) => {
    const amount =
      index === userIds.length - 1 ? Math.round((total - accumulated) * 100) / 100 : baseAmount;
    accumulated += amount;
    return { userId, amount };
  });
}

/**
 * Detects the quick paid option (optionId) based on participants and currentUserId.
 */
export function detectQuickOptionFromParticipants(
  expense: AnyExpense,
  currentUserId?: number,
): PaidByOptionId | undefined {
  if (!expense?.participants?.length || !currentUserId) return undefined;

  const total = Number(expense.total);
  const pos = new Map<number, number>();
  const neg = new Map<number, number>();

  for (const p of expense.participants as ExpenseUser[]) {
    const amt = Number(p.amount) || 0;
    if (amt > 0) pos.set(p.userId, (pos.get(p.userId) || 0) + amt);
    else if (amt < 0) neg.set(p.userId, (neg.get(p.userId) || 0) + Math.abs(amt));
  }

  const totalNeg = Math.round(sumMap(neg) * 100) / 100;
  const eq = (a: number, b: number, tol = 0.01) => Math.abs(a - b) <= tol;
  const singlePayerId = pos.size === 1 ? Array.from(pos.keys())[0] : undefined;

  if (singlePayerId && eq(totalNeg, total)) {
    if (neg.size === 1) {
      const debtorId = Array.from(neg.keys())[0];
      if (eq(neg.get(debtorId) || 0, total)) {
        if (debtorId === currentUserId) return 'other_is_owed';
        if (singlePayerId === currentUserId) return 'you_are_owed';
        return 'other_is_owed';
      }
    }

    const half = Math.round((total / 2) * 100) / 100;
    const myDebt = neg.get(currentUserId) || 0;
    const othersDebt = Math.round((totalNeg - myDebt) * 100) / 100;

    if (eq(myDebt, half) && eq(othersDebt, half)) {
      return singlePayerId === currentUserId ? 'you_paid_equal' : 'other_paid_equal';
    }
  }

  if (singlePayerId) {
    return singlePayerId === currentUserId ? 'you_paid_equal' : 'other_paid_equal';
  }

  return undefined;
}

/**
 * Resolves the payer's name from an expense and group members.
 * Falls back to 'You' if not found.
 *
 * @param _currentUserId Currently unused, kept for compatibility.
 */
export function resolvePayerNameFromExpense(
  expense: AnyExpense,
  members: GroupMember[] | undefined,
  _currentUserId?: number | null,
): string {
  const paidBy = (expense as any).paidBy;
  if (Array.isArray(paidBy) && paidBy.length > 0) {
    const member = members?.find((m) => m.userId === paidBy[0].userId);
    return member?.name ?? 'You';
  }

  const participants = (expense as any).participants;
  if (Array.isArray(participants) && participants.length > 0) {
    const pos = participants.find((p: ExpenseUser) => p.amount > 0);
    const member = pos ? members?.find((m) => m.userId === pos.userId) : undefined;
    return member?.name ?? 'You';
  }

  return 'You';
}

/**
 * Traverses the ActivatedRoute tree to find the first valid groupId.
 */
export function findGroupIdInRoute(route: import('@angular/router').ActivatedRoute): number {
  let current: import('@angular/router').ActivatedRoute | null = route;
  while (current) {
    const idParam = current.snapshot.paramMap.get('groupId') ?? current.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!isNaN(id) && id > 0) return id;
    current = current.parent;
  }
  return 0;
}

/**
 * Map a PaidByOptionId to a dynamic label string based on group members.
 */
export function getPaidByLabelFromId(
  optionId: PaidByOptionId,
  members: GroupMember[],
  currentUserId: number | undefined,
  translate: TranslateService,
  payerName?: string,
): string {
  const otherMember = members.find((m) => m.userId !== currentUserId);

  switch (optionId) {
    case 'you_paid_equal':
      return translate.instant('paidByQuickDialog.youPaidEqual');
    case 'you_are_owed':
      return translate.instant('paidByQuickDialog.youAreOwed');
    case 'other_paid_equal':
      return translate.instant('paidByQuickDialog.otherPaidEqual', {
        name: payerName ?? otherMember?.name ?? '',
      });
    case 'other_is_owed':
      return translate.instant('paidByQuickDialog.otherIsOwed', {
        name: payerName ?? otherMember?.name ?? '',
      });
    default:
      return translate.instant('expenseForm.defaultLabel');
  }
}

/**
 * Returns a default PaidBy label based on selected option, selected payer, group members, and current user.
 */
export function getDefaultPaidByLabel(
  members: GroupMember[],
  selectedOption: PaidByOption | null,
  selectedPayer: { userId: number; name: string } | null,
  currentUserId: number | undefined,
  translate: TranslateService,
): string {
  // Group of 1 person
  if (members.length === 1) return translate.instant('splitSelector.you');

  // Group of 2 people
  if (members.length === 2)
    return selectedOption?.label ?? translate.instant('expenseForm.defaultLabel');

  // 3 or more members
  if (selectedPayer) {
    return selectedPayer.userId === currentUserId
      ? translate.instant('splitSelector.you')
      : selectedPayer.name;
  }

  return '';
}

/**
 * Returns the array of payers for an expense
 */
export function getPaidBy(exp: Expense | ExpenseExtended): ExpenseUser[] {
  return (
    (exp as ExpenseExtended).paidBy || exp.participants?.filter((p) => Number(p.amount) > 0) || []
  );
}
