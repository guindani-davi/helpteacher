import type { RefreshTokenBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDTO implements RefreshTokenBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  public refreshToken: string;
}
