import { Routes } from '@angular/router';

export const schoolRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/school-list.page'),
    title: 'Escolas — Help Teacher',
  },
];
