import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { orgResolver } from './guards/org.resolver';
import { responsibleChildGuard, staffGuard } from './guards/staff.guard';

export const orgRoutes: Routes = [
  {
    path: '',
    resolve: { org: orgResolver },
    canActivateChild: [responsibleChildGuard],
    loadComponent: () => import('./layout/org-layout'),
    children: [
      {
        path: '',
        canActivate: [staffGuard],
        loadComponent: () => import('./pages/dashboard/dashboard.page'),
        title: 'Painel — Help Teacher',
      },
      {
        path: 'settings',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/settings/org-settings.page'),
        title: 'Configurações — Help Teacher',
      },
      {
        path: 'settings/members',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/members/members.page'),
        title: 'Membros — Help Teacher',
      },
      {
        path: 'settings/invites',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/invites/invites.page'),
        title: 'Convites — Help Teacher',
      },
      {
        path: 'students',
        canActivate: [staffGuard],
        loadChildren: () => import('../students/student.routes').then((m) => m.studentRoutes),
      },
      {
        path: 'my-students',
        loadChildren: () => import('../students/my-student.routes').then((m) => m.myStudentRoutes),
      },
      {
        path: 'schools',
        canActivate: [staffGuard],
        loadChildren: () => import('../schools/school.routes').then((m) => m.schoolRoutes),
      },
      {
        path: 'education-levels',
        canActivate: [staffGuard],
        loadChildren: () =>
          import('../education-levels/education-level.routes').then((m) => m.educationLevelRoutes),
      },
      {
        path: 'subjects',
        canActivate: [staffGuard],
        loadChildren: () => import('../subjects/subject.routes').then((m) => m.subjectRoutes),
      },
      {
        path: 'schedules',
        canActivate: [staffGuard],
        loadChildren: () => import('../schedules/schedule.routes').then((m) => m.scheduleRoutes),
      },
      {
        path: 'classes',
        canActivate: [staffGuard],
        loadChildren: () => import('../classes/class.routes').then((m) => m.classRoutes),
      },
    ],
  },
];
