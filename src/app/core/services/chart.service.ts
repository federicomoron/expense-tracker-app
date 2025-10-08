import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Chart from 'chart.js/auto';

import { Expense } from '@models/expenses.model';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '@shared/data/expense-categories';

@Injectable({ providedIn: 'root' })
export class ChartService {
  private chart: Chart | null = null;
  constructor(private translate: TranslateService) {}

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
  ): Chart | null {
    if (!expenses.length) return null;

    const pickCategoryKey = (e: Expense): string => {
      const known = EXPENSE_CATEGORIES;
      const catValue = (e.category ?? '').toString().trim();
      if (catValue) {
        const foundByKey = known.find((c) => c.key.toLowerCase() === catValue.toLowerCase());
        if (foundByKey) return foundByKey.key;
        const foundByLabel = known.find((c) => c.label.toLowerCase() === catValue.toLowerCase());
        if (foundByLabel) return foundByLabel.key;
      }

      const desc = (e.description ?? '').toString().toLowerCase();
      for (const c of known) {
        const keywords = c.keywords ?? [];
        if (c.label && desc.includes(c.label.toLowerCase())) return c.key;
        for (const kw of keywords) {
          if (!kw) continue;
          if (desc.includes(kw.toLowerCase())) return c.key;
        }
      }

      return 'Other';
    };

    const map = new Map<string, { label: string; total: number }>();
    for (const e of expenses) {
      const key = pickCategoryKey(e);
      const cat =
        EXPENSE_CATEGORIES.find((c) => c.key === key) ??
        EXPENSE_CATEGORIES.find((c) => c.key === 'Other')!;
      const prev = map.get(key);
      const add = Number(e.total) || 0;
      if (prev) prev.total += add;
      else map.set(key, { label: cat.label, total: add });
    }

    const categories = Array.from(map.keys());
    const labels = categories.map((k) => {
      const translated = this.translate.instant(`expenseCategories.${k}`);
      return translated || map.get(k)!.label;
    });

    const palette = [
      '#42A5F5',
      '#66BB6A',
      '#FFA726',
      '#AB47BC',
      '#FF7043',
      '#26A69A',
      '#29B6F6',
      '#9CCC65',
    ];

    const categoryDefaults = new Map<string, string>(
      EXPENSE_CATEGORIES.map((c, i) => [
        c.key,
        CATEGORY_COLORS[c.key] || palette[i % palette.length],
      ]),
    );

    const backgroundColors = categories.map(
      (catKey, i) =>
        categoryColorMap[catKey] || categoryDefaults.get(catKey) || palette[i % palette.length],
    );

    const totals = categories.map((k) => map.get(k)!.total);

    try {
      const existing = (Chart as any).getChart?.(ctx as any) as Chart | undefined | null;
      if (existing) existing.destroy();
    } catch (e) {
      void e;
    }

    this.destroy();

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
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
        layout: { padding: { left: 48 } },
        animation: { duration: 400 },
      },
    });

    return this.chart;
  }
}
