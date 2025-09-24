import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';

import { ExpensesComponent } from '@features/expenses/expenses/expenses.component';
import { GroupActionsModalComponent } from '@features/groups/group-actions-modal/group-actions-modal.component';
import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { GroupType } from '@models/group-type.enum';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { GroupService } from '@services/group.service';
import { LayoutService } from '@services/layout.service';
import { SnackbarService } from '@services/snackbar.service';
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
  ],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackbar = inject(SnackbarService);
  private readonly translate = inject(TranslateService);
  private readonly groupService = inject(GroupService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  readonly groupId = signal(Number(this.route.snapshot.paramMap.get('id')));
  readonly group = signal<GroupDetailWithExpenses | null>(null);
  readonly loading = signal(true);

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

  readonly expenses = computed(() => this.group()?.expenses ?? []);

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
        this.loading.set(false);
        this.snackbar.show(this.translate.instant('groupDetail.errorLoading'));
      },
    });
  }

  ngOnDestroy() {
    this.layout.enableTopPadding();
  }

  goToNewExpense() {
    void this.router.navigate(['/groups', this.groupId(), 'expenses', 'new']);
  }

  removeExpenseLocally() {
    const id = this.groupId();
    this.groupService
      .getGroupDetail(id)
      .pipe(
        catchError(() => {
          this.snackbar.show(this.translate.instant('groupDetail.errorUpdating'));
          return of(null);
        }),
      )
      .subscribe((g) => {
        if (g) this.group.set(g);
      });
  }

  openGroupActionsModal() {
    this.dialogService.openFullScreen(GroupActionsModalComponent, {
      groupId: this.groupId(),
      groupName: this.group()?.name,
    });
  }
}
