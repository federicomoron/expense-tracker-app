import { Expense, ExpenseExtended, ExpenseUser } from '@app/core/models/expenses.model';
import { GroupMember } from '@app/core/models/group-detail.model';
import { PaidByOptionId } from '@app/core/models/paid-by-option.model';

type AnyExpense = Expense | ExpenseExtended;

/** Sum all values in a Map<number, number> */
function sumMap(map: Map<number, number>) {
  let sum = 0;
  for (const value of map.values()) sum += value;
  return sum;
}

/**
 * Detects the quick option (optionId) based on participants only.
 * Returns the option relative to the current user (currentUserId).
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
 * Resolves the name of the payer from an expense and group members.
 * Falls back to 'You' if not found.
 */
export function resolvePayerNameFromExpense(
  expense: Expense | ExpenseExtended,
  members: GroupMember[] | undefined,
  _currentUserId?: number | null,
): string {
  const paidBy = (expense as any).paidBy;
  if (Array.isArray(paidBy) && paidBy.length > 0) {
    const member = members?.find((m) => m.userId === paidBy[0].userId);
    return member?.name ?? 'You';
  }

  const parts = (expense as any).participants;
  if (Array.isArray(parts) && parts.length > 0) {
    const pos = parts.find((p: any) => p.amount > 0);
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
