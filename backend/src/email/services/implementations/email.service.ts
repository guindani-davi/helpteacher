import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IEmailService } from '../i.email.service';

@Injectable()
export class EmailService extends IEmailService {
  private readonly fromAddress: string;
  private readonly frontendUrl: string;
  private readonly resend: Resend;
  private readonly configService: ConfigService;

  public constructor(@Inject(ConfigService) configService: ConfigService) {
    super();
    this.configService = configService;
    this.fromAddress = this.configService.getOrThrow<string>('EMAIL_FROM');
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  public async sendPasswordResetEmail(
    to: string,
    resetToken: string,
  ): Promise<void> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;

    const subject = 'Reset your password';
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`;

    await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
  }

  public async sendInviteEmail(
    to: string,
    organizationName: string,
  ): Promise<void> {
    const invitesLink = `${this.frontendUrl}/invites`;
    const safeName = this.escapeHtml(organizationName);

    const subject = `You've been invited to join ${organizationName}`;
    const html = `<p>You've been invited to join <strong>${safeName}</strong>. Click <a href="${invitesLink}">here</a> to view your pending invites.</p>`;

    await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
