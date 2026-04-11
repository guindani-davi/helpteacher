import type { RolesEnum } from "../enums/roles.enum";

export interface CreateInviteBody {
  email: string;
  roles: RolesEnum[];
}
