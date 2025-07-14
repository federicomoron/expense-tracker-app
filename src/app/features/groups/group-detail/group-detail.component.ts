import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SnackbarService } from '@app/core/services/snackbar.service';
import { ExpensesComponent } from '@features/expenses/expenses/expenses.component';
import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [ExpensesComponent, CommonModule, SharedUiModule],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private snackbar = inject(SnackbarService);

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
    this.groupService.getGroupDetail(this.groupId()).subscribe({
      next: (data) => {
        this.group.set(data as GroupDetailWithExpenses);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading group detail', err);
        this.loading.set(false);
        this.snackbar.show('Could not load group details. Try again later.');
      },
    });
  }

  goToNewExpense() {
    void this.router.navigate(['/groups', this.groupId(), 'expenses', 'new']);
  }
}
