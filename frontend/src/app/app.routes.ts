import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth';

export const routes: Routes = [
  // -----------------------------------------------------------------------
  // Public / Auth routes — SSG-friendly, guest-only
  // -----------------------------------------------------------------------
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component'),
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page'),
        title: 'Login — Help Teacher',
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page'),
        title: 'Register — Help Teacher',
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page'),
        title: 'Forgot Password — Help Teacher',
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password.page'),
        title: 'Reset Password — Help Teacher',
      },
    ],
  },

  // -----------------------------------------------------------------------
  // Private routes — SPA, auth required
  // -----------------------------------------------------------------------
  {
    path: 'orgs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orgs/org-selector/org-selector.page'),
    title: 'Organizations — Help Teacher',
  },

  // Redirect root to /login (later can be a landing page)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Catch-all
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page'),
    title: 'Not Found — Help Teacher',
  },
];
