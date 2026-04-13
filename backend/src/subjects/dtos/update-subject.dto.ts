import type { UpdateSubjectBody } from '@help-teacher/shared';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateSubjectParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public subjectId: string;
}

export class UpdateSubjectBodyDTO implements UpdateSubjectBody {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255)
  public name?: string;
}
