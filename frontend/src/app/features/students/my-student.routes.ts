import { Routes } from '@angular/router';

export const myStudentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/my-students.page'),
    title: 'Meus Alunos — Help Teacher',
  },
  {
    path: ':studentId',
    loadComponent: () => import('./pages/student-progress.page'),
    title: 'Progresso do Aluno — Help Teacher',
  },
  {
    path: ':studentId/report',
    loadComponent: () => import('./pages/student-report.page'),
    title: 'Relatório do Aluno — Help Teacher',
  },
];
