import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/student-list.page'),
    title: 'Students — Help Teacher',
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/student-create-edit.page'),
    title: 'New Student — Help Teacher',
  },
  {
    path: ':studentId',
    loadComponent: () => import('./pages/student-detail.page'),
    title: 'Student — Help Teacher',
  },
  {
    path: ':studentId/edit',
    loadComponent: () => import('./pages/student-create-edit.page'),
    title: 'Edit Student — Help Teacher',
  },
  {
    path: ':studentId/registrations',
    loadComponent: () => import('./pages/student-registrations.page'),
    title: 'Registrations — Help Teacher',
  },
  {
    path: ':studentId/report',
    loadComponent: () => import('./pages/student-report.page'),
    title: 'Student Report — Help Teacher',
  },
];
