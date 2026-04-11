import type { InviteStatusEnum } from "../enums/invite-status.enum";
import type { RolesEnum } from "../enums/roles.enum";

export interface Invite {
  id: string;
  organizationId: string;
  email: string;
  roles: RolesEnum[];
  status: InviteStatusEnum;
  invitedBy: string;
  expiresAt: string;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}
