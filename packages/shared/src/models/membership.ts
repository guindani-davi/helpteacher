import type { RolesEnum } from "../enums/roles.enum";

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
