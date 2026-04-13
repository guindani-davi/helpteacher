import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-register-page',
  imports: [FormField, RouterLink],
  template: `
    <h2 class="text-2xl font-bold text-base-content mb-2">Create your account</h2>
    <p class="text-text-secondary mb-8">Get started with Help Teacher</p>

    @if (errorMessage()) {
      <div role="alert" class="alert alert-error alert-soft mb-6">
        <span>{{ errorMessage() }}</span>
      </div>
    }

    <form (submit)="onSubmit($event)">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">First name</legend>
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="John"
            [formField]="registerForm.name"
          />
          @if (registerForm.name().touched() && registerForm.name().invalid()) {
            <p class="label text-error">
              @for (err of registerForm.name().errors(); track err.kind) {
                {{ err.message }}
              }
            </p>
          }
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Last name</legend>
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="Doe"
            [formField]="registerForm.surname"
          />
          @if (registerForm.surname().touched() && registerForm.surname().invalid()) {
            <p class="label text-error">
              @for (err of registerForm.surname().errors(); track err.kind) {
                {{ err.message }}
              }
            </p>
          }
        </fieldset>
      </div>

      <fieldset class="fieldset mb-4">
        <legend class="fieldset-legend">Email</legend>
        <input
          type="email"
          class="input input-bordered w-full"
          placeholder="you&#64;example.com"
          [formField]="registerForm.email"
        />
        @if (registerForm.email().touched() && registerForm.email().invalid()) {
          <p class="label text-error">
            @for (err of registerForm.email().errors(); track err.kind) {
              {{ err.message }}
            }
          </p>
        }
      </fieldset>

      <fieldset class="fieldset mb-6">
        <legend class="fieldset-legend">Password</legend>
        <input
          type="password"
          class="input input-bordered w-full"
          placeholder="••••••••"
          [formField]="registerForm.password"
        />
        @if (registerForm.password().touched() && registerForm.password().invalid()) {
          <p class="label text-error">
            @for (err of registerForm.password().errors(); track err.kind) {
              {{ err.message }}
            }
          </p>
        }
      </fieldset>

      <button type="submit" class="btn btn-accent btn-block" [disabled]="isLoading()">
        @if (isLoading()) {
          <span class="loading loading-spinner loading-sm"></span>
        }
        Create account
      </button>
    </form>

    <p class="text-center text-text-secondary text-sm mt-8">
      Already have an account?
      <a routerLink="/login" class="link link-primary font-medium">Sign in</a>
    </p>
  `,
})
export default class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly registerModel = signal({
    name: '',
    surname: '',
    email: '',
    password: '',
  });

  protected readonly registerForm = form(this.registerModel, (s) => {
    required(s.name, { message: 'First name is required' });
    required(s.surname, { message: 'Last name is required' });
    required(s.email, { message: 'Email is required' });
    email(s.email, { message: 'Enter a valid email address' });
    required(s.password, { message: 'Password is required' });
    minLength(s.password, 8, { message: 'Password must be at least 8 characters' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.registerForm, async () => {
      this.isLoading.set(true);
      this.errorMessage.set('');

      try {
        const model = this.registerModel();
        await new Promise<void>((resolve, reject) => {
          this.auth.register(model).subscribe({
            next: () => {
              // Auto-login after registration
              this.auth.login({ email: model.email, password: model.password }).subscribe({
                next: () => {
                  this.auth.fetchMe().subscribe({
                    next: () => resolve(),
                    error: (err) => reject(err),
                  });
                },
                error: (err) => reject(err),
              });
            },
            error: (err) => reject(err),
          });
        });
        this.router.navigateByUrl('/orgs');
      } catch (err: any) {
        const message = err?.error?.message ?? 'Registration failed. Please try again.';
        this.errorMessage.set(message);
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}
