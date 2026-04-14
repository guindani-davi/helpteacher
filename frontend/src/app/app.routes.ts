import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth';

export const routes: Routes = [
  // -----------------------------------------------------------------------
  // Public landing page
  // -----------------------------------------------------------------------
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.page'),
    title: 'Help Teacher — Manage your students, classes, and curriculum',
    pathMatch: 'full',
  },

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

  // Organization selector
  {
    path: 'orgs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orgs/org-selector/org-selector.page'),
    title: 'Organizations — Help Teacher',
  },

  // Pending invites
  {
    path: 'invites',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/invites/invites-pending.page'),
    title: 'Pending Invites — Help Teacher',
  },

  // Profile
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page'),
    title: 'My Profile — Help Teacher',
  },

  // Subscription (auth required)
  {
    path: 'subscription',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/subscription/subscription.page'),
    title: 'My Subscription — Help Teacher',
  },

  // Plans (public)
  {
    path: 'plans',
    loadComponent: () => import('./pages/plans/plans.page'),
    title: 'Plans — Help Teacher',
  },

  // Organization context (org layout + all child features)
  {
    path: 'orgs/:slug',
    canActivate: [authGuard],
    loadChildren: () => import('./features/organizations/org.routes').then((m) => m.orgRoutes),
  },

  // Catch-all
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page'),
    title: 'Not Found — Help Teacher',
  },
];
