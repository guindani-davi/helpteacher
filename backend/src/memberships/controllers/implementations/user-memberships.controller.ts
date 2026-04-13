import { Controller, Get, Inject } from '@nestjs/common';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../../auth/models/jwt.model';
import { MembershipWithOrg } from '../../models/membership-with-org.model';
import { IMembershipsService } from '../../services/i.memberships.service';
import { IUserMembershipsController } from '../i.user-memberships.controller';

/**
 * Handles user-scoped membership endpoints (no org slug required).
 * Only JWT auth is applied — no MembershipGuard or ActiveSubscriptionGuard.
 */
@Controller('memberships')
export class UserMembershipsController extends IUserMembershipsController {
  public constructor(
    @Inject(IMembershipsService)
    membershipsService: IMembershipsService,
  ) {
    super(membershipsService);
  }

  @Get('mine')
  public async getUserMemberships(
    @CurrentUser() user: JwtPayload,
  ): Promise<MembershipWithOrg[]> {
    return this.membershipsService.getUserMemberships(user);
  }
}
