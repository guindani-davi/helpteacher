import type { UpdateClassBody } from '@help-teacher/shared';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateClassParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public classId: string;
}

export class UpdateClassBodyDTO implements UpdateClassBody {
  @IsUUID()
  @IsOptional()
  public scheduleId?: string;

  @IsUUID()
  @IsOptional()
  public studentId?: string;

  @IsUUID()
  @IsOptional()
  public teacherId?: string;

  @IsDateString()
  @IsOptional()
  @MaxLength(255)
  public date?: string;
}
