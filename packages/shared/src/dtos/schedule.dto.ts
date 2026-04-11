import type { DayOfWeekEnum } from "../enums/day-of-week.enum";

export interface CreateScheduleBody {
  dayOfWeek: DayOfWeekEnum;
  startTime: string;
  endTime: string;
}

export interface UpdateScheduleBody {
  dayOfWeek?: DayOfWeekEnum;
  startTime?: string;
  endTime?: string;
}
