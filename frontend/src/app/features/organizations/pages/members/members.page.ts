import { Component, inject, OnInit, signal } from '@angular/core';
import type { Membership, PaginatedResponse } from '@help-teacher/shared';
import { AuthService } from '../../../../core/auth';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialog, PageHeader } from '../../../../shared';
import { MembershipService } from '../../services/membership.service';
import { OrgContextService } from '../../state/org-context.service';

@Component({
  selector: 'app-members-page',
  imports: [PageHeader, ConfirmDialog],
  template: `
    <app-page-header title="Members" subtitle="Manage who has access to this organization" />

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Roles</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (member of members(); track member.id) {
                <tr>
                  <td class="font-medium font-mono text-sm">{{ member.userId }}</td>
                  <td>
                    @for (role of member.roles; track role) {
                      <span class="badge badge-sm badge-outline mr-1">{{ role }}</span>
                    }
                  </td>
                  <td class="text-right">
                    @if (canManage(member)) {
                      <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-xs">⋯</div>
                        <ul
                          tabindex="0"
                          class="dropdown-content menu bg-base-100 rounded-box z-50 w-48 p-2 shadow border border-base-300"
                        >
                          @if (orgContext.isOwner()) {
                            <li>
                              <button (click)="confirmTransfer(member)">Transfer Ownership</button>
                            </li>
                          }
                          <li>
                            <button class="text-error" (click)="confirmRemove(member)">
                              Remove
                            </button>
                          </li>
                        </ul>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    <app-confirm-dialog
      [open]="showRemoveConfirm()"
      title="Remove Member"
      [message]="'Remove this member from the organization?'"
      confirmLabel="Remove"
      variant="danger"
      (confirmed)="removeMember()"
      (cancelled)="showRemoveConfirm.set(false)"
    />

    <app-confirm-dialog
      [open]="showTransferConfirm()"
      title="Transfer Ownership"
      [message]="'Transfer ownership to this member? You will lose owner privileges.'"
      confirmLabel="Transfer"
      variant="danger"
      (confirmed)="transferOwnership()"
      (cancelled)="showTransferConfirm.set(false)"
    />
  `,
})
export default class MembersPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly memberService = inject(MembershipService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly members = signal<Membership[]>([]);
  protected readonly loading = signal(true);
  protected readonly selectedMember = signal<Membership | null>(null);
  protected readonly showRemoveConfirm = signal(false);
  protected readonly showTransferConfirm = signal(false);

  ngOnInit(): void {
    this.loadMembers();
  }

  private loadMembers(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);

    this.memberService.listMembers(slug).subscribe({
      next: (res: PaginatedResponse<Membership>) => {
        this.members.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load members');
      },
    });
  }

  protected canManage(member: Membership): boolean {
    const me = this.authService.user();
    if (!me || member.userId === me.id) return false;
    return this.orgContext.isOwner();
  }

  protected confirmRemove(member: Membership): void {
    this.selectedMember.set(member);
    this.showRemoveConfirm.set(true);
  }

  protected confirmTransfer(member: Membership): void {
    this.selectedMember.set(member);
    this.showTransferConfirm.set(true);
  }

  protected removeMember(): void {
    const member = this.selectedMember();
    const slug = this.orgContext.org()?.slug;
    if (!member || !slug) return;
    this.showRemoveConfirm.set(false);

    this.memberService.removeMember(slug, member.id).subscribe({
      next: () => {
        this.toastService.success('Member removed');
        this.loadMembers();
      },
      error: () => this.toastService.error('Failed to remove member'),
    });
  }

  protected transferOwnership(): void {
    const member = this.selectedMember();
    const slug = this.orgContext.org()?.slug;
    if (!member || !slug) return;
    this.showTransferConfirm.set(false);

    this.memberService.transferOwnership(slug, member.id).subscribe({
      next: () => {
        this.toastService.success('Ownership transferred');
        this.loadMembers();
      },
      error: () => this.toastService.error('Failed to transfer ownership'),
    });
  }
}
