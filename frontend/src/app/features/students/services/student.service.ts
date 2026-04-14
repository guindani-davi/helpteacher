import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  ClassDetail,
  CreateStudentBody,
  Student,
  StudentDetail,
  UpdateStudentBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.getPaginated<Student>(`/organizations/${slug}/students`, {
      page,
      limit,
    });
  }

  getById(slug: string, studentId: string) {
    return this.api.get<ApiResponse<Student>>(`/organizations/${slug}/students/${studentId}`);
  }

  getDetails(slug: string, studentId: string) {
    return this.api.get<ApiResponse<StudentDetail>>(
      `/organizations/${slug}/students/${studentId}/details`,
    );
  }

  getClasses(slug: string, studentId: string, page = 1, limit = 20) {
    return this.api.getPaginated<ClassDetail>(
      `/organizations/${slug}/students/${studentId}/classes`,
      { page, limit },
    );
  }

  create(slug: string, body: CreateStudentBody) {
    return this.api.post<ApiResponse<Student>>(`/organizations/${slug}/students`, body);
  }

  update(slug: string, studentId: string, body: UpdateStudentBody) {
    return this.api.patch<ApiResponse<Student>>(
      `/organizations/${slug}/students/${studentId}`,
      body,
    );
  }

  delete(slug: string, studentId: string) {
    return this.api.delete<void>(`/organizations/${slug}/students/${studentId}`);
  }
}
