import type { UpdateGradeLevelBody } from '@help-teacher/shared';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateGradeLevelParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public educationLevelId: string;

  @IsUUID()
  public gradeLevelId: string;
}

export class UpdateGradeLevelBodyDTO implements UpdateGradeLevelBody {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255)
  public name?: string;
}
