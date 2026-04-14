import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  Membership,
  MembershipWithOrg,
  MembershipWithUser,
  UpdateMemberBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly api = inject(ApiService);

  /**
   * List all memberships (organizations) for the current user.
   * Returns memberships with joined organization data (name, slug, logoUrl).
   */
  listMine() {
    return this.api.get<ApiResponse<MembershipWithOrg[]>>('/memberships/mine');
  }

  /** Get a single membership by org slug (includes org context). */
  getBySlug(slug: string) {
    return this.api.get<ApiResponse<Membership>>(`/memberships/${slug}`);
  }

  /** List members of an org (admin/owner only). */
  listMembers(slug: string, page = 1, limit = 20) {
    return this.api.getPaginated<MembershipWithUser>(`/memberships/${slug}/members`, {
      page,
      limit,
    });
  }

  updateMember(slug: string, memberId: string, body: UpdateMemberBody) {
    return this.api.put<ApiResponse<Membership>>(`/memberships/${slug}/members/${memberId}`, body);
  }

  removeMember(slug: string, memberId: string) {
    return this.api.delete<void>(`/memberships/${slug}/members/${memberId}`);
  }

  transferOwnership(slug: string, memberId: string) {
    return this.api.put<void>(`/memberships/${slug}/transfer-ownership/${memberId}`, {});
  }
}
