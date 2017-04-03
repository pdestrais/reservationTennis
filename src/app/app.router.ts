import { RouterModule, Route } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from './service/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Route[] = [
  { path: '', pathMatch: 'full', canActivate: [AuthGuard], redirectTo: 'schedule'},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { loadChildren: 'app/dashboard/dashboard.module#DashboardModule', path: 'dashboard' },
  { loadChildren: 'app/profile/profile.module#ProfileModule', path: 'profile' },
  { loadChildren: 'app/weather/weather.module#WeatherModule', path: 'weather' },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }

];

export const AppRoutingModule: ModuleWithProviders = RouterModule.forRoot(
  routes,
  {
    useHash: true
  }
);
