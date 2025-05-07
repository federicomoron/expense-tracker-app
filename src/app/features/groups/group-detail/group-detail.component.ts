import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupDetailWithExpenses } from '@app/core/models/group-detail.model';

import { GroupService } from '@app/core/services/group.service';
import { ExpensesComponent } from '@app/features/expenses/expenses/expenses.component';
import { SharedUiModule } from '@app/shared/shared-ui.module';

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

  groupId = signal(Number(this.route.snapshot.paramMap.get('id')));
  group = signal<GroupDetailWithExpenses | null>(null);

  ngOnInit() {
    this.groupService.getGroupDetail(this.groupId()).subscribe({
      next: (data) => this.group.set(data as GroupDetailWithExpenses),
      error: (err) => {
        console.error('Error loading group detail', err);
      },
    });
  }

  goToNewExpense() {
    this.router.navigate(['/expenses/new', this.groupId()]);
  }
}
