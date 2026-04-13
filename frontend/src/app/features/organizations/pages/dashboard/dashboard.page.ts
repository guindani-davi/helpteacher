import { Component, inject } from '@angular/core';
import { PageHeader } from '../../../../shared';
import { OrgContextService } from '../../state/org-context.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeader],
  template: `
    <app-page-header title="Dashboard" subtitle="Overview of your organization" />

    <div class="grid gap-4 md:grid-cols-3">
      <div class="stats shadow bg-base-100 border border-base-300">
        <div class="stat">
          <div class="stat-title">Your Role</div>
          <div class="stat-value text-primary text-lg">{{ roleLabel() }}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-100 border border-base-300">
        <div class="stat">
          <div class="stat-title">Students</div>
          <div class="stat-value text-primary">—</div>
          <div class="stat-desc">Coming soon</div>
        </div>
      </div>
      <div class="stats shadow bg-base-100 border border-base-300">
        <div class="stat">
          <div class="stat-title">Classes this week</div>
          <div class="stat-value text-primary">—</div>
          <div class="stat-desc">Coming soon</div>
        </div>
      </div>
    </div>
  `,
})
export default class DashboardPage {
  private readonly orgContext = inject(OrgContextService);

  protected roleLabel = () => {
    const roles = this.orgContext.currentUserRoles();
    return roles.length > 0 ? roles.join(', ') : 'Member';
  };
}
