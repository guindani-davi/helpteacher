import { Routes } from '@angular/router';

export const classRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/class-list.page'),
    title: 'Classes — Help Teacher',
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/class-create-edit.page'),
    title: 'New Class — Help Teacher',
  },
  {
    path: ':classId',
    loadComponent: () => import('./pages/class-detail.page'),
    title: 'Class Detail — Help Teacher',
  },
  {
    path: ':classId/edit',
    loadComponent: () => import('./pages/class-create-edit.page'),
    title: 'Edit Class — Help Teacher',
  },
];
