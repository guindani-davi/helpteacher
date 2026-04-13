import type { LinkStudentUserBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class LinkStudentUserParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public studentId: string;
}

export class LinkStudentUserBodyDTO implements LinkStudentUserBody {
  @IsUUID()
  public userId: string;
}
