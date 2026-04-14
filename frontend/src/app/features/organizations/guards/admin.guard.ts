import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { OrgContextService } from '../state/org-context.service';

/**
 * Blocks access to routes that require admin or owner role.
 * Redirects to the org dashboard if the user is not an admin.
 */
export const adminGuard: CanActivateFn = (route) => {
  const orgContext = inject(OrgContextService);
  const router = inject(Router);

  if (orgContext.isAdmin()) {
    return true;
  }

  const slug = orgContext.org()?.slug;
  return router.createUrlTree(['/orgs', slug ?? '']);
};
