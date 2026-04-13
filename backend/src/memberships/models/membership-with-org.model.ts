import { RolesEnum } from '../../auth/enums/roles.enum';
import { Membership } from './membership.model';

/**
 * A lightweight summary of an organization, returned alongside a membership.
 */
export class OrganizationSummary {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly logoUrl: string | null;

  public constructor(
    id: string,
    name: string,
    slug: string,
    logoUrl: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.logoUrl = logoUrl;
  }
}

/**
 * Membership enriched with the joined organization summary.
 * Returned by `GET /memberships/mine`.
 */
export class MembershipWithOrg extends Membership {
  public readonly organization: OrganizationSummary;

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
    organization: OrganizationSummary,
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
    this.organization = organization;
  }
}
