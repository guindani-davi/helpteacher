import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

/**
 * Centered layout for auth pages (login, register, forgot/reset password).
 * Two-column: left brand panel + right form area.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="flex min-h-screen">
      <!-- Brand panel (hidden on mobile) -->
      <div class="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div class="text-center text-primary-content">
          <h1 class="text-4xl font-bold mb-4">Help Teacher</h1>
          <p class="text-lg opacity-90">
            Gerencie seus alunos, aulas e currículo — tudo em um só lugar.
          </p>
        </div>
      </div>

      <!-- Form area -->
      <div class="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-base-100">
        <div class="w-full max-w-md">
          <!-- Mobile logo -->
          <div class="lg:hidden text-center mb-8">
            <a routerLink="/login" class="text-2xl font-bold text-primary">Help Teacher</a>
          </div>

          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export default class AuthLayoutComponent {}
