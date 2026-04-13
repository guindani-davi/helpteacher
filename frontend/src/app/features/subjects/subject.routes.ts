import { Routes } from '@angular/router';

export const subjectRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/subject-list.page'),
    title: 'Subjects — Help Teacher',
  },
  {
    path: ':subjectId/topics',
    loadComponent: () => import('./pages/topic-list.page'),
    title: 'Topics — Help Teacher',
  },
];
