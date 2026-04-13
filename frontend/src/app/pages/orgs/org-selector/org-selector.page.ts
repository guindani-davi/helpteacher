import { Component } from '@angular/core';

@Component({
  selector: 'app-org-selector-page',
  template: `
    <div class="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div class="card bg-base-100 shadow-md w-full max-w-lg">
        <div class="card-body text-center">
          <h2 class="card-title justify-center text-2xl mb-2">Your Organizations</h2>
          <p class="text-text-secondary mb-6">
            Select an organization to get started, or create a new one.
          </p>

          <!-- Placeholder — will be populated when org APIs are wired -->
          <div class="flex flex-col gap-3 items-center">
            <p class="text-text-secondary text-sm py-8">You don't have any organizations yet.</p>

            <button class="btn btn-accent btn-wide">Create organization</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class OrgSelectorPage {}
