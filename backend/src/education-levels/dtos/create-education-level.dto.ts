import type { CreateEducationLevelBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEducationLevelParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;
}

export class CreateEducationLevelBodyDTO implements CreateEducationLevelBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;
}
