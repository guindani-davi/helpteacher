import { Component, inject, OnInit, signal } from '@angular/core';
import { email as emailValidator, form, FormField, required, submit } from '@angular/forms/signals';
import type { Invite, PaginatedResponse } from '@help-teacher/shared';
import { RolesEnum } from '@help-teacher/shared';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../../shared';
import { InviteService } from '../../services/invite.service';
import { OrgContextService } from '../../state/org-context.service';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  teacher: 'Professor',
  responsible: 'Responsável',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Rejeitado',
  revoked: 'Revogado',
};

@Component({
  selector: 'app-invites-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Convites" subtitle="Convide pessoas para se juntar à sua organização">
      <button class="btn btn-primary" (click)="showCreateModal.set(true)">+ Enviar Convite</button>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (invites().length === 0) {
      <app-empty-state
        icon="✉️"
        title="Nenhum convite enviado"
        description="Envie convites para adicionar pessoas à sua organização."
      >
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">Enviar Convite</button>
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Funções</th>
                <th>Status</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (invite of invites(); track invite.id) {
                <tr>
                  <td>{{ invite.email }}</td>
                  <td>
                    @for (role of invite.roles; track role) {
                      <span class="badge badge-primary badge-outline mr-1">{{
                        translateRole(role)
                      }}</span>
                    }
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-warning]="invite.status === 'pending'"
                      [class.badge-success]="invite.status === 'accepted'"
                      [class.badge-error]="
                        invite.status === 'rejected' || invite.status === 'revoked'
                      "
                    >
                      {{ translateStatus(invite.status) }}
                    </span>
                  </td>
                  <td class="text-right">
                    @if (invite.status === 'pending') {
                      <button class="btn btn-ghost text-error" (click)="confirmRevoke(invite)">
                        Revogar
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex justify-center mt-4">
        <app-pagination
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (pageChanged)="loadInvites($event)"
        />
      </div>
    }

    <!-- Create invite modal -->
    <dialog class="modal" [class.modal-open]="showCreateModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Enviar Convite</h3>
        <form (submit)="onSendInvite($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">E-mail</legend>
            <input
              type="email"
              class="input input-bordered w-full"
              placeholder="usuario&#64;exemplo.com"
              [formField]="inviteForm.email"
            />
            @if (inviteForm.email().touched() && inviteForm.email().invalid()) {
              <p class="label text-error">
                @for (err of inviteForm.email().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>

          <div class="form-control mt-4">
            <label class="label"><span class="label-text">Funções</span></label>
            <div class="flex flex-wrap gap-2">
              @for (role of availableRoles; track role) {
                <label class="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm checkbox-primary"
                    [checked]="selectedRoles().includes(role)"
                    (change)="toggleRole(role)"
                  />
                  <span class="label-text">{{ translateRole(role) }}</span>
                </label>
              }
            </div>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" (click)="showCreateModal.set(false)">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="sending()">
              @if (sending()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Enviar
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="showCreateModal.set(false)">close</button>
      </form>
    </dialog>

    <app-confirm-dialog
      [open]="showRevokeConfirm()"
      title="Revogar Convite"
      [message]="'Revogar o convite enviado para ' + (revokeTarget()?.email ?? '') + '?'"
      confirmLabel="Revogar"
      variant="danger"
      (confirmed)="revokeInvite()"
      (cancelled)="showRevokeConfirm.set(false)"
    />
  `,
})
export default class InvitesPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly inviteService = inject(InviteService);
  private readonly toastService = inject(ToastService);

  protected readonly invites = signal<Invite[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly sending = signal(false);
  protected readonly showCreateModal = signal(false);
  protected readonly showRevokeConfirm = signal(false);
  protected readonly revokeTarget = signal<Invite | null>(null);
  protected readonly selectedRoles = signal<RolesEnum[]>([RolesEnum.TEACHER]);

  protected readonly availableRoles = [RolesEnum.ADMIN, RolesEnum.TEACHER, RolesEnum.RESPONSIBLE];

  // Signal form for the invite email
  protected readonly inviteModel = signal({ email: '' });
  protected readonly inviteForm = form(this.inviteModel, (s) => {
    required(s.email, { message: 'E-mail é obrigatório' });
    emailValidator(s.email, { message: 'Digite um e-mail válido' });
  });

  protected translateRole(role: string): string {
    return ROLE_LABELS[role] ?? role;
  }

  protected translateStatus(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  ngOnInit(): void {
    this.loadInvites(1);
  }

  loadInvites(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.inviteService.listByOrg(slug, page).subscribe({
      next: (res: PaginatedResponse<Invite>) => {
        this.invites.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Falha ao carregar convites');
      },
    });
  }

  protected toggleRole(role: RolesEnum): void {
    this.selectedRoles.update((roles) =>
      roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role],
    );
  }

  onSendInvite(event: Event): void {
    event.preventDefault();
    if (this.selectedRoles().length === 0) {
      this.toastService.warning('Selecione pelo menos uma função');
      return;
    }

    submit(this.inviteForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.sending.set(true);

      try {
        const { email } = this.inviteModel();
        await new Promise<void>((resolve, reject) => {
          this.inviteService
            .create(slug, { email: email.trim(), roles: this.selectedRoles() })
            .subscribe({
              next: () => resolve(),
              error: reject,
            });
        });
        this.showCreateModal.set(false);
        this.toastService.success('Convite enviado!');
        this.inviteModel.set({ email: '' });
        this.selectedRoles.set([RolesEnum.TEACHER]);
        this.loadInvites(this.currentPage());
      } catch {
        this.toastService.error('Falha ao enviar convite');
      } finally {
        this.sending.set(false);
      }
    });
  }

  protected confirmRevoke(invite: Invite): void {
    this.revokeTarget.set(invite);
    this.showRevokeConfirm.set(true);
  }

  protected revokeInvite(): void {
    const invite = this.revokeTarget();
    const slug = this.orgContext.org()?.slug;
    if (!invite || !slug) return;
    this.showRevokeConfirm.set(false);

    this.inviteService.revoke(slug, invite.id).subscribe({
      next: () => {
        this.toastService.success('Convite revogado');
        this.loadInvites(this.currentPage());
      },
      error: () => this.toastService.error('Falha ao revogar convite'),
    });
  }
}
