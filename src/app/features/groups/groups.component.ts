import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { GroupFormComponent } from '@features/groups/group-form/group-form.component';
import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { GroupType } from '@models/group-type.enum';
import { ApiErrorService } from '@services/api-error.service';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { GroupService } from '@services/group.service';
import { UiMessageService } from '@services/ui-message.service';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { getGroupImage } from '@shared/helpers/group-type-image-map';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-groups',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SharedMaterialModule,
    RouterModule,
    CommonModule,
    TranslateModule,
    CurrencySymbolPipe,
    SpinnerComponent,
  ],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly authService = inject(AuthService);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);
  private readonly uiMessage = inject(UiMessageService);

  readonly showForm = signal(false);
  readonly isLoading = signal(true);
  readonly offlineMode = signal(false);
  readonly showSettledGroups = signal(localStorage.getItem('showSettledGroups') === 'true');
  private readonly _groupDetails = signal<Record<number, GroupDetailWithExpenses>>({});
  private readonly _detailsCache = new Map<number, Signal<GroupDetailWithExpenses | undefined>>();

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

  getGroupDetails(id: number): Signal<GroupDetailWithExpenses | undefined> {
    if (!this._detailsCache.has(id)) {
      this._detailsCache.set(
        id,
        computed(() => this._groupDetails()[id]),
      );
    }
    return this._detailsCache.get(id)!;
  }

  ngOnInit(): void {
    this.groupService.fetchGroups().subscribe({
      next: () => this.loadGroupDetails(),
      error: (err) => {
        console.error('Error fetching groups', err);
        const message = this.apiErrorService.handleError(err);
        this.uiMessage.showError(message);

        if (this.groups().length > 0) {
          this.offlineMode.set(true);
          this.loadCachedGroupDetails();
        } else {
          this.isLoading.set(false);
        }
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
    if (groups.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const requests = groups.map((g) =>
      this.groupService.getGroupDetail(g.id).pipe(
        tap((detail) => {
          this._groupDetails.update((map) => ({ ...map, [detail.id]: detail }));
        }),
      ),
    );

    merge(...requests).subscribe({
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading group details', err);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  private loadCachedGroupDetails(): void {
    const details: Record<number, GroupDetailWithExpenses> = {};
    for (const g of this.groups()) {
      const cached = this.groupService.getCachedGroupDetail(g.id);
      if (cached) details[g.id] = cached;
    }
    this._groupDetails.set(details);
    this.isLoading.set(false);
  }

  private addGroup(data: { name: string; type: GroupType }): void {
    this.groupService.createGroup(data).subscribe({
      next: (res) => {
        if (res.success) this.showForm.set(false);
      },
      error: (err) => {
        const message = this.apiErrorService.handleError(err);
        this.uiMessage.showError(message);
      },
    });
  }
}
