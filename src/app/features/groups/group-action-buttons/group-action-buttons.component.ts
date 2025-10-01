import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
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

  goToTotals() {
    void this.router.navigate(['/groups', this.groupId, 'totals']);
  }
}
