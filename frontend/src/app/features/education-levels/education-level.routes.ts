import { Routes } from '@angular/router';

export const educationLevelRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/education-level-list.page'),
    title: 'Níveis de Ensino — Help Teacher',
  },
];
