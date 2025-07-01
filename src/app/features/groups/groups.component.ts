import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GroupDetailWithExpenses } from '@app/core/models/group-detail.model';
import { AuthService } from '@app/core/services/auth.service';
import { environment } from '@environments/environment';
import { GroupFormComponent } from '@features/groups/group-form/group-form.component';
import { GroupType } from '@models/group-type.enum';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [SharedUiModule, RouterModule, CommonModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent implements OnInit {
  readonly showForm = signal(false);
  readonly groups = computed(() => this.groupService.groups());

  private _groupDetails = signal<Record<number, GroupDetailWithExpenses>>({});
  readonly groupDetailsMap = this._groupDetails;

  private authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;
  readonly currentUserId = this.currentUser()?.id ?? 0;

  getGroupDetails = (id: number) =>
    computed(() => {
      const detail = this._groupDetails()[id];
      return detail ?? undefined;
    });

  constructor(
    private groupService: GroupService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
  ) {}

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

  ngOnInit(): void {
    this.groupService.fetchGroups().subscribe({
      next: () => {
        this.loadGroupDetails();
      },
      error: (err) => {
        console.error('Error fetching groups', err);
      },
    });
  }

  addGroup(data: { name: string; type: GroupType }) {
    this.groupService.createGroup(data).subscribe({
      next: (res) => {
        if (res.success) {
          this.showForm.set(false);
        }
      },
      error: (err) => {
        if (!environment.production) {
          console.error('Backend message:', err.error?.error?.message || err.message);
        }

        const message = err.error?.error?.message || 'There was an error creating the group';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
        });
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
    void this.router.navigate(['/group', id]);
  }

  goToNewGroup() {
    void this.router.navigateByUrl('/group/new');
  }
}
