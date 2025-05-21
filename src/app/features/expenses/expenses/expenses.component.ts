import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { Expense } from '@models/expenses.model';
import { GroupService } from '@services/group.service';
import { getCategoryIcon } from '@shared/helpers/get-category-icon';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, SharedUiModule, RouterModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(GroupService);
  getCategoryIcon = getCategoryIcon;

  groupId = Number(this.route.snapshot.paramMap.get('id'));
  expenses = signal<Expense[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.groupService.getGroupDetail(this.groupId).subscribe({
      next: (groupDetail) => {
        this.expenses.set(groupDetail.expenses ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.expenses.set([]);
        this.loading.set(false);
      },
    });
  }
}
