import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Public pages — prerendered at build time (SSG / SEO)
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: 'forgot-password', renderMode: RenderMode.Prerender },
  { path: 'reset-password', renderMode: RenderMode.Prerender },

  // Everything else — client-side SPA (no SSR needed)
  { path: '**', renderMode: RenderMode.Client },
];
