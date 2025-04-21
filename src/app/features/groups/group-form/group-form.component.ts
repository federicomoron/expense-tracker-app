import {
  Component,
  computed,
  EventEmitter,
  Output,
  signal,
} from '@angular/core';

import {
  GROUP_TYPE_OPTIONS,
  GroupType,
} from '../../../core/models/group-type.enum';
import { SharedUiModule } from '../../../shared/shared-ui.module';

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

  // Emits the new group's data to the parent component
  @Output() groupCreated = new EventEmitter<{
    name: string;
    type: GroupType;
  }>();

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.isNameInvalid()) return;

    this.groupCreated.emit({
      name: this.name(),
      type: this.type(),
    });

    this.name.set('');
    this.type.set(GroupType.TRIP);
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
  }

  onTypeChange(event: { value: GroupType }) {
    this.type.set(event.value);
  }
}
