import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';

import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-exp-date-button',
  imports: [CommonModule, SharedUiModule],
  templateUrl: './exp-date-button.component.html',
  styleUrl: './exp-date-button.component.scss',
})
export class ExpDateButtonComponent {
  @ViewChild('datepicker') datepicker!: MatDatepicker<Date>;
  @Input() value: Date = new Date();
  @Output() valueChange = new EventEmitter<Date>();

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.valueChange.emit(event.value);
    }
  }

  openPicker() {
    this.datepicker.open();
  }
}
