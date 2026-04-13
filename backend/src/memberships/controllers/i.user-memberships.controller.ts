import type { JwtPayload } from '../../auth/models/jwt.model';
import { MembershipWithOrg } from '../models/membership-with-org.model';
import { IMembershipsService } from '../services/i.memberships.service';

export abstract class IUserMembershipsController {
  protected readonly membershipsService: IMembershipsService;

  public constructor(membershipsService: IMembershipsService) {
    this.membershipsService = membershipsService;
  }

  public abstract getUserMemberships(
    user: JwtPayload,
  ): Promise<MembershipWithOrg[]>;
}
