import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Invite, PaginatedResponse } from '@help-teacher/shared';
import { ToastService } from '../../core/services/toast.service';
import { InviteService } from '../../features/organizations/services/invite.service';
import { EmptyState, ToastContainer } from '../../shared';

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
        <h1 class="text-2xl font-bold text-base-content mb-6">Pending Invites</h1>

        @if (loading()) {
          <div class="flex justify-center py-16">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        } @else if (invites().length === 0) {
          <app-empty-state
            icon="✉️"
            title="No pending invites"
            description="You don't have any pending invitations."
          >
            <a routerLink="/orgs" class="btn btn-primary">Back to Organizations</a>
          </app-empty-state>
        } @else {
          <div class="space-y-4">
            @for (invite of invites(); track invite.id) {
              <div class="card bg-base-100 shadow-sm border border-base-300">
                <div class="card-body flex-row items-center justify-between">
                  <div>
                    <h3 class="font-semibold">{{ invite.email }}</h3>
                    <p class="text-sm text-base-content/60">
                      Roles:
                      @for (role of invite.roles; track role) {
                        <span class="badge badge-xs badge-outline mr-1">{{ role }}</span>
                      }
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" (click)="accept(invite.id)">
                      Accept
                    </button>
                    <button class="btn btn-ghost btn-sm" (click)="reject(invite.id)">Reject</button>
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
        this.toastService.error('Failed to load invites');
      },
    });
  }

  protected accept(id: string): void {
    this.inviteService.accept(id).subscribe({
      next: () => {
        this.toastService.success('Invite accepted!');
        this.invites.update((list) => list.filter((i) => i.id !== id));
      },
      error: () => this.toastService.error('Failed to accept invite'),
    });
  }

  protected reject(id: string): void {
    this.inviteService.reject(id).subscribe({
      next: () => {
        this.toastService.info('Invite rejected');
        this.invites.update((list) => list.filter((i) => i.id !== id));
      },
      error: () => this.toastService.error('Failed to reject invite'),
    });
  }
}
