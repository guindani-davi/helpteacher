import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import type { ApiResponse, SafeUser } from '@help-teacher/shared';
import { LocaleEnum } from '@help-teacher/shared';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainer } from '../../shared';

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, FormField, ToastContainer],
  template: `
    <div class="min-h-screen bg-base-200/30 flex flex-col">
      <header class="navbar bg-base-100 border-b border-base-300">
        <div class="flex-1">
          <a routerLink="/orgs" class="text-xl font-bold text-primary">Help Teacher</a>
        </div>
        <div class="flex-none">
          <a routerLink="/orgs" class="btn btn-ghost">← Back to Organizations</a>
        </div>
      </header>

      <main class="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6">
        <h1 class="text-2xl font-bold text-base-content">My Profile</h1>

        <!-- User Info Card -->
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Account Information</h2>
            <div class="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label class="label text-sm text-base-content/60">Name</label>
                <p class="text-base-content font-medium">{{ userName() }}</p>
              </div>
              <div>
                <label class="label text-sm text-base-content/60">Surname</label>
                <p class="text-base-content font-medium">{{ userSurname() }}</p>
              </div>
              <div class="sm:col-span-2">
                <label class="label text-sm text-base-content/60">Email</label>
                <p class="text-base-content font-medium">{{ userEmail() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Locale Preference -->
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Locale Preference</h2>
            <div class="flex flex-col sm:flex-row sm:items-center mt-4">
              <label class="label text-sm text-base-content/70">Language</label>
              <select
                class="select select-bordered w-full max-w-xs mt-2 sm:mt-0 sm:ml-4"
                [value]="selectedLocale()"
                (change)="onLocaleChange($event)"
              >
                @for (loc of locales; track loc.value) {
                  <option [value]="loc.value">{{ loc.label }}</option>
                }
              </select>
            </div>
            <div class="card-actions mt-4">
              <button
                class="btn btn-primary"
                [disabled]="savingLocale()"
                (click)="saveLocale()"
              >
                @if (savingLocale()) {
                  <span class="loading loading-spinner loading-sm"></span>
                }
                Save Locale
              </button>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Change Password</h2>
            <form (ngSubmit)="onPasswordSubmit()" class="mt-4 space-y-4">
              <div class="form-control">
                <label class="label text-sm text-base-content/70">Current Password</label>
                <input
                  type="password"
                  class="input input-bordered w-full"
                  placeholder="Enter current password"
                  [formField]="passwordForm.currentPassword"
                />
              </div>
              <div class="form-control">
                <label class="label text-sm text-base-content/70">New Password</label>
                <input
                  type="password"
                  class="input input-bordered w-full"
                  placeholder="Enter new password"
                  [formField]="passwordForm.password"
                />
                @if (passwordForm.password().invalid() && passwordForm.password().touched()) {
                  <label class="label text-sm text-error"
                    >Password must be at least 8 characters</label
                  >
                }
              </div>
              <div class="form-control">
                <label class="label text-sm text-base-content/70">Confirm New Password</label>
                <input
                  type="password"
                  class="input input-bordered w-full"
                  placeholder="Confirm new password"
                  [formField]="passwordForm.confirmPassword"
                />
                @if (passwordMismatch()) {
                  <label class="label text-sm text-error">Passwords do not match</label>
                }
              </div>
              <div class="card-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="savingPassword() || passwordForm().invalid()"
                >
                  @if (savingPassword()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
    <app-toast-container />
  `,
})
export default class ProfilePage {
  private readonly authService = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  protected savingLocale = signal(false);
  protected savingPassword = signal(false);
  protected selectedLocale = signal<string>(LocaleEnum.EN);

  protected userName = computed(() => this.authService.user()?.name ?? '—');
  protected userSurname = computed(() => this.authService.user()?.surname ?? '—');
  protected userEmail = computed(() => this.authService.user()?.email ?? '—');

  protected locales = [
    { value: LocaleEnum.EN, label: 'English' },
    { value: LocaleEnum.PT_BR, label: 'Português (Brasil)' },
    { value: LocaleEnum.ES, label: 'Español' },
  ];

  private passwordModel = signal({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  protected passwordForm = form(this.passwordModel, (p) => {
    required(p.currentPassword, { message: 'Current password is required' });
    required(p.password, { message: 'New password is required' });
    minLength(p.password, 8);
    required(p.confirmPassword, { message: 'Please confirm your password' });
  });

  protected passwordMismatch = computed(() => {
    const state = this.passwordModel();
    return state.confirmPassword.length > 0 && state.password !== state.confirmPassword;
  });

  constructor() {
    const user = this.authService.user();
    if (user?.locale) {
      this.selectedLocale.set(user.locale);
    }
  }

  protected onLocaleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedLocale.set(select.value);
  }

  protected saveLocale(): void {
    this.savingLocale.set(true);
    this.api
      .patch<ApiResponse<SafeUser>>('/users/me', { locale: this.selectedLocale() })
      .subscribe({
        next: () => {
          this.toast.success('Locale updated successfully');
          this.savingLocale.set(false);
          this.authService.fetchMe().subscribe();
        },
        error: () => {
          this.toast.error('Failed to update locale');
          this.savingLocale.set(false);
        },
      });
  }

  protected onPasswordSubmit(): void {
    submit(this.passwordForm, async () => {
      const value = this.passwordModel();
      if (value.password !== value.confirmPassword) {
        this.toast.error('Passwords do not match');
        return;
      }
      this.savingPassword.set(true);
      try {
        await firstValueFrom(
          this.api.patch<ApiResponse<SafeUser>>('/users/me', {
            currentPassword: value.currentPassword,
            password: value.password,
          }),
        );
        this.toast.success('Password updated successfully');
        this.passwordModel.set({ currentPassword: '', password: '', confirmPassword: '' });
      } catch {
        this.toast.error('Failed to update password. Check your current password.');
      } finally {
        this.savingPassword.set(false);
      }
    });
  }
}
