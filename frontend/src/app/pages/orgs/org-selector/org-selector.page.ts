import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import type { Invite, MembershipWithOrg, PaginatedResponse } from '@help-teacher/shared';
import { AuthService } from '../../../core/auth';
import { ToastService } from '../../../core/services/toast.service';
import { InviteService } from '../../../features/organizations/services/invite.service';
import { MembershipService } from '../../../features/organizations/services/membership.service';
import { OrganizationService } from '../../../features/organizations/services/organization.service';
import { EmptyState, ToastContainer } from '../../../shared';

/**
 * Displays the user's organizations and pending invites.
 */
@Component({
  selector: 'app-org-selector-page',
  imports: [RouterLink, ToastContainer, EmptyState, FormField],
  template: `
    <div class="min-h-screen bg-base-200/30 flex flex-col">
      <!-- Top bar -->
      <header class="navbar bg-base-100 border-b border-base-300">
        <div class="flex-1">
          <span class="text-xl font-bold text-primary">Help Teacher</span>
        </div>
        <div class="flex-none">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
              <div
                class="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center"
              >
                <span class="text-sm">{{ userInitials() }}</span>
              </div>
            </div>
            <ul
              tabindex="0"
              class="menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow border border-base-300"
            >
              <li><a routerLink="/subscription">My Subscription</a></li>
              <li><a routerLink="/profile">My Profile</a></li>
              <li><a routerLink="/invites">Pending Invites</a></li>
              <li><button (click)="logout()">Logout</button></li>
            </ul>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-4xl mx-auto w-full p-6">
        <h1 class="text-2xl font-bold text-base-content mb-6">Your Organizations</h1>

        <!-- Pending invites banner -->
        @if (pendingInvites().length > 0) {
          <div class="alert alert-info mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>You have {{ pendingInvites().length }} pending invite(s)</span>
            <a routerLink="/invites" class="btn btn-primary">View</a>
          </div>
        }

        <!-- Org list -->
        @if (loading()) {
          <div class="flex justify-center py-16">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        } @else if (memberships().length === 0) {
          <app-empty-state
            icon="🏢"
            title="No organizations yet"
            description="Create your first organization to start managing classes and students."
          >
            <button class="btn btn-primary" (click)="showCreateModal.set(true)">
              Create Organization
            </button>
          </app-empty-state>
        } @else {
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            @for (m of memberships(); track m.id) {
              <a
                [routerLink]="['/orgs', m.organization.slug]"
                class="card bg-base-100 shadow-sm border border-base-300 hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div class="card-body">
                  <div class="flex items-center gap-3">
                    @if (m.organization.logoUrl) {
                      <img
                        [src]="m.organization.logoUrl"
                        [alt]="m.organization.name"
                        class="w-10 h-10 rounded-lg object-cover"
                      />
                    } @else {
                      <div
                        class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg"
                      >
                        {{ m.organization.name[0] }}
                      </div>
                    }
                    <div>
                      <h2 class="card-title text-base">{{ m.organization.name }}</h2>
                      <p class="text-sm text-base-content/60">/{{ m.organization.slug }}</p>
                    </div>
                  </div>
                </div>
              </a>
            }
          </div>
          <button class="btn btn-primary" (click)="showCreateModal.set(true)">
            + New Organization
          </button>
        }

        <!-- Create org modal -->
        <dialog class="modal" [class.modal-open]="showCreateModal()">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Create Organization</h3>
            <form (submit)="onCreate($event)">
              <fieldset class="fieldset mt-4">
                <legend class="fieldset-legend">Organization Name</legend>
                <input
                  type="text"
                  class="input input-bordered w-full"
                  placeholder="My School"
                  [formField]="createForm.name"
                />
                @if (createForm.name().touched() && createForm.name().invalid()) {
                  <p class="label text-error">
                    @for (err of createForm.name().errors(); track err.kind) {
                      {{ err.message }}
                    }
                  </p>
                }
              </fieldset>
              <div class="modal-action">
                <button type="button" class="btn" (click)="showCreateModal.set(false)">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="creating()">
                  @if (creating()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Create
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button (click)="showCreateModal.set(false)">close</button>
          </form>
        </dialog>
      </main>
    </div>
    <app-toast-container />
  `,
})
export default class OrgSelectorPage implements OnInit {
  private readonly memberService = inject(MembershipService);
  private readonly orgService = inject(OrganizationService);
  private readonly inviteService = inject(InviteService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly memberships = signal<MembershipWithOrg[]>([]);
  protected readonly pendingInvites = signal<Invite[]>([]);
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly showCreateModal = signal(false);

  protected readonly userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return '?';
    return (user.name?.[0] ?? user.email[0] ?? '?').toUpperCase();
  });

  // Create org form
  protected readonly createModel = signal({ name: '' });
  protected readonly createForm = form(this.createModel, (s) => {
    required(s.name, { message: 'Organization name is required' });
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);

    // Load user's memberships (needs backend endpoint GET /memberships/mine)
    this.memberService.listMine().subscribe({
      next: (res) => {
        this.memberships.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        // Endpoint may not exist yet — gracefully show empty state
        this.memberships.set([]);
        this.loading.set(false);
      },
    });

    // Load pending invites
    this.inviteService.listMyPending().subscribe({
      next: (res: PaginatedResponse<Invite>) => this.pendingInvites.set(res.items),
      error: () => {}, // Silently fail on invites
    });
  }

  onCreate(event: Event): void {
    event.preventDefault();
    submit(this.createForm, async () => {
      this.creating.set(true);
      try {
        const { name } = this.createModel();
        const res = await new Promise<{ data: { slug: string } }>((resolve, reject) => {
          this.orgService.create({ name: name.trim() }).subscribe({
            next: (r) => resolve(r as { data: { slug: string } }),
            error: reject,
          });
        });
        this.showCreateModal.set(false);
        this.toastService.success('Organization created!');
        this.router.navigate(['/orgs', res.data.slug]);
      } catch {
        this.toastService.error('Failed to create organization');
      } finally {
        this.creating.set(false);
      }
    });
  }

  protected logout(): void {
    this.authService.logout();
  }
}
