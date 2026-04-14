import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  CreateScheduleBody,
  Schedule,
  UpdateScheduleBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.getPaginated<Schedule>(`/organizations/${slug}/schedules`, {
      page,
      limit,
    });
  }

  getById(slug: string, scheduleId: string) {
    return this.api.get<ApiResponse<Schedule>>(`/organizations/${slug}/schedules/${scheduleId}`);
  }

  create(slug: string, body: CreateScheduleBody) {
    return this.api.post<ApiResponse<Schedule>>(`/organizations/${slug}/schedules`, body);
  }

  update(slug: string, scheduleId: string, body: UpdateScheduleBody) {
    return this.api.patch<ApiResponse<Schedule>>(
      `/organizations/${slug}/schedules/${scheduleId}`,
      body,
    );
  }

  delete(slug: string, scheduleId: string) {
    return this.api.delete<void>(`/organizations/${slug}/schedules/${scheduleId}`);
  }
}
