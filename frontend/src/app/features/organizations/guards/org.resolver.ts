import { inject } from '@angular/core';
import { type ResolveFn, Router } from '@angular/router';
import type { Organization } from '@help-teacher/shared';
import { OrgContextService } from '../state/org-context.service';

/**
 * Loads the organization context (org + membership) before activating
 * any child route under `/orgs/:slug`.
 */
export const orgResolver: ResolveFn<Organization | null> = async (route) => {
  const orgContext = inject(OrgContextService);
  const router = inject(Router);
  const slug = route.paramMap.get('slug');

  if (!slug) {
    router.navigateByUrl('/orgs');
    return null;
  }

  try {
    await orgContext.load(slug);
    return orgContext.org();
  } catch {
    router.navigateByUrl('/orgs');
    return null;
  }
};
