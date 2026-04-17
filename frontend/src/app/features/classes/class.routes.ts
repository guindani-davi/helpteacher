import { Routes } from '@angular/router';

export const classRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/class-list.page'),
    title: 'Aulas — Help Teacher',
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/class-create-edit.page'),
    title: 'Nova Aula — Help Teacher',
  },
  {
    path: ':classId',
    loadComponent: () => import('./pages/class-detail.page'),
    title: 'Detalhes da Aula — Help Teacher',
  },
  {
    path: ':classId/edit',
    loadComponent: () => import('./pages/class-create-edit.page'),
    title: 'Editar Aula — Help Teacher',
  },
];
