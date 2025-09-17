import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NAVIGATION_ROUTES, ROUTES } from '@constants/routes';
import { LoginComponent } from '@features/auth/login/login.component';
import { RegisterComponent } from '@features/auth/register/register.component';

const routes: Routes = [
  { path: ROUTES.LOGIN, component: LoginComponent },
  { path: ROUTES.REGISTER, component: RegisterComponent },
  { path: '', redirectTo: NAVIGATION_ROUTES.LOGIN, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
