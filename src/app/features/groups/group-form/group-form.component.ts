import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { GROUP_TYPE_OPTIONS, GroupType } from '@models/group-type.enum';
import { GroupService } from '@services/group.service';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [SharedMaterialModule, TranslateModule],
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss'],
})
export class GroupFormComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  name = signal('');
  submitted = signal(false);
  type = signal<GroupType>(GroupType.TRIP);
  imagePreview = signal<string | null>(null);

  isNameInvalid = computed(() => this.submitted() && this.name().trim().length === 0);

  private groupService = inject(GroupService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  groupTypeOptions = GROUP_TYPE_OPTIONS;
  selectedImage: File | null = null;
  isSubmitting = false;

  onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);

    if (!this.isFormValid()) return;

    this.isSubmitting = true;

    this.groupService
      .createGroup({
        name: this.name(),
        type: this.type(),
        imageUrl: undefined,
      })
      .subscribe({
        next: () => void this.router.navigate([NAVIGATION_ROUTES.GROUPS]),
        error: () => {
          this.snackBar.open(
            this.translate.instant('groupForm.errorCreating'),
            this.translate.instant('common.close'),
            { duration: 3000 },
          );
        },
      });
  }

  onCancel() {
    void this.router.navigate([NAVIGATION_ROUTES.GROUPS]);
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
  }

  onTypeChange(event: { value: GroupType }) {
    this.type.set(event.value);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(this.selectedImage);
    }
  }

  private isFormValid() {
    return this.name().trim().length > 0;
  }
}
