import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-reset-password-page',
  imports: [FormField, RouterLink],
  template: `
    <h2 class="text-2xl font-bold text-base-content mb-2">Reset password</h2>
    <p class="text-text-secondary mb-8">Enter your new password below.</p>

    @if (successMessage()) {
      <div role="alert" class="alert alert-success alert-soft mb-6">
        <span>{{ successMessage() }}</span>
      </div>
      <p class="text-center mt-4">
        <a routerLink="/login" class="link link-primary font-medium">Go to sign in</a>
      </p>
    } @else {
      @if (errorMessage()) {
        <div role="alert" class="alert alert-error alert-soft mb-6">
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <form (submit)="onSubmit($event)">
        <fieldset class="fieldset mb-6">
          <legend class="fieldset-legend">New password</legend>
          <input
            type="password"
            class="input input-bordered w-full"
            placeholder="••••••••"
            [formField]="resetForm.newPassword"
          />
          @if (resetForm.newPassword().touched() && resetForm.newPassword().invalid()) {
            <p class="label text-error">
              @for (err of resetForm.newPassword().errors(); track err.kind) {
                {{ err.message }}
              }
            </p>
          }
        </fieldset>

        <button type="submit" class="btn btn-accent btn-block" [disabled]="isLoading()">
          @if (isLoading()) {
            <span class="loading loading-spinner loading-sm"></span>
          }
          Reset password
        </button>
      </form>

      <p class="text-center text-text-secondary text-sm mt-8">
        <a routerLink="/login" class="link link-primary font-medium">Back to sign in</a>
      </p>
    }
  `,
})
export default class ResetPasswordPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  private token = '';

  protected readonly resetModel = signal({ newPassword: '' });

  protected readonly resetForm = form(this.resetModel, (s) => {
    required(s.newPassword, { message: 'Password is required' });
    minLength(s.newPassword, 8, { message: 'Password must be at least 8 characters' });
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.errorMessage.set('Invalid or missing reset token. Please request a new link.');
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.token) return;

    submit(this.resetForm, async () => {
      this.isLoading.set(true);
      this.errorMessage.set('');

      try {
        await new Promise<void>((resolve, reject) => {
          this.auth
            .resetPassword({ token: this.token, newPassword: this.resetModel().newPassword })
            .subscribe({
              next: () => resolve(),
              error: (err) => reject(err),
            });
        });
        this.successMessage.set('Password reset successfully! You can now sign in.');
      } catch {
        this.errorMessage.set('Invalid or expired token. Please request a new link.');
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}
