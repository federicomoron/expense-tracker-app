import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-group-action-buttons',
  standalone: true,
  imports: [CommonModule, SharedMaterialModule, TranslateModule],
  templateUrl: './group-action-buttons.component.html',
  styleUrls: ['./group-action-buttons.component.scss'],
})
export class GroupActionButtonsComponent {
  private router = inject(Router);

  @Input() groupId!: number;
  @Output() settleUp = new EventEmitter<void>();

  goToTotals() {
    void this.router.navigate(['/groups', this.groupId, 'totals']);
  }
}
