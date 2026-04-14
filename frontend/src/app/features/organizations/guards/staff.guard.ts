import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { OrgContextService } from '../state/org-context.service';

/**
 * Blocks responsible-only users from accessing staff routes
 * (dashboard, students, classes, schedules, subjects, schools, education-levels).
 * Redirects to the "My Students" page instead.
 */
export const staffGuard: CanActivateFn = (route) => {
  const orgContext = inject(OrgContextService);
  const router = inject(Router);

  if (!orgContext.isOnlyResponsible()) {
    return true;
  }

  const slug = orgContext.org()?.slug;
  return router.createUrlTree(['/orgs', slug ?? '', 'my-students']);
};
