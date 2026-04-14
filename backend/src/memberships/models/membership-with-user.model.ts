import { RolesEnum } from '../../auth/enums/roles.enum';
import { Membership } from './membership.model';

export class UserSummary {
  public readonly id: string;
  public readonly name: string;
  public readonly surname: string;
  public readonly email: string;

  public constructor(id: string, name: string, surname: string, email: string) {
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.email = email;
  }
}

export class MembershipWithUser extends Membership {
  public readonly user: UserSummary;

  public constructor(
    id: string,
    userId: string,
    organizationId: string,
    roles: RolesEnum[],
    isActive: boolean,
    createdBy: string,
    updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date | null,
    user: UserSummary,
  ) {
    super(
      id,
      userId,
      organizationId,
      roles,
      isActive,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
    );
    this.user = user;
  }
}
