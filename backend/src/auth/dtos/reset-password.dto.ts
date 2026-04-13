import type { ResetPasswordBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDTO implements ResetPasswordBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  public token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  public newPassword: string;
}
