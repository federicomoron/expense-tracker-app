import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import Chart from 'chart.js/auto';
import { take } from 'rxjs';

import { Expense } from '@models/expenses.model';
import { GroupDetailWithExpenses } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { ChartService } from '@services/chart.service';
import { GroupService } from '@services/group.service';
import { CalendarDialogComponent } from '@shared/components/calendar-dialog/calendar-dialog.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { sumExpenses, sumYourPart } from '@shared/helpers/expense.utils';
import { MonthNamePipe } from '@shared/pipes/month-name.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-group-totals',
  standalone: true,
  imports: [
    CommonModule,
    SharedMaterialModule,
    TranslateModule,
    HeaderComponent,
    MatButtonToggleModule,
    MatMenuModule,
    MonthNamePipe,
  ],
  templateUrl: './group-totals.component.html',
  styleUrls: ['./group-totals.component.scss'],
})
export class GroupTotalsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('totalsChart') totalsChart!: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupService = inject(GroupService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly chartService = inject(ChartService);

  readonly groupId = signal<number>(0);
  readonly group = signal<GroupDetailWithExpenses | null>(null);
  readonly loading = signal(true);
  readonly viewMode = signal<'all' | 'month'>('month');
  readonly selectedMonth = signal<number>(new Date().getMonth());
  readonly selectedYear = signal<number>(new Date().getFullYear());
  readonly currency = signal<'USD' | 'ARS'>('ARS');

  readonly totalAmount = computed(() => sumExpenses(this.filteredExpenses()));
  readonly hasExpenses = computed(() => this.filteredExpenses().length > 0);
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly yourPart = computed(() => sumYourPart(this.filteredExpenses(), this.currentUserId()));

  private readonly zone = inject(NgZone);
  private chartInstance: Chart | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.groupId.set(id);
    this.groupService.getGroupDetail(id).subscribe({
      next: (data) => {
        this.group.set(data as GroupDetailWithExpenses);
        this.loading.set(false);
        this.zone.onStable.pipe(take(1)).subscribe(() => {
          if (this.group() && this.hasExpenses()) {
            this.renderChart();
          }
        });
      },
      error: () => this.loading.set(false),
    });
  }

  ngAfterViewInit(): void {
    if (!this.loading() && this.group()) this.renderChart();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  setCurrency(currency: 'USD' | 'ARS'): void {
    this.currency.set(currency);
    this.renderChart();
  }

  onViewModeChange(mode: 'all' | 'month'): void {
    this.viewMode.set(mode);
    this.renderChart();
  }

  onMonthNav(action: number | 'picker'): void {
    if (action === 'picker') {
      this.openMonthPicker();
      return;
    }
    const delta = action as number;

    if (this.viewMode() === 'all') {
      this.viewMode.set('month');
      this.zone.onStable.pipe(take(1)).subscribe(() => this.changeMonth(delta));
      return;
    }

    this.changeMonth(delta);
  }

  isNextMonthDisabled(): boolean {
    const today = new Date();
    return (
      this.selectedYear() > today.getFullYear() ||
      (this.selectedYear() === today.getFullYear() && this.selectedMonth() >= today.getMonth())
    );
  }

  openMonthPicker(): void {
    const dialogRef = this.dialog.open(CalendarDialogComponent, {
      width: '320px',
      panelClass: 'calendar-dialog-panel',
    });

    dialogRef.componentInstance.mode = 'month';
    dialogRef.afterClosed().subscribe((date: Date | null) => {
      if (!date) return;
      this.selectedMonth.set(date.getMonth());
      this.selectedYear.set(date.getFullYear());
      this.renderChart();
    });
  }

  onMonthClick(): void {
    if (this.viewMode() === 'month') {
      this.openMonthPicker();
    } else {
      this.viewMode.set('month');
      this.zone.onStable.pipe(take(1)).subscribe(() => this.renderChart());
    }
  }

  goBack(): void {
    void this.router.navigate(['/groups', this.groupId()]);
  }

  private changeMonth(delta: number): void {
    const newMonth = this.selectedMonth() + delta;
    let newYear = this.selectedYear();

    if (newMonth < 0) {
      newYear--;
      this.selectedMonth.set(11);
    } else if (newMonth > 11) {
      newYear++;
      this.selectedMonth.set(0);
    } else {
      this.selectedMonth.set(newMonth);
    }

    this.selectedYear.set(newYear);
    this.renderChart();
  }

  private filteredExpenses(): Expense[] {
    const expenses = this.group()?.expenses ?? [];
    const filtered = expenses.filter((e) => e.currency === this.currency());

    if (this.viewMode() === 'all') return filtered;

    const month = this.selectedMonth();
    const year = this.selectedYear();
    return filtered.filter((e) => {
      const d = new Date(e.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }

  private renderChart(): void {
    if (!this.totalsChart?.nativeElement) return;
    this.chartService.destroy();
    if (this.chartInstance) {
      try {
        this.chartInstance.destroy();
      } catch (e) {
        void e;
      }
      this.chartInstance = null;
    }

    const expenses = this.filteredExpenses();

    if (!expenses.length) {
      const ctx = this.totalsChart.nativeElement.getContext?.('2d');
      if (ctx) {
        try {
          ctx.clearRect(
            0,
            0,
            this.totalsChart.nativeElement.width,
            this.totalsChart.nativeElement.height,
          );
        } catch (e) {
          void e;
        }
      }
      return;
    }

    this.chartInstance = this.chartService.renderDoughnutChart(
      this.totalsChart.nativeElement,
      expenses,
    );
  }

  private destroyChart(): void {
    this.chartService.destroy();
    if (this.chartInstance) {
      try {
        this.chartInstance.destroy();
      } catch (e) {
        void e;
      }
      this.chartInstance = null;
    }
  }
}
