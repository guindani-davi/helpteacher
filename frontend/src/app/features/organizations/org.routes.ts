import { Routes } from '@angular/router';
import { orgResolver } from './guards/org.resolver';

export const orgRoutes: Routes = [
  {
    path: '',
    resolve: { org: orgResolver },
    loadComponent: () => import('./layout/org-layout'),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.page'),
        title: 'Dashboard — Help Teacher',
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/org-settings.page'),
        title: 'Settings — Help Teacher',
      },
      {
        path: 'settings/members',
        loadComponent: () => import('./pages/members/members.page'),
        title: 'Members — Help Teacher',
      },
      {
        path: 'settings/invites',
        loadComponent: () => import('./pages/invites/invites.page'),
        title: 'Invites — Help Teacher',
      },
      // Placeholder routes for parallel phases
      {
        path: 'students',
        loadChildren: () => import('../students/student.routes').then((m) => m.studentRoutes),
      },
      {
        path: 'schools',
        loadChildren: () => import('../schools/school.routes').then((m) => m.schoolRoutes),
      },
      {
        path: 'education-levels',
        loadChildren: () =>
          import('../education-levels/education-level.routes').then((m) => m.educationLevelRoutes),
      },
      {
        path: 'subjects',
        loadChildren: () => import('../subjects/subject.routes').then((m) => m.subjectRoutes),
      },
      {
        path: 'schedules',
        loadChildren: () => import('../schedules/schedule.routes').then((m) => m.scheduleRoutes),
      },
      {
        path: 'classes',
        loadChildren: () => import('../classes/class.routes').then((m) => m.classRoutes),
      },
    ],
  },
];
