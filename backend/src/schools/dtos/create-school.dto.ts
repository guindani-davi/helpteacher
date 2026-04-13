import type { CreateSchoolBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSchoolParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;
}

export class CreateSchoolBodyDTO implements CreateSchoolBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;
}
