import { inject } from '@angular/core';
import { type CanActivateChildFn, type CanActivateFn, Router } from '@angular/router';
import { OrgContextService } from '../state/org-context.service';

function checkIsOnlyResponsible(orgContext: OrgContextService): boolean {
  const membership = orgContext.membership();
  if (!membership) return false;
  const roles = membership.roles ?? [];
  return roles.length > 0 && roles.every((r) => r === 'responsible');
}

export const staffGuard: CanActivateFn = () => {
  const orgContext = inject(OrgContextService);
  const router = inject(Router);

  if (!checkIsOnlyResponsible(orgContext)) {
    return true;
  }

  const slug = orgContext.org()?.slug;
  return router.createUrlTree(['/orgs', slug ?? '', 'my-students']);
};

export const responsibleChildGuard: CanActivateChildFn = async (childRoute, state) => {
  const orgContext = inject(OrgContextService);
  const router = inject(Router);

  const match = state.url.match(/^\/orgs\/([^/]+)/);
  const slug = match?.[1];

  if (!slug) {
    return router.createUrlTree(['/orgs']);
  }

  if (!orgContext.org() || orgContext.org()?.slug !== slug) {
    try {
      await orgContext.load(slug);
    } catch {
      return router.createUrlTree(['/orgs']);
    }
  }

  const membership = orgContext.membership();
  const roles = membership?.roles ?? [];
  const isOnlyResponsible = roles.length > 0 && roles.every((r) => r === 'responsible');

  if (!isOnlyResponsible) {
    return true;
  }

  const allowedPattern = new RegExp(`^/orgs/${slug}/my-students(/[^/]+)?(/report)?$`);

  if (allowedPattern.test(state.url)) {
    return true;
  }

  return router.createUrlTree(['/orgs', slug, 'my-students']);
};
