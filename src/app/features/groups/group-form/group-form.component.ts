import { Component, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { GROUP_TYPE_OPTIONS, GroupType } from '@app/core/models/group-type.enum';
import { GroupService } from '@app/core/services/group.service';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [SharedUiModule],
  templateUrl: './group-form.component.html',
  styleUrl: './group-form.component.scss',
})
export class GroupFormComponent {
  name = signal('');
  type = signal<GroupType>(GroupType.TRIP);
  isNameInvalid = computed(() => this.name().trim() === '');
  groupTypeOptions = GROUP_TYPE_OPTIONS;

  private groupService = inject(GroupService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.isNameInvalid()) return;

    this.groupService
      .createGroup({
        name: this.name(),
        type: this.type(),
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/group']);
        },
        error: () => {
          this.snackBar.open('Error creating group', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onCancel() {
    this.router.navigate(['/group']);
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
  }

  onTypeChange(event: { value: GroupType }) {
    this.type.set(event.value);
  }
}
