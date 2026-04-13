import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  Class,
  ClassDetail,
  CreateClassBody,
  PaginatedResponse,
  UpdateClassBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ClassService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.get<PaginatedResponse<Class>>(`/organizations/${slug}/classes`, {
      page,
      limit,
    });
  }

  getById(slug: string, classId: string) {
    return this.api.get<ApiResponse<Class>>(`/organizations/${slug}/classes/${classId}`);
  }

  getDetails(slug: string, classId: string) {
    return this.api.get<ApiResponse<ClassDetail>>(
      `/organizations/${slug}/classes/${classId}/details`,
    );
  }

  create(slug: string, body: CreateClassBody) {
    return this.api.post<ApiResponse<Class>>(`/organizations/${slug}/classes`, body);
  }

  update(slug: string, classId: string, body: UpdateClassBody) {
    return this.api.patch<ApiResponse<Class>>(`/organizations/${slug}/classes/${classId}`, body);
  }

  delete(slug: string, classId: string) {
    return this.api.delete<void>(`/organizations/${slug}/classes/${classId}`);
  }
}
