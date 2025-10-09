import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { EnrichedExpenseUser, ExpenseForDetail } from '@models/expense-detail.model';
import { Expense, ExpenseExtended, ExpenseUser } from '@models/expenses.model';
import { GroupMember } from '@models/group-detail.model';
import { HeaderAction } from '@models/header-action.model';
import { ApiErrorService } from '@services/api-error.service';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { ExpenseService } from '@services/expenses.service';
import { UiMessageService } from '@services/ui-message.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { EXPENSE_CATEGORIES } from '@shared/data/expense-categories';
import {
  detectQuickOptionFromParticipants,
  findGroupIdInRoute,
  getPaidBy,
  resolvePayerNameFromExpense,
} from '@shared/helpers/expense.utils';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { ConfirmDialogComponent } from '@shared/ui/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [
    CommonModule,
    SharedMaterialModule,
    TranslateModule,
    HeaderComponent,
    SpinnerComponent,
    CurrencySymbolPipe,
  ],
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
})
export class ExpenseDetailComponent {
  readonly expense = signal<ExpenseForDetail | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly uiMessage = inject(UiMessageService);
  private readonly expenseService = inject(ExpenseService);
  private readonly dialogService = inject(DialogService);
  readonly currentUser = this.authService.currentUser;

  readonly currentUserId = this.authService.currentUser()?.id ?? undefined;

  constructor() {
    this._initExpense();
  }

  get participantsWithoutPayers(): EnrichedExpenseUser[] {
    const e = this.expense();
    if (!e?.participants) return [];

    const paid = e.paidBy ?? [];
    return e.participants.filter((p) => !paid.some((pay) => pay.userId === p.userId));
  }

