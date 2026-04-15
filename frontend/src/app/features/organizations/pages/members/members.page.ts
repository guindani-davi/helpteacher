import { Component, inject, OnInit, signal } from '@angular/core';
import type { MembershipWithUser, PaginatedResponse } from '@help-teacher/shared';
import { RolesEnum } from '@help-teacher/shared';
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
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (member of members(); track member.id) {
                <tr>
                  <td class="font-medium">
                    {{ member.user.name }} {{ member.user.surname }}
                    @if (isMe(member)) {
                      <span class="badge badge-primary badge-outline ml-1">you</span>
                    }
                  </td>
                  <td class="text-base-content/60 text-sm">{{ member.user.email }}</td>
                  <td>
                    @for (role of member.roles; track role) {
                      <span class="badge badge-primary badge-outline mr-1">{{ role }}</span>
                    }
                  </td>
                  <td class="text-right">
                    @if (canManage(member)) {
                      <div class="dropdown dropdown-top dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost">⋯</div>
                        <ul
                          tabindex="0"
                          class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow border border-base-300"
                        >
                          <li>
                            <button (click)="openRolesModal(member)">Manage Roles</button>
                          </li>
                          @if (canTransfer(member)) {
                            <li>
                              <button (click)="confirmTransfer(member)">Transfer Ownership</button>
                            </li>
                          }
                          @if (canRemove(member)) {
                            <li>
                              <button class="text-error" (click)="confirmRemove(member)">
                                Remove
                              </button>
                            </li>
                          }
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

    <!-- Manage Roles Modal -->
    <dialog class="modal" [class.modal-open]="showRolesModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Manage Roles</h3>
        @if (rolesMember()) {
          <p class="text-sm text-base-content/60 mt-1">
            {{ rolesMember()!.user.name }} {{ rolesMember()!.user.surname }}
          </p>
        }
        <div class="flex flex-col gap-3 mt-4">
          @for (role of editableRoles; track role.value) {
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                class="checkbox checkbox-primary"
                [checked]="isRoleSelected(role.value)"
                [disabled]="isRoleDisabled(role.value)"
                (change)="toggleRole(role.value)"
              />
              <div>
                <span class="label-text font-medium">{{ role.label }}</span>
                <p class="text-sm text-base-content/50">{{ role.description }}</p>
              </div>
            </label>
          }
        </div>
        @if (noRolesSelected()) {
          <p class="text-sm text-error mt-2">At least one role must be selected</p>
        }
        <div class="modal-action">
          <button class="btn" (click)="closeRolesModal()">Cancel</button>
          <button
            class="btn btn-primary"
            [disabled]="savingRoles() || noRolesSelected()"
            (click)="saveRoles()"
          >
            @if (savingRoles()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            Save
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeRolesModal()">close</button>
      </form>
    </dialog>

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

  protected readonly members = signal<MembershipWithUser[]>([]);
  protected readonly loading = signal(true);
  protected readonly selectedMember = signal<MembershipWithUser | null>(null);
  protected readonly showRemoveConfirm = signal(false);
  protected readonly showTransferConfirm = signal(false);

  // Role management
  protected readonly showRolesModal = signal(false);
  protected readonly rolesMember = signal<MembershipWithUser | null>(null);
  protected readonly selectedRoles = signal<RolesEnum[]>([]);
  protected readonly savingRoles = signal(false);

  protected readonly editableRoles = [
    { value: RolesEnum.OWNER, label: 'Owner', description: 'Full control of the organization' },
    { value: RolesEnum.ADMIN, label: 'Admin', description: 'Manage members and settings' },
    { value: RolesEnum.TEACHER, label: 'Teacher', description: 'Manage classes and students' },
    {
      value: RolesEnum.RESPONSIBLE,
      label: 'Responsible',
      description: 'View student progress (parent)',
    },
  ];

  ngOnInit(): void {
    this.loadMembers();
  }

  private loadMembers(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);

    this.memberService.listMembers(slug).subscribe({
      next: (res: PaginatedResponse<MembershipWithUser>) => {
        this.members.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load members');
      },
    });
  }

  protected isMe(member: MembershipWithUser): boolean {
    return member.userId === this.authService.user()?.id;
  }

  protected canManage(member: MembershipWithUser): boolean {
    const me = this.authService.user();
    if (!me) return false;
    // Owner can manage everyone including self
    if (this.orgContext.isOwner()) return true;
    // Admin can manage non-admin, non-owner members (not self)
    if (this.orgContext.isAdmin()) {
      return (
        member.userId !== me.id &&
        !member.roles.includes(RolesEnum.OWNER) &&
        !member.roles.includes(RolesEnum.ADMIN)
      );
    }
    return false;
  }

  protected canRemove(member: MembershipWithUser): boolean {
    return !this.isMe(member);
  }

  protected canTransfer(member: MembershipWithUser): boolean {
    return this.orgContext.isOwner() && !this.isMe(member);
  }

  // --- Role management ---
  protected openRolesModal(member: MembershipWithUser): void {
    this.rolesMember.set(member);
    this.selectedRoles.set([...member.roles]);
    this.showRolesModal.set(true);
  }

  protected closeRolesModal(): void {
    this.showRolesModal.set(false);
    this.rolesMember.set(null);
  }

  protected isRoleSelected(role: RolesEnum): boolean {
    return this.selectedRoles().includes(role);
  }

  protected isRoleDisabled(role: RolesEnum): boolean {
    // Owner role can never be toggled via this modal (use Transfer Ownership)
    if (role === RolesEnum.OWNER) return true;
    return false;
  }

  protected toggleRole(role: RolesEnum): void {
    const current = this.selectedRoles();
    if (current.includes(role)) {
      this.selectedRoles.set(current.filter((r) => r !== role));
    } else {
      this.selectedRoles.set([...current, role]);
    }
  }

  protected noRolesSelected(): boolean {
    return this.selectedRoles().filter((r) => r !== RolesEnum.OWNER).length === 0;
  }

  protected saveRoles(): void {
    const member = this.rolesMember();
    const slug = this.orgContext.org()?.slug;
    if (!member || !slug) return;

    this.savingRoles.set(true);
    this.memberService.updateMember(slug, member.id, { roles: this.selectedRoles() }).subscribe({
      next: () => {
        this.toastService.success('Roles updated');
        this.closeRolesModal();
        this.loadMembers();
        // Reload own membership in case the owner changed their own roles
        if (this.isMe(member)) {
          this.orgContext.load(slug);
        }
      },
      error: () => this.toastService.error('Failed to update roles'),
      complete: () => this.savingRoles.set(false),
    });
  }

  // --- Confirm actions ---
  protected confirmRemove(member: MembershipWithUser): void {
    this.selectedMember.set(member);
    this.showRemoveConfirm.set(true);
  }

  protected confirmTransfer(member: MembershipWithUser): void {
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
