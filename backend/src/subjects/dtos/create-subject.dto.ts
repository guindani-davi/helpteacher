import type { CreateSubjectBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSubjectParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;
}

export class CreateSubjectBodyDTO implements CreateSubjectBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;
}
