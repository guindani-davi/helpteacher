import type { UpdateScheduleBody } from '@help-teacher/shared';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { StartTimeBeforeEndTime } from '../../common/validators/time-range.validator';
import { DayOfWeekEnum } from '../enums/day-of-week.enum';

export class UpdateScheduleParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;

  @IsUUID()
  public scheduleId: string;
}

@StartTimeBeforeEndTime('startTime', 'endTime')
export class UpdateScheduleBodyDTO implements UpdateScheduleBody {
  @IsEnum(DayOfWeekEnum)
  @IsOptional()
  public dayOfWeek?: DayOfWeekEnum;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format',
  })
  @IsOptional()
  @MaxLength(255)
  public startTime?: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:mm format',
  })
  @IsOptional()
  @MaxLength(255)
  public endTime?: string;
}
