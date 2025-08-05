import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GroupType } from '@app/core/models/group-type.enum';
import { LayoutService } from '@app/core/services/layout.service';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { getGroupImage } from '@app/shared/helpers/group-type-image-map';
import { CurrencySymbolPipe } from '@app/shared/pipes/currency-symbol.pipe';
import { ExpensesComponent } from '@features/expenses/expenses/expenses.component';
import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    ExpensesComponent,
    CommonModule,
    SharedUiModule,
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

  readonly GroupType = GroupType;

  getGroupImage = getGroupImage;

  groupId = signal(Number(this.route.snapshot.paramMap.get('id')));
  group = signal<GroupDetailWithExpenses | null>(null);
  loading = signal(true);
  currentUser = this.authService.currentUser;

  filteredMemberBalances = computed(() => {
    const group = this.group();
    const userId = this.currentUser()?.id;
    if (!group || !userId) return [];

    return group.memberBalances.filter((mb) => mb.userId === userId);
  });

  filteredSummary = computed(() => {
    const group = this.group();
    const userId = this.currentUser()?.id;
    if (!group || !userId) return [];

    return group.balanceSummary.filter((b) => b.amount !== 0);
  });

  expenses = computed(() => this.group()?.expenses ?? []);

  ngOnInit() {
    this.layout.disableTopPadding();
    this.groupService.getGroupDetail(this.groupId()).subscribe({
      next: (data) => {
        this.group.set(data as GroupDetailWithExpenses);
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
    this.groupService.getGroupDetail(this.groupId()).subscribe({
      next: (data) => {
        this.group.set(data);
      },
      error: (err) => {
        console.error('Error reloading group after expense delete', err);
        this.snackbar.show('Error al actualizar el grupo');
      },
    });
  }
}
