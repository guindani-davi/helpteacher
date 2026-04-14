import type { RolesEnum } from "../enums/roles.enum";
import type { Organization } from "./organization";
import type { SafeUser } from "./user";

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  roles: RolesEnum[];
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Membership with the joined organization summary — returned by `GET /memberships/mine`. */
export interface MembershipWithOrg extends Membership {
  organization: Pick<Organization, "id" | "name" | "slug" | "logoUrl">;
}

/** Membership with user summary — returned by `GET /memberships/:slug/members`. */
export interface MembershipWithUser extends Membership {
  user: Pick<SafeUser, "id" | "name" | "surname" | "email">;
}
