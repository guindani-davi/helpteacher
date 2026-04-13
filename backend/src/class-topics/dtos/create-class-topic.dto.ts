import type { CreateClassTopicBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateClassTopicParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public classId: string;
}

export class CreateClassTopicBodyDTO implements CreateClassTopicBody {
  @IsUUID()
  public topicId: string;
}
