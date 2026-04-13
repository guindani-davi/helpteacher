import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-base-200/30 flex flex-col">
      <header class="navbar bg-base-100 border-b border-base-300">
        <div class="flex-1">
          <a routerLink="/orgs" class="text-xl font-bold text-primary">Help Teacher</a>
        </div>
      </header>
      <main class="flex-1 max-w-2xl mx-auto w-full p-6">
        <h1 class="text-2xl font-bold text-base-content mb-6">My Profile</h1>
        <p class="text-base-content/60">Profile editing — coming soon.</p>
      </main>
    </div>
  `,
})
export default class ProfilePage {}
