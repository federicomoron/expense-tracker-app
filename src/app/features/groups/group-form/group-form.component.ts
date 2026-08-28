import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { GROUP_TYPE_OPTIONS, GroupType } from '@models/group-type.enum';
import { HeaderAction } from '@models/header-action.model';
import { ApiErrorService } from '@services/api-error.service';
import { GroupService } from '@services/group.service';
import { UiMessageService } from '@services/ui-message.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [SharedMaterialModule, TranslateModule, HeaderComponent],
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
  private apiErrorService = inject(ApiErrorService);
  private uiMessage = inject(UiMessageService);
  private translate = inject(TranslateService);

  groupTypeOptions = GROUP_TYPE_OPTIONS;
  selectedImage: File | null = null;
  isSubmitting = false;

  get headerActions(): HeaderAction[] {
    return [
      {
        label: 'groupForm.save',
        icon: 'check',
        onClick: () => this.onSubmit(),
        showSpinner: this.isSubmitting,
        spinnerColor: 'white',
      },
    ];
  }

  onSubmit(event?: Event) {
    event?.preventDefault();
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
        error: (err) => {
          const message = this.apiErrorService.handleError(err);
          this.uiMessage.showError(message);
          this.isSubmitting = false;
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
