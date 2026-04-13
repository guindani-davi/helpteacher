import type { CreateTopicBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTopicParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;
}

export class CreateTopicBodyDTO implements CreateTopicBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;

  @IsUUID()
  public subjectId: string;
}
