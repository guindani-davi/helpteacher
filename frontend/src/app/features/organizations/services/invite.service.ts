import { inject, Injectable } from '@angular/core';
import type { ApiResponse, CreateInviteBody, Invite } from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class InviteService {
  private readonly api = inject(ApiService);

  /** List invites for an organization (admin/owner). */
  listByOrg(slug: string, page = 1, limit = 10) {
    return this.api.getPaginated<Invite>(`/organizations/${slug}/invites`, {
      page,
      limit,
    });
  }

  /** List current user's pending invites. */
  listMyPending(page = 1, limit = 20) {
    return this.api.getPaginated<Invite>('/invites/pending', { page, limit });
  }

  /** Get a single invite by id. */
  getById(inviteId: string) {
    return this.api.get<ApiResponse<Invite>>(`/invites/${inviteId}`);
  }

  create(slug: string, body: CreateInviteBody) {
    return this.api.post<ApiResponse<Invite>>(`/organizations/${slug}/invites`, body);
  }

  accept(inviteId: string) {
    return this.api.post<void>(`/invites/${inviteId}/accept`);
  }

  reject(inviteId: string) {
    return this.api.post<void>(`/invites/${inviteId}/reject`);
  }

  revoke(slug: string, inviteId: string) {
    return this.api.delete<void>(`/organizations/${slug}/invites/${inviteId}`);
  }
}
