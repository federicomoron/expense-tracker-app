import { Component, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GROUP_TYPE_OPTIONS, GroupType } from '@models/group-type.enum';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [SharedUiModule, TranslateModule],
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
  private translate = inject(TranslateService);

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
          void this.router.navigate(['/groups']);
        },
        error: () => {
          this.snackBar.open(
            this.translate.instant('groupForm.errorCreating'),
            this.translate.instant('common.close'),
            {
              duration: 3000,
            },
          );
        },
      });
  }

  onCancel() {
    void this.router.navigate(['/groups']);
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
  }

  onTypeChange(event: { value: GroupType }) {
    this.type.set(event.value);
  }
}
