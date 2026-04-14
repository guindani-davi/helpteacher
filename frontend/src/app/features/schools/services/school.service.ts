import { inject, Injectable } from '@angular/core';
import type { ApiResponse, CreateSchoolBody, School, UpdateSchoolBody } from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SchoolService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.getPaginated<School>(`/organizations/${slug}/schools`, {
      page,
      limit,
    });
  }

  getById(slug: string, schoolId: string) {
    return this.api.get<ApiResponse<School>>(`/organizations/${slug}/schools/${schoolId}`);
  }

  create(slug: string, body: CreateSchoolBody) {
    return this.api.post<ApiResponse<School>>(`/organizations/${slug}/schools`, body);
  }

  update(slug: string, schoolId: string, body: UpdateSchoolBody) {
    return this.api.patch<ApiResponse<School>>(`/organizations/${slug}/schools/${schoolId}`, body);
  }

  delete(slug: string, schoolId: string) {
    return this.api.delete<void>(`/organizations/${slug}/schools/${schoolId}`);
  }
}
