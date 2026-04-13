import type { UpdateEducationLevelBody } from '@help-teacher/shared';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateEducationLevelParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public educationLevelId: string;
}

export class UpdateEducationLevelBodyDTO implements UpdateEducationLevelBody {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255)
  public name?: string;
}
