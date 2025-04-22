import { Component, computed, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../../environments/environment';
import { GroupType } from '../../core/models/group-type.enum';
import { GroupService } from '../../core/services/group.service';
import { SharedUiModule } from '../../shared/shared-ui.module';

import { GroupFormComponent } from './group-form/group-form.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [SharedUiModule, GroupFormComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent implements OnInit {
  readonly showForm = signal(false);
  readonly groups = computed(() => this.groupService.groups());

  constructor(
    private groupService: GroupService,
    private snackBar: MatSnackBar,
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
    this.showForm.set(true);
  }
}
