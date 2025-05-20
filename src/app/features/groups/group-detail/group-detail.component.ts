import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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

  groupId = signal(Number(this.route.snapshot.paramMap.get('id')));
  group = signal<GroupDetailWithExpenses | null>(null);

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

  ngOnInit() {
    this.groupService.getGroupDetail(this.groupId()).subscribe({
      next: (data) => this.group.set(data as GroupDetailWithExpenses),
      error: (err) => {
        console.error('Error loading group detail', err);
      },
    });
  }

  goToNewExpense() {
    void this.router.navigate(['/expenses/new', this.groupId()]);
  }
}
