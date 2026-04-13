import type { RequestPasswordResetBody } from '@help-teacher/shared';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class RequestPasswordResetDTO implements RequestPasswordResetBody {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(320)
  public email: string;
}
