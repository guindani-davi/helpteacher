import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
        <p class="text-xl text-base-content mb-2">Page not found</p>
        <p class="text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a routerLink="/login" class="btn btn-primary">Go to home</a>
      </div>
    </div>
  `,
})
export default class NotFoundPage {}
