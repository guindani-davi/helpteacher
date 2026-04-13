import { Component, inject, OnInit, signal } from '@angular/core';
import { email as emailValidator, form, FormField, required, submit } from '@angular/forms/signals';
import type { Invite, PaginatedResponse } from '@help-teacher/shared';
import { RolesEnum } from '@help-teacher/shared';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../../shared';
import { InviteService } from '../../services/invite.service';
import { OrgContextService } from '../../state/org-context.service';

@Component({
  selector: 'app-invites-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Invites" subtitle="Invite people to join your organization">
      <button class="btn btn-primary btn-sm" (click)="showCreateModal.set(true)">
        + Send Invite
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (invites().length === 0) {
      <app-empty-state
        icon="✉️"
        title="No invites sent"
        description="Send invites to add people to your organization."
      >
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">Send Invite</button>
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (invite of invites(); track invite.id) {
                <tr>
                  <td>{{ invite.email }}</td>
                  <td>
                    @for (role of invite.roles; track role) {
                      <span class="badge badge-sm badge-outline mr-1">{{ role }}</span>
                    }
                  </td>
                  <td>
                    <span
                      class="badge badge-sm"
                      [class.badge-warning]="invite.status === 'pending'"
                      [class.badge-success]="invite.status === 'accepted'"
                      [class.badge-error]="
                        invite.status === 'rejected' || invite.status === 'revoked'
                      "
                    >
                      {{ invite.status }}
                    </span>
                  </td>
                  <td class="text-right">
                    @if (invite.status === 'pending') {
                      <button
                        class="btn btn-ghost btn-xs text-error"
                        (click)="confirmRevoke(invite)"
                      >
                        Revoke
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
        <h3 class="font-bold text-lg">Send Invite</h3>
        <form (submit)="onSendInvite($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Email</legend>
            <input
              type="email"
              class="input input-bordered w-full"
              placeholder="user&#64;example.com"
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
            <label class="label"><span class="label-text">Roles</span></label>
            <div class="flex flex-wrap gap-2">
              @for (role of availableRoles; track role) {
                <label class="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm checkbox-primary"
                    [checked]="selectedRoles().includes(role)"
                    (change)="toggleRole(role)"
                  />
                  <span class="label-text">{{ role }}</span>
                </label>
              }
            </div>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" (click)="showCreateModal.set(false)">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="sending()">
              @if (sending()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Send
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
      title="Revoke Invite"
      [message]="'Revoke the invite sent to ' + (revokeTarget()?.email ?? '') + '?'"
      confirmLabel="Revoke"
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
    required(s.email, { message: 'Email is required' });
    emailValidator(s.email, { message: 'Enter a valid email address' });
  });

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
        this.toastService.error('Failed to load invites');
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
      this.toastService.warning('Select at least one role');
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
        this.toastService.success('Invite sent!');
        this.inviteModel.set({ email: '' });
        this.selectedRoles.set([RolesEnum.TEACHER]);
        this.loadInvites(this.currentPage());
      } catch {
        this.toastService.error('Failed to send invite');
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
        this.toastService.success('Invite revoked');
        this.loadInvites(this.currentPage());
      },
      error: () => this.toastService.error('Failed to revoke invite'),
    });
  }
}
