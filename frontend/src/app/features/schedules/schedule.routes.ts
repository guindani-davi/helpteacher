import { Routes } from '@angular/router';

export const scheduleRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/schedule-list.page'),
    title: 'Schedules — Help Teacher',
  },
];
