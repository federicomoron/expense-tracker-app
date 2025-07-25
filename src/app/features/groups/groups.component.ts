import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { GroupDetailWithExpenses } from '@app/core/models/group-detail.model';
import { AuthService } from '@app/core/services/auth.service';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { environment } from '@environments/environment';
import { GroupFormComponent } from '@features/groups/group-form/group-form.component';
import { GroupType } from '@models/group-type.enum';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [SharedUiModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent implements OnInit {
  readonly showForm = signal(false);
  readonly groups = computed(() => this.groupService.groups());

  private _groupDetails = signal<Record<number, GroupDetailWithExpenses>>({});
  readonly groupDetailsMap = this._groupDetails;

  saved = localStorage.getItem('showSettledGroups');
  readonly showSettledGroups = signal<boolean>(
    localStorage.getItem('showSettledGroups') === 'true',
  );

  readonly hasAnyDetail = computed(() => Object.keys(this._groupDetails()).length > 0);

  private authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;
  readonly currentUserId = this.currentUser()?.id ?? 0;

  private translate = inject(TranslateService);
  private groupService = inject(GroupService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  getGroupDetails = (id: number) =>
    computed(() => {
      const detail = this._groupDetails()[id];
      return detail ?? undefined;
    });

  ngOnInit(): void {
    this.groupService.fetchGroups().subscribe({
      next: () => this.loadGroupDetails(),
      error: (err) => {
        console.error('Error fetching groups', err);
        this.snackbar.show(this.translate.instant('groups.errorFetching'));
      },
    });
  }

  loadGroupDetails() {
    const groups = this.groups();
    if (groups.length === 0) return;
    const requests = groups.map((g) => this.groupService.getGroupDetail(g.id));
    forkJoin(requests).subscribe((details) => {
      const detailsMap: Record<number, GroupDetailWithExpenses> = {};
      details.forEach((detail) => {
        detailsMap[detail.id] = detail;
      });
      this._groupDetails.set(detailsMap);
    });
  }

  addGroup(data: { name: string; type: GroupType }) {
    this.groupService.createGroup(data).subscribe({
      next: (res) => {
        if (res.success) this.showForm.set(false);
      },
      error: (err) => {
        const message = err.error?.error?.message || this.translate.instant('groups.errorCreating');
        if (!environment.production) {
          console.error('Backend message:', message);
        }
        this.snackbar.show(message);
      },
    });
  }

  openGroupForm() {
    const dialogRef = this.dialog.open(GroupFormComponent, {
      width: '90%',
      maxWidth: '400px',
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.addGroup(data);
      }
    });
  }

  goToGroup(id: number) {
    void this.router.navigate(['/groups', id]);
  }

  goToNewGroup() {
    void this.router.navigateByUrl('/groups/new');
  }

  readonly activeGroups = computed(() =>
    this.groups().filter((g) => {
      const detail = this._groupDetails()[g.id];
      if (!detail) return false;
      return detail.balanceSummary.length > 0 || detail.memberBalances.some((m) => m.amount > 0);
    }),
  );

  readonly settledGroups = computed(() =>
    this.groups().filter((g) => {
      const detail = this._groupDetails()[g.id];
      if (!detail) return false;
      return (
        detail.balanceSummary.length === 0 && detail.memberBalances.every((m) => m.amount === 0)
      );
    }),
  );

  toggleShowSettledGroups() {
    this.showSettledGroups.update((prev) => {
      const next = !prev;
      localStorage.setItem('showSettledGroups', String(next));
      return next;
    });
  }
}
