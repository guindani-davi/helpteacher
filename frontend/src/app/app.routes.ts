import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth';

export const routes: Routes = [
  // Redirect root to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

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
        title: 'Entrar — Help Teacher',
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page'),
        title: 'Cadastrar — Help Teacher',
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page'),
        title: 'Esqueci a Senha — Help Teacher',
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password.page'),
        title: 'Redefinir Senha — Help Teacher',
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
    title: 'Organizações — Help Teacher',
  },

  // Pending invites
  {
    path: 'invites',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/invites/invites-pending.page'),
    title: 'Convites Pendentes — Help Teacher',
  },

  // Profile
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page'),
    title: 'Meu Perfil — Help Teacher',
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
    title: 'Página Não Encontrada — Help Teacher',
  },
];
