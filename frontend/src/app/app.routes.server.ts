import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Public routes — prerendered at build time (SEO)
  { path: '', renderMode: RenderMode.Prerender },

  // Everything else — client-side SPA (no SEO needed)
  { path: '**', renderMode: RenderMode.Client },
];
