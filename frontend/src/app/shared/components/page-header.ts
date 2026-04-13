import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-base-content/60 mt-1">{{ subtitle() }}</p>
        }
      </div>
      <div>
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeader {
  title = input.required<string>();
  subtitle = input('');
}
