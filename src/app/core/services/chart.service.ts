import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';

import { Expense } from '@models/expenses.model';

@Injectable({ providedIn: 'root' })
export class ChartService {
  private chart: Chart | null = null;

  destroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  renderDoughnutChart(
    ctx: HTMLCanvasElement,
    expenses: Expense[],
    categoryColorMap: Record<string, string> = {},
  ): void {
    if (!expenses.length) {
      this.destroy();
      return;
    }

    const categories = [...new Set(expenses.map((e) => e.category || 'Other'))];

    const palette = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26A69A'];
    const backgroundColors = categories.map(
      (cat, i) => categoryColorMap[cat] || palette[i % palette.length],
    );

    const totals = categories.map((cat) =>
      expenses
        .filter((e) => (e.category || 'Other') === cat)
        .reduce((sum, e) => sum + Number(e.total), 0),
    );

    this.destroy();
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{ data: totals, backgroundColor: backgroundColors }],
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed.toFixed(2)}`,
            },
          },
        },
        animation: { duration: 400 },
      },
    });
  }
}
