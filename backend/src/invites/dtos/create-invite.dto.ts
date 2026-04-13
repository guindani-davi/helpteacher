import type { CreateInviteBody } from '@help-teacher/shared';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { RolesEnum } from '../../auth/enums/roles.enum';

export class CreateInviteParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;
}

export class CreateInviteBodyDTO implements CreateInviteBody {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(320)
  public email: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RolesEnum, { each: true })
  public roles: RolesEnum[];
}
