import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupDetailWithExpenses } from '@app/core/models/group-detail.model';

import { GroupService } from '@app/core/services/group.service';
import { ExpenseFormComponent } from '@app/features/expenses/expense-form/expense-form.component';
import { ExpensesComponent } from '@app/features/expenses/expenses/expenses.component';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [ExpenseFormComponent, ExpensesComponent, CommonModule],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.scss'],
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupService);

  groupId = signal(Number(this.route.snapshot.paramMap.get('id')));
  // group = signal<GroupDetail | null>(null);

  //se agrega el detalle del grupo con los gastos, hasta que este el endpoint terminado
  group = signal<GroupDetailWithExpenses | null>(null);

  ngOnInit() {
    this.groupService.getGroupDetail(this.groupId()).subscribe({
      next: (data) => this.group.set(data as GroupDetailWithExpenses),
      error: (err) => {
        console.error('Error loading group detail', err);
      },
    });
  }
  // readonly group = this.groupService
  //   .getGroupDetail(this.groupId())
  //   .pipe(map((detail) => detail as GroupDetailWithExpenses));

  // ngOnInit() {
  //   this.groupService.getGroupDetail(this.groupId()).subscribe({
  //     next: (data) => this.group.set(data),
  //     error: (err) => {
  //       console.error('Error loading group detail', err);
  //     },
  //   });
  // }
}
