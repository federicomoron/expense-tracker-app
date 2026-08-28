import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ExpensesComponent } from '@features/expenses/expenses/expenses.component';
import { GroupActionButtonsComponent } from '@features/groups/group-action-buttons/group-action-buttons.component';
import { GroupActionsModalComponent } from '@features/groups/group-actions-modal/group-actions-modal.component';
import { Expense } from '@models/expenses.model';
import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { GroupType } from '@models/group-type.enum';
import { ApiErrorService } from '@services/api-error.service';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { GroupService } from '@services/group.service';
import { LayoutService } from '@services/layout.service';
import { PendingExpensesService } from '@services/pending-expenses.service';
import { UiMessageService } from '@services/ui-message.service';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { getGroupImage } from '@shared/helpers/group-type-image-map';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    ExpensesComponent,
    CommonModule,
    SharedMaterialModule,
    TranslateModule,
    RouterModule,
    CurrencySymbolPipe,
    GroupActionButtonsComponent,
    SpinnerComponent,
  ],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailComponent implements OnInit {
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly layout = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly pendingExpensesService = inject(PendingExpensesService);
  private readonly uiMessage = inject(UiMessageService);

  readonly groupId = signal(Number(this.route.snapshot.paramMap.get('id')));
  readonly group = signal<GroupDetailWithExpenses | null>(null);
  readonly loading = signal(true);
  readonly offlineMode = signal(false);

  readonly currentUser = this.authService.currentUser;
  readonly GroupType = GroupType;
  readonly getGroupImage = getGroupImage;

  readonly filteredMemberBalances = computed(() => {
    const g = this.group();
    const userId = this.currentUser()?.id;
    if (!g || !userId) return [];
    return g.memberBalances.filter((mb) => mb.userId === userId);
  });

  readonly filteredSummary = computed(() => {
    const g = this.group();
    const userId = this.currentUser()?.id;
    if (!g || !userId) return [];
    return g.balanceSummary.filter((b) => b.amount !== 0);
  });

  private readonly pendingExpenses = this.pendingExpensesService.getPendingForGroup(this.groupId());

  readonly expenses = computed<Expense[]>(() => {
    const pendingAsExpenses: Expense[] = this.pendingExpenses().map((p) => ({
      id: this.hashLocalId(p.localId),
      groupId: p.groupId,
      description: p.request.description,
      total: p.request.total,
      currency: p.request.currency,
      createdAt: p.request.createdAt ?? p.createdAt,
      updatedAt: p.createdAt,
      participants: p.request.splits,
      isPending: true,
    }));

    return [...pendingAsExpenses, ...(this.group()?.expenses ?? [])];
  });

  ngOnInit() {
    this.layout.disableTopPadding();
    this.groupService.getGroupDetail(this.groupId()).subscribe({
      next: (data) => {
        this.group.set(data as GroupDetailWithExpenses);
        (window as any).currentGroupDetail = data;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading group detail', err);
        const message = this.apiErrorService.handleError(err);
        this.uiMessage.showError(message);

        const cached = this.groupService.getCachedGroupDetail(this.groupId());
        if (cached) {
          this.group.set(cached);
          this.offlineMode.set(true);
        }
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy() {
    this.layout.enableTopPadding();
  }

  goToNewExpense() {
    void this.router.navigate(['/groups', this.groupId(), 'expenses', 'new']);
  }

  removeExpenseLocally(expenseId: number) {
    this.group.update((g) => {
      if (!g) return g;
      return {
        ...g,
        expenses: g.expenses?.filter((e) => e.id !== expenseId) ?? [],
      };
    });
  }

  private hashLocalId(localId: string): number {
    let hash = 0;
    for (let i = 0; i < localId.length; i++) {
      hash = (hash * 31 + localId.charCodeAt(i)) | 0;
    }
    return hash;
  }

  openGroupActionsModal() {
    this.dialogService.openFullScreen(GroupActionsModalComponent, {
      groupId: this.groupId(),
      groupName: this.group()?.name,
    });
  }
}
