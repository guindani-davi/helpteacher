import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  CreateGradeLevelBody,
  GradeLevel,
  UpdateGradeLevelBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class GradeLevelService {
  private readonly api = inject(ApiService);

  list(slug: string, educationLevelId: string, page = 1, limit = 50) {
    return this.api.getPaginated<GradeLevel>(
      `/organizations/${slug}/education-levels/${educationLevelId}/grade-levels`,
      { page, limit },
    );
  }

  getById(slug: string, educationLevelId: string, gradeLevelId: string) {
    return this.api.get<ApiResponse<GradeLevel>>(
      `/organizations/${slug}/education-levels/${educationLevelId}/grade-levels/${gradeLevelId}`,
    );
  }

  create(slug: string, educationLevelId: string, body: CreateGradeLevelBody) {
    return this.api.post<ApiResponse<GradeLevel>>(
      `/organizations/${slug}/education-levels/${educationLevelId}/grade-levels`,
      body,
    );
  }

  update(slug: string, educationLevelId: string, gradeLevelId: string, body: UpdateGradeLevelBody) {
    return this.api.patch<ApiResponse<GradeLevel>>(
      `/organizations/${slug}/education-levels/${educationLevelId}/grade-levels/${gradeLevelId}`,
      body,
    );
  }

  delete(slug: string, educationLevelId: string, gradeLevelId: string) {
    return this.api.delete<void>(
      `/organizations/${slug}/education-levels/${educationLevelId}/grade-levels/${gradeLevelId}`,
    );
  }
}