  get participantsBreakdown(): EnrichedExpenseUser[] {
    const e = this.expense();
    if (!e) return [];

    const participants = e.participants ?? [];
    const splits = e.splits ?? [];

    const participantsMap = new Map<number, EnrichedExpenseUser>();
    const participantsAmount = new Map<number, number>();

    for (const p of participants) {
      const existing = participantsMap.get(p.userId);
      if (!existing) {
        participantsMap.set(p.userId, { ...p } as EnrichedExpenseUser);
        participantsAmount.set(p.userId, Number(p.amount) || 0);
      } else {
        participantsAmount.set(
          p.userId,
          (participantsAmount.get(p.userId) || 0) + Number(p.amount || 0),
        );
      }
    }

    const splitsMap = new Map<number, number>(splits.map((s) => [s.userId, Number(s.amount)]));

    const userIds = new Set<number>();
    for (const id of participantsMap.keys()) userIds.add(id);
    for (const id of splitsMap.keys()) userIds.add(id);

    const sharesMap = new Map<number, number>();
    for (const p of participants) {
      const amt = Number(p.amount) || 0;
      if (amt <= 0) {
        sharesMap.set(p.userId, (sharesMap.get(p.userId) || 0) + amt);
      }
    }

    const orderedIds: number[] = [];
    for (const p of participants) if (!orderedIds.includes(p.userId)) orderedIds.push(p.userId);

    const result: EnrichedExpenseUser[] = [];
    for (const uid of Array.from(userIds)) {
      const part = participantsMap.get(uid);
      const name = uid === this.currentUserId ? 'You' : (part?.name ?? `User #${uid}`);

      let amount: number;
      if (splitsMap.has(uid)) {
        amount = splitsMap.get(uid)!;
      } else if (sharesMap.has(uid)) {
        amount = sharesMap.get(uid)!;
      } else {
        amount = participantsAmount.get(uid) ?? 0;
      }

      result.push({ userId: uid, name, amount });
    }

    result.sort((a, b) => {
      const ai = orderedIds.indexOf(a.userId);
      const bi = orderedIds.indexOf(b.userId);
      if (ai === bi) return a.userId - b.userId;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return result;
  }

  get headerActions(): HeaderAction[] {
    return [
      {
        icon: 'edit',
        label: 'Edit',
        color: 'primary',
        onClick: () => this.onEdit(),
      },
      {
        icon: 'delete',
        label: 'Delete',
        color: 'warn',
        onClick: () => this.onDelete(),
      },
    ];
  }

  onEdit(): void {
    const expense = this.expense() as ExpenseExtended | null;
    if (!expense) return;

    const routeGroupId = findGroupIdInRoute(this.route);

    // Prefer the groupId from the expense (in case we navigated from another group), fallback to route
    const groupId = expense.groupId ?? routeGroupId;

    if (!groupId || !expense.id) {
      this.apiErrorService.handleError('expenses.invalidExpense');
      return;
    }

    const participants = expense.participants ?? [];
    const groupSize = participants.length;

    let paidBy: ExpenseUser[] =
      Array.isArray(expense.paidBy) && expense.paidBy.length
        ? expense.paidBy.map((p) => ({ userId: p.userId, amount: Number(p.amount) }))
        : [];

    // if paidBy is empty, try to find participants with amount > 0 (in case paidBy was not saved but participants was)
    if (paidBy.length === 0) {
      const payerParticipants = participants.filter((p) => Number(p.amount) > 0);
      if (payerParticipants.length > 0) {
        // if multiple, take them all (could be a group payment)
        paidBy = payerParticipants.map((p) => ({ userId: p.userId, amount: Number(p.amount) }));
      }
    }

    // Fallback: if no paidBy, try to find a payer in participants, otherwise use currentUser as last resort
    if (paidBy.length === 0) {
      const payer = participants.find((p) => Number(p.amount) > 0);
      if (payer) {
        paidBy = [{ userId: payer.userId, amount: Number(payer.amount) }];
      } else if (this.currentUserId) {
        paidBy = [{ userId: this.currentUserId, amount: Number(expense.total) }];
      }
    }

    let splits: ExpenseUser[] =
      Array.isArray(expense.splits) && expense.splits.length
        ? expense.splits.map((s) => ({ userId: s.userId, amount: Number(s.amount) }))
        : [];

    if (splits.length === 0 && groupSize >= 1) {
      // if splits is empty, use participants amounts as  fallback
      splits = participants.map((p) => ({ userId: p.userId, amount: Number(p.amount) }));

      // if the sum is 0 (no amounts), split equally
      const sum = splits.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(sum) < 0.0001) {
        const totalNum = Number(expense.total);
        const equalSplit = Math.floor((totalNum / groupSize) * 100) / 100;
        splits = participants.map((p, i) => ({
          userId: p.userId,
          amount:
            i === groupSize - 1
              ? Math.round((totalNum - equalSplit * (groupSize - 1)) * 100) / 100
              : equalSplit,
        }));
      }
    }

    const optionId =
      expense.optionId ?? detectQuickOptionFromParticipants(expense, this.currentUserId);

    // Try to infer category if not set
    let category = expense.category;
    if (!category && expense.description) {
      // Try to infer category from description
      const desc = expense.description.toLowerCase();
      const matchedCategory = EXPENSE_CATEGORIES.find(
        (c: any) =>
          c.label.toLowerCase() === desc ||
          c.key.toLowerCase() === desc ||
          (c.keywords && c.keywords.some((k: string) => desc.includes(k))),
      );
      if (matchedCategory) {
        category = matchedCategory.key;
      }
    }

    const expenseForEdit: ExpenseExtended = {
      ...expense,
      groupId,
      optionId,
      paidBy,
      splits,
      category,
    };

    void this.router.navigate(['/groups', groupId, 'expenses', expense.id, 'edit'], {
      state: { expense: expenseForEdit },
    });
  }

  onDelete(): void {
    const expense = this.expense();
    if (!expense) return;

    const confirmDialog = this.dialogService.openFixed(ConfirmDialogComponent, '400px', {
      title: this.translate.instant('confirmDelete.title'),
      message: this.translate.instant('confirmDelete.message'),
      confirmText: this.translate.instant('common.confirm'),
      cancelText: this.translate.instant('common.cancel'),
    });

    confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.expenseService.deleteExpense(expense.id!).subscribe({
        next: () => {
          this.uiMessage.showSuccess(this.translate.instant('expenses.deletedSuccess'));
          void this.router.navigate(['/groups', expense.groupId]);
        },
        error: () => {
          const message = this.apiErrorService.handleError('expenses.deleteError');
          this.uiMessage.showError(message);
        },
      });
    });
  }

  closeDialog(): void {
    const expense = this.expense();
    void this.router.navigate(['/groups', expense?.groupId ?? '']);
  }

  getUserName(userId: number): string {
    const currentGroup = (window as any).currentGroupDetail;
    if (currentGroup?.members) {
      const member = currentGroup.members.find((m: any) => m.userId === userId);
      if (member) return member.name;
    }

    if (this.currentUser()?.id === userId) return this.currentUser()?.name ?? `User #${userId}`;
    return `User #${userId}`;
  }

  private _initExpense(): void {
    const expenseFromState = history.state?.expense as Expense | null;
    const routeGroupId = findGroupIdInRoute(this.route);

    let found: Expense | undefined;

    if (expenseFromState) {
      found = expenseFromState;
    } else {
      const expenseIdParam = this.route.snapshot.paramMap.get('expenseId');
      const expenseId = expenseIdParam ? +expenseIdParam : null;
      if (!expenseId) {
        void this.router.navigate(['/groups', routeGroupId]);
        return;
      }

      const groupDetail = history.state?.group as { expenses?: Expense[] } | undefined;
      if (groupDetail?.expenses) found = groupDetail.expenses.find((e) => e.id === expenseId);
      if (!found && (window as any).currentGroupDetail?.expenses) {
        const currentGroup = (window as any).currentGroupDetail;
        found = currentGroup.expenses?.find((e: Expense) => e.id === expenseId);
      }
    }

    if (!found) {
      void this.router.navigate(['/groups', routeGroupId]);
      return;
    }

    const currentGroup = (window as any).currentGroupDetail;
    const members: GroupMember[] = currentGroup?.members ?? [];
    const enrichedParticipants: EnrichedExpenseUser[] = (found.participants || []).map((p) => {
      if (p.userId === this.currentUserId) return { ...p, name: 'You' };
      const member = members.find((m) => m.userId === p.userId);
      return { ...p, name: member?.name ?? `User #${p.userId}` };
    });

    const payerName = resolvePayerNameFromExpense(found, members, this.currentUserId);

    let category = found.category;
    if (!category && found.description) {
      const desc = found.description.toLowerCase();
      const matchedCategory = EXPENSE_CATEGORIES.find(
        (c: any) =>
          c.label.toLowerCase() === desc ||
          c.key.toLowerCase() === desc ||
          (c.keywords && c.keywords.some((k: string) => desc.includes(k))),
      );
      if (matchedCategory) category = matchedCategory.key;
    }

    this.expense.set({
      ...found,
      groupId: routeGroupId,
      participants: enrichedParticipants,
      paidBy: getPaidBy(found),
      payerName,
      category,
    } as ExpenseForDetail);
  }
}
