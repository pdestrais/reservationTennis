import { RouterModule, Route } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { Clubschedule } from './clubschedule.component';


const routes: Route[] = [
  {
   path: 'schedule', component: Clubschedule
  }
];

export const ScheduleRoutingModule: ModuleWithProviders = RouterModule.forChild(routes);