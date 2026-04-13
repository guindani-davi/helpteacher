import type { UpdateSchoolBody } from '@help-teacher/shared';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateSchoolParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public schoolId: string;
}

export class UpdateSchoolBodyDTO implements UpdateSchoolBody {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255)
  public name?: string;
}
