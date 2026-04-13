import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  CreateSubjectBody,
  PaginatedResponse,
  Subject,
  UpdateSubjectBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.get<PaginatedResponse<Subject>>(`/organizations/${slug}/subjects`, {
      page,
      limit,
    });
  }

  getById(slug: string, subjectId: string) {
    return this.api.get<ApiResponse<Subject>>(`/organizations/${slug}/subjects/${subjectId}`);
  }

  create(slug: string, body: CreateSubjectBody) {
    return this.api.post<ApiResponse<Subject>>(`/organizations/${slug}/subjects`, body);
  }

  update(slug: string, subjectId: string, body: UpdateSubjectBody) {
    return this.api.patch<ApiResponse<Subject>>(
      `/organizations/${slug}/subjects/${subjectId}`,
      body,
    );
  }

  delete(slug: string, subjectId: string) {
    return this.api.delete<void>(`/organizations/${slug}/subjects/${subjectId}`);
  }
}
