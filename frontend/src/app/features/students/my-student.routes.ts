import { Routes } from '@angular/router';

export const myStudentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/my-students.page'),
    title: 'My Students — Help Teacher',
  },
  {
    path: ':studentId',
    loadComponent: () => import('./pages/student-progress.page'),
    title: 'Student Progress — Help Teacher',
  },
];
