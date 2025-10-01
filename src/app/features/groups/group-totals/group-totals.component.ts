import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { GroupService } from '@services/group.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-group-totals',
  standalone: true,
  imports: [CommonModule, SharedMaterialModule, TranslateModule, HeaderComponent],
  templateUrl: './group-totals.component.html',
  styleUrls: ['./group-totals.component.scss'],
})
export class GroupTotalsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(GroupService);
  private auth = inject(AuthService);

  readonly groupId = signal<number>(0);
  readonly group = signal<GroupDetailWithExpenses | null>(null);
  readonly loading = signal(true);

  readonly totalAmount = computed(() => {
    const expenses = this.group()?.expenses ?? [];
    return expenses.reduce((sum, e) => sum + Number(e.total), 0);
  });

  readonly hasExpenses = computed(() => {
    return (this.group()?.expenses?.length ?? 0) > 0;
  });

  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly yourPart = computed(() => {
    const userId = this.currentUserId();
    if (!userId) return 0;
    const expenses = this.group()?.expenses ?? [];
    return expenses.reduce((sum, e) => {
      const p = e.participants?.find((x) => x.userId === userId);
      return sum + (p ? Number(p.amount) : 0);
    }, 0);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.groupId.set(id);
    this.groupService.getGroupDetail(id).subscribe({
      next: (data) => {
        this.group.set(data as GroupDetailWithExpenses);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goBack() {
    void this.router.navigate(['/groups', this.groupId()]);
  }
}
