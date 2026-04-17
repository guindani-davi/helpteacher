import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-forgot-password-page',
  imports: [FormField, RouterLink],
  template: `
    <h2 class="text-2xl font-bold text-base-content mb-2">Esqueceu a senha?</h2>
    <p class="text-text-secondary mb-8">
      Digite seu e-mail e enviaremos um link para redefinir sua senha.
    </p>

    @if (successMessage()) {
      <div role="alert" class="alert alert-success alert-soft mb-6">
        <span>{{ successMessage() }}</span>
      </div>
    }

    @if (errorMessage()) {
      <div role="alert" class="alert alert-error alert-soft mb-6">
        <span>{{ errorMessage() }}</span>
      </div>
    }

    <form (submit)="onSubmit($event)">
      <fieldset class="fieldset mb-6">
        <legend class="fieldset-legend">E-mail</legend>
        <input
          type="email"
          class="input input-bordered w-full"
          placeholder="voce&#64;exemplo.com"
          [formField]="forgotForm.email"
        />
        @if (forgotForm.email().touched() && forgotForm.email().invalid()) {
          <p class="label text-error">
            @for (err of forgotForm.email().errors(); track err.kind) {
              {{ err.message }}
            }
          </p>
        }
      </fieldset>

      <button type="submit" class="btn btn-accent btn-block" [disabled]="isLoading()">
        @if (isLoading()) {
          <span class="loading loading-spinner loading-sm"></span>
        }
        Enviar link
      </button>
    </form>

    <p class="text-center text-text-secondary text-sm mt-8">
      <a routerLink="/login" class="link link-primary font-medium">Voltar para login</a>
    </p>
  `,
})
export default class ForgotPasswordPage {
  private readonly auth = inject(AuthService);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly forgotModel = signal({ email: '' });

  protected readonly forgotForm = form(this.forgotModel, (s) => {
    required(s.email, { message: 'E-mail é obrigatório' });
    email(s.email, { message: 'Digite um e-mail válido' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.forgotForm, async () => {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      try {
        await new Promise<void>((resolve, reject) => {
          this.auth.requestPasswordReset(this.forgotModel()).subscribe({
            next: () => resolve(),
            error: (err) => reject(err),
          });
        });
        this.successMessage.set(
          'Se existe uma conta com este e-mail, um link de redefinição foi enviado.',
        );
      } catch {
        this.errorMessage.set('Algo deu errado. Tente novamente.');
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}
