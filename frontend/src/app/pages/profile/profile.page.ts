import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, minLength, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import type { ApiResponse, SafeUser } from '@help-teacher/shared';
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
          <a routerLink="/orgs" class="btn btn-ghost">← Voltar para Organizações</a>
        </div>
      </header>

      <main class="flex-1 max-w-2xl mx-auto w-full p-6 space-y-6">
        <h1 class="text-2xl font-bold text-base-content">Meu Perfil</h1>

        <!-- User Info Card -->
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Informações da Conta</h2>
            <div class="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label class="label text-sm text-base-content/60">Nome</label>
                <p class="text-base-content font-medium">{{ userName() }}</p>
              </div>
              <div>
                <label class="label text-sm text-base-content/60">Sobrenome</label>
                <p class="text-base-content font-medium">{{ userSurname() }}</p>
              </div>
              <div class="sm:col-span-2">
                <label class="label text-sm text-base-content/60">E-mail</label>
                <p class="text-base-content font-medium">{{ userEmail() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Alterar Senha</h2>
            <form (ngSubmit)="onPasswordSubmit()" class="mt-4 space-y-4">
              <div class="form-control">
                <label class="label text-sm text-base-content/70">Senha Atual</label>
                <input
                  type="password"
                  class="input input-bordered w-full"
                  placeholder="Digite a senha atual"
                  [formField]="passwordForm.currentPassword"
                />
              </div>
              <div class="form-control">
                <label class="label text-sm text-base-content/70">Nova Senha</label>
                <input
                  type="password"
                  class="input input-bordered w-full"
                  placeholder="Digite a nova senha"
                  [formField]="passwordForm.password"
                />
                @if (passwordForm.password().invalid() && passwordForm.password().touched()) {
                  <label class="label text-sm text-error"
                    >A senha deve ter pelo menos 8 caracteres</label
                  >
                }
              </div>
              <div class="form-control">
                <label class="label text-sm text-base-content/70">Confirmar Nova Senha</label>
                <input
                  type="password"
                  class="input input-bordered w-full"
                  placeholder="Confirme a nova senha"
                  [formField]="passwordForm.confirmPassword"
                />
                @if (passwordMismatch()) {
                  <label class="label text-sm text-error">As senhas não coincidem</label>
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
                  Atualizar Senha
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

  protected savingPassword = signal(false);

  protected userName = computed(() => this.authService.user()?.name ?? '—');
  protected userSurname = computed(() => this.authService.user()?.surname ?? '—');
  protected userEmail = computed(() => this.authService.user()?.email ?? '—');

  private passwordModel = signal({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  protected passwordForm = form(this.passwordModel, (p) => {
    required(p.currentPassword, { message: 'Senha atual é obrigatória' });
    required(p.password, { message: 'Nova senha é obrigatória' });
    minLength(p.password, 8);
    required(p.confirmPassword, { message: 'Confirme sua senha' });
  });

  protected passwordMismatch = computed(() => {
    const state = this.passwordModel();
    return state.confirmPassword.length > 0 && state.password !== state.confirmPassword;
  });

  protected onPasswordSubmit(): void {
    submit(this.passwordForm, async () => {
      const value = this.passwordModel();
      if (value.password !== value.confirmPassword) {
        this.toast.error('As senhas não coincidem');
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
        this.toast.success('Senha atualizada com sucesso');
        this.passwordModel.set({ currentPassword: '', password: '', confirmPassword: '' });
      } catch {
        this.toast.error('Falha ao atualizar senha. Verifique sua senha atual.');
      } finally {
        this.savingPassword.set(false);
      }
    });
  }
}
