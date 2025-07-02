import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'new',
    loadComponent: () =>
      import('./expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  // {
  //   path: 'edit/:expenseId',
  //   loadComponent: () =>
  //     import('./expense-edit/expense-edit.component').then((m) => m.ExpenseEditComponent),
  // },
];

export default routes;
