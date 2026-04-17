import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/student-list.page'),
    title: 'Alunos — Help Teacher',
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/student-create-edit.page'),
    title: 'Novo Aluno — Help Teacher',
  },
  {
    path: ':studentId',
    loadComponent: () => import('./pages/student-detail.page'),
    title: 'Aluno — Help Teacher',
  },
  {
    path: ':studentId/edit',
    loadComponent: () => import('./pages/student-create-edit.page'),
    title: 'Editar Aluno — Help Teacher',
  },
  {
    path: ':studentId/registrations',
    loadComponent: () => import('./pages/student-registrations.page'),
    title: 'Matrículas — Help Teacher',
  },
  {
    path: ':studentId/report',
    loadComponent: () => import('./pages/student-report.page'),
    title: 'Relatório do Aluno — Help Teacher',
  },
];
