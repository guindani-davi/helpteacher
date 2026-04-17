import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { HelpersModule } from '../helpers/helpers.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MembershipsController } from './controllers/implementations/memberships.controller';
import { UserMembershipsController } from './controllers/implementations/user-memberships.controller';
import { MembershipGuard } from './guards/membership.guard';
import { IMembershipsRepository } from './repositories/i.memberships.repository';
import { MembershipsRepository } from './repositories/implementations/memberships.repository';
import { IMembershipsService } from './services/i.memberships.service';
import { MembershipsService } from './services/implementations/memberships.service';

@Module({
  controllers: [UserMembershipsController, MembershipsController],
  imports: [
    DatabaseModule,
    HelpersModule,
    forwardRef(() => AuthModule),
    forwardRef(() => OrganizationsModule),
  ],
  providers: [
    {
      provide: IMembershipsRepository,
      useClass: MembershipsRepository,
    },
    {
      provide: IMembershipsService,
      useClass: MembershipsService,
    },
    MembershipGuard,
  ],
  exports: [IMembershipsService, MembershipGuard],
})
export class MembershipsModule {}
