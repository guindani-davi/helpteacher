import { Routes } from '@angular/router';

export const educationLevelRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/education-level-list.page'),
    title: 'Education Levels — Help Teacher',
  },
];
