import type { DayOfWeekEnum } from "../enums/day-of-week.enum";

export interface Schedule {
  id: string;
  dayOfWeek: DayOfWeekEnum;
  startTime: string;
  endTime: string;
  organizationId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}
