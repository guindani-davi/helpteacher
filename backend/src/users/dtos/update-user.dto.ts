import type { UpdateUserBody } from '@help-teacher/shared';
import { LocaleEnum } from '@help-teacher/shared';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AtLeastOneField } from '../../common/validators/at-least-one-field.validator';

@AtLeastOneField(['locale', 'password'])
export class UpdateUserBodyDTO implements UpdateUserBody {
  @IsEnum(LocaleEnum)
  @IsOptional()
  public locale?: LocaleEnum;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @IsOptional()
  public password?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ValidateIf((o: UpdateUserBodyDTO) => !!o.password)
  public currentPassword?: string;
}
