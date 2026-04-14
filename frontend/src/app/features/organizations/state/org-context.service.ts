import { computed, inject, Injectable, signal } from '@angular/core';
import type { Membership, Organization } from '@help-teacher/shared';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth';
import { MembershipService } from '../services/membership.service';
import { OrganizationService } from '../services/organization.service';

/**
 * Holds the currently-active organization context (org + membership + members list).
 * Loaded by `orgResolver` when navigating into `/orgs/:slug/…`.
 */
@Injectable({ providedIn: 'root' })
export class OrgContextService {
  private readonly orgService = inject(OrganizationService);
  private readonly memberService = inject(MembershipService);
  private readonly authService = inject(AuthService);

  private readonly _org = signal<Organization | null>(null);
  private readonly _membership = signal<Membership | null>(null);
  private readonly _members = signal<Membership[]>([]);

  /** The active organization. */
  readonly org = this._org.asReadonly();

  /** The current user's membership in this org. */
  readonly membership = this._membership.asReadonly();

  /** All members of this org (only populated after `loadMembers()`). */
  readonly members = this._members.asReadonly();

  readonly currentUserRoles = computed(() => this._membership()?.roles ?? []);

  readonly isOwner = computed(() => this.currentUserRoles().some((r) => r === 'owner'));

  readonly isAdmin = computed(
    () => this.isOwner() || this.currentUserRoles().some((r) => r === 'admin'),
  );

  /** True when the user has ONLY the 'responsible' role (no admin/owner/teacher). */
  readonly isOnlyResponsible = computed(() => {
    const roles = this.currentUserRoles();
    return roles.length > 0 && roles.every((r) => r === 'responsible');
  });

  /**
   * Load org + current user's membership for the given slug.
   * Called by `orgResolver`.
   */
  async load(slug: string): Promise<void> {
    const [orgRes, membershipRes] = await Promise.all([
      firstValueFrom(this.orgService.getBySlug(slug)),
      firstValueFrom(this.memberService.getBySlug(slug)),
    ]);
    this._org.set(orgRes.data);
    this._membership.set(membershipRes.data);
  }

  /** Fetch the full members list (admin/owner only). */
  async loadMembers(page = 1, limit = 50): Promise<void> {
    const org = this._org();
    if (!org) return;
    const res = await firstValueFrom(this.memberService.listMembers(org.slug, page, limit));
    this._members.set(res.items);
  }

  clear(): void {
    this._org.set(null);
    this._membership.set(null);
    this._members.set([]);
  }
}
