import type { CreateUserBody } from '@help-teacher/shared';
import { LocaleEnum } from '@help-teacher/shared';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserBodyDTO implements CreateUserBody {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(320)
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  public password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public surname: string;

  @IsEnum(LocaleEnum)
  @IsOptional()
  public locale?: LocaleEnum;
}
