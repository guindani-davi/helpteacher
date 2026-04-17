import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-register-page',
  imports: [FormField, RouterLink],
  template: `
    <h2 class="text-2xl font-bold text-base-content mb-2">Crie sua conta</h2>
    <p class="text-text-secondary mb-8">Comece a usar o Help Teacher</p>

    @if (errorMessage()) {
      <div role="alert" class="alert alert-error alert-soft mb-6">
        <span>{{ errorMessage() }}</span>
      </div>
    }

    <form (submit)="onSubmit($event)">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Nome</legend>
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="João"
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
          <legend class="fieldset-legend">Sobrenome</legend>
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="Silva"
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
        <legend class="fieldset-legend">E-mail</legend>
        <input
          type="email"
          class="input input-bordered w-full"
          placeholder="voce&#64;exemplo.com"
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
        <legend class="fieldset-legend">Senha</legend>
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
        Criar conta
      </button>
    </form>

    <p class="text-center text-text-secondary text-sm mt-8">
      Já tem uma conta?
      <a routerLink="/login" class="link link-primary font-medium">Entrar</a>
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
    required(s.name, { message: 'Nome é obrigatório' });
    required(s.surname, { message: 'Sobrenome é obrigatório' });
    required(s.email, { message: 'E-mail é obrigatório' });
    email(s.email, { message: 'Digite um e-mail válido' });
    required(s.password, { message: 'Senha é obrigatória' });
    minLength(s.password, 8, { message: 'A senha deve ter pelo menos 8 caracteres' });
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
