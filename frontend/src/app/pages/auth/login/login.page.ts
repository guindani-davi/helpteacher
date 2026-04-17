import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-login-page',
  imports: [FormField, RouterLink],
  template: `
    <h2 class="text-2xl font-bold text-base-content mb-2">Bem-vindo de volta</h2>
    <p class="text-text-secondary mb-8">Entre na sua conta</p>

    @if (errorMessage()) {
      <div role="alert" class="alert alert-error alert-soft mb-6">
        <span>{{ errorMessage() }}</span>
      </div>
    }

    <form (submit)="onSubmit($event)">
      <fieldset class="fieldset mb-4">
        <legend class="fieldset-legend">E-mail</legend>
        <input
          type="email"
          class="input input-bordered w-full"
          placeholder="voce&#64;exemplo.com"
          [formField]="loginForm.email"
        />
        @if (loginForm.email().touched() && loginForm.email().invalid()) {
          <p class="label text-error">
            @for (err of loginForm.email().errors(); track err.kind) {
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
          [formField]="loginForm.password"
        />
        @if (loginForm.password().touched() && loginForm.password().invalid()) {
          <p class="label text-error">
            @for (err of loginForm.password().errors(); track err.kind) {
              {{ err.message }}
            }
          </p>
        }
      </fieldset>

      <div class="flex items-center justify-between mb-6">
        <a routerLink="/forgot-password" class="link link-primary text-sm"> Esqueceu a senha? </a>
      </div>

      <button type="submit" class="btn btn-accent btn-block" [disabled]="isLoading()">
        @if (isLoading()) {
          <span class="loading loading-spinner loading-sm"></span>
        }
        Entrar
      </button>
    </form>

    <p class="text-center text-text-secondary text-sm mt-8">
      Não tem uma conta?
      <a routerLink="/register" class="link link-primary font-medium">Cadastre-se</a>
    </p>
  `,
})
export default class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly loginModel = signal({
    email: '',
    password: '',
  });

  protected readonly loginForm = form(this.loginModel, (s) => {
    required(s.email, { message: 'E-mail é obrigatório' });
    email(s.email, { message: 'Digite um e-mail válido' });
    required(s.password, { message: 'Senha é obrigatória' });
    minLength(s.password, 6, { message: 'A senha deve ter pelo menos 6 caracteres' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.loginForm, async () => {
      this.isLoading.set(true);
      this.errorMessage.set('');

      try {
        const { email, password } = this.loginModel();
        await new Promise<void>((resolve, reject) => {
          this.auth.login({ email, password }).subscribe({
            next: () => {
              this.auth.fetchMe().subscribe({
                next: () => resolve(),
                error: (err) => reject(err),
              });
            },
            error: (err) => reject(err),
          });
        });
        this.router.navigateByUrl('/orgs');
      } catch {
        this.errorMessage.set('E-mail ou senha inválidos. Tente novamente.');
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}
