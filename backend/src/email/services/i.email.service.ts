import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class IEmailService {
  public abstract sendPasswordResetEmail(
    to: string,
    resetToken: string,
  ): Promise<void>;

  public abstract sendInviteEmail(
    to: string,
    organizationName: string,
  ): Promise<void>;
}
