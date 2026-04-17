import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Invite, PaginatedResponse } from '@help-teacher/shared';
import { ToastService } from '../../core/services/toast.service';
import { InviteService } from '../../features/organizations/services/invite.service';
import { EmptyState, ToastContainer } from '../../shared';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  teacher: 'Professor',
  responsible: 'Responsável',
};

@Component({
  selector: 'app-invites-pending-page',
  imports: [RouterLink, ToastContainer, EmptyState],
  template: `
    <div class="min-h-screen bg-base-200/30 flex flex-col">
      <header class="navbar bg-base-100 border-b border-base-300">
        <div class="flex-1">
          <a routerLink="/orgs" class="text-xl font-bold text-primary">Help Teacher</a>
        </div>
      </header>
      <main class="flex-1 max-w-2xl mx-auto w-full p-6">
        <h1 class="text-2xl font-bold text-base-content mb-6">Convites Pendentes</h1>

        @if (loading()) {
          <div class="flex justify-center py-16">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        } @else if (invites().length === 0) {
          <app-empty-state
            icon="✉️"
            title="Nenhum convite pendente"
            description="Você não tem nenhum convite pendente."
          >
            <a routerLink="/orgs" class="btn btn-primary">Voltar para Organizações</a>
          </app-empty-state>
        } @else {
          <div class="space-y-4">
            @for (invite of invites(); track invite.id) {
              <div class="card bg-base-100 shadow-sm border border-base-300">
                <div class="card-body flex-row items-center justify-between">
                  <div>
                    <h3 class="font-semibold">{{ invite.email }}</h3>
                    <p class="text-sm text-base-content/60">
                      Funções:
                      @for (role of invite.roles; track role) {
                        <span class="badge badge-primary badge-outline mr-1">{{
                          translateRole(role)
                        }}</span>
                      }
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn btn-primary" (click)="accept(invite.id)">Aceitar</button>
                    <button class="btn btn-ghost" (click)="reject(invite.id)">Recusar</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
    <app-toast-container />
  `,
})
export default class InvitesPendingPage implements OnInit {
  private readonly inviteService = inject(InviteService);
  private readonly toastService = inject(ToastService);

  protected readonly invites = signal<Invite[]>([]);
  protected readonly loading = signal(true);

  protected translateRole(role: string): string {
    return ROLE_LABELS[role] ?? role;
  }

  ngOnInit(): void {
    this.loadInvites();
  }

  private loadInvites(): void {
    this.loading.set(true);
    this.inviteService.listMyPending().subscribe({
      next: (res: PaginatedResponse<Invite>) => {
        this.invites.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Falha ao carregar convites');
      },
    });
  }

  protected accept(id: string): void {
    this.inviteService.accept(id).subscribe({
      next: () => {
        this.toastService.success('Convite aceito!');
        this.invites.update((list) => list.filter((i) => i.id !== id));
      },
      error: () => this.toastService.error('Falha ao aceitar convite'),
    });
  }

  protected reject(id: string): void {
    this.inviteService.reject(id).subscribe({
      next: () => {
        this.toastService.info('Convite recusado');
        this.invites.update((list) => list.filter((i) => i.id !== id));
      },
      error: () => this.toastService.error('Falha ao recusar convite'),
    });
  }
}
