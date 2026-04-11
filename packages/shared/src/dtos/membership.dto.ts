import type { RolesEnum } from "../enums/roles.enum";

export interface UpdateMemberBody {
  roles?: RolesEnum[];
}
