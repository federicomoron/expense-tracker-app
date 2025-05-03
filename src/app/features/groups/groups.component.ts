import { Component, computed, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { GroupType } from '@app/core/models/group-type.enum';
import { GroupService } from '@app/core/services/group.service';
import { GroupFormComponent } from '@app/features/groups/group-form/group-form.component';
import { SharedUiModule } from '@app/shared/shared-ui.module';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [SharedUiModule, RouterModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent implements OnInit {
  readonly showForm = signal(false);
  readonly groups = computed(() => this.groupService.groups());

  constructor(
    private groupService: GroupService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.groupService.fetchGroups().subscribe();
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
    this.router.navigate(['/group', id]);
  }
}
