import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="text-6xl mb-4">{{ icon() }}</div>
      <h3 class="text-lg font-semibold text-base-content">{{ title() }}</h3>
      <p class="text-base-content/60 mt-1 max-w-sm">{{ description() }}</p>
      <div class="mt-6">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyState {
  icon = input('📭');
  title = input('Nada aqui ainda');
  description = input('');
}
