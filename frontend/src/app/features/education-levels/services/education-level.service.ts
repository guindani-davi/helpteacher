import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  CreateEducationLevelBody,
  EducationLevel,
  PaginatedResponse,
  UpdateEducationLevelBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class EducationLevelService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.get<PaginatedResponse<EducationLevel>>(
      `/organizations/${slug}/education-levels`,
      { page, limit },
    );
  }

  getById(slug: string, educationLevelId: string) {
    return this.api.get<ApiResponse<EducationLevel>>(
      `/organizations/${slug}/education-levels/${educationLevelId}`,
    );
  }

  create(slug: string, body: CreateEducationLevelBody) {
    return this.api.post<ApiResponse<EducationLevel>>(
      `/organizations/${slug}/education-levels`,
      body,
    );
  }

  update(slug: string, educationLevelId: string, body: UpdateEducationLevelBody) {
    return this.api.patch<ApiResponse<EducationLevel>>(
      `/organizations/${slug}/education-levels/${educationLevelId}`,
      body,
    );
  }

  delete(slug: string, educationLevelId: string) {
    return this.api.delete<void>(`/organizations/${slug}/education-levels/${educationLevelId}`);
  }
}
