import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { GroupFormComponent } from '@features/groups/group-form/group-form.component';
import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { GroupType } from '@models/group-type.enum';
import { ApiErrorService } from '@services/api-error.service';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { GroupService } from '@services/group.service';
import { getGroupImage } from '@shared/helpers/group-type-image-map';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [SharedMaterialModule, RouterModule, CommonModule, TranslateModule, CurrencySymbolPipe],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);

  readonly showForm = signal(false);
  readonly showSettledGroups = signal(localStorage.getItem('showSettledGroups') === 'true');
  private readonly _groupDetails = signal<Record<number, GroupDetailWithExpenses>>({});

  readonly groups = computed(() => this.groupService.groups());
  readonly hasAnyDetail = computed(() => Object.keys(this._groupDetails()).length > 0);

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

  readonly groupDetailsMap = this._groupDetails;
  readonly NAVIGATION_ROUTES = NAVIGATION_ROUTES;
  readonly GroupType = GroupType;
  readonly getGroupImage = getGroupImage;
  readonly currentUser = this.authService.currentUser;
  readonly currentUserId = this.currentUser()?.id ?? 0;

  getGroupDetails = (id: number) => computed(() => this._groupDetails()[id] ?? undefined);

  ngOnInit(): void {
    this.groupService.fetchGroups().subscribe({
      next: () => this.loadGroupDetails(),
      error: (err) => {
        console.error('Error fetching groups', err);
        this.apiErrorService.handleError(err);
      },
    });
  }

  openGroupForm(): void {
    const dialogRef = this.dialogService.openFixed(GroupFormComponent, '400px');
    dialogRef.afterClosed().subscribe((data) => {
      if (data) this.addGroup(data);
    });
  }

  goToGroup(id: number): void {
    void this.router.navigate(['/groups', id]);
  }

  goToNewGroup(): void {
    void this.router.navigateByUrl(NAVIGATION_ROUTES.NEW_GROUP);
  }

  toggleShowSettledGroups(): void {
    this.showSettledGroups.update((prev) => {
      const next = !prev;
      localStorage.setItem('showSettledGroups', String(next));
      return next;
    });
  }

  private loadGroupDetails(): void {
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

  private addGroup(data: { name: string; type: GroupType }): void {
    this.groupService.createGroup(data).subscribe({
      next: (res) => {
        if (res.success) this.showForm.set(false);
      },
      error: (err) => {
        this.apiErrorService.handleError(err);
      },
    });
  }
}
