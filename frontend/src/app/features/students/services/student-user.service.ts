import { inject, Injectable } from '@angular/core';
import type { ApiResponse, Student, StudentUserWithUser } from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class StudentUserService {
  private readonly api = inject(ApiService);

  getMyStudents(slug: string, page = 1, limit = 20) {
    return this.api.getPaginated<Student>(`/organizations/${slug}/my-students`, {
      page,
      limit,
    });
  }

  listLinked(slug: string, studentId: string) {
    return this.api.get<ApiResponse<StudentUserWithUser[]>>(
      `/organizations/${slug}/students/${studentId}/users`,
    );
  }

  link(slug: string, studentId: string, userId: string) {
    return this.api.post<ApiResponse<unknown>>(
      `/organizations/${slug}/students/${studentId}/users`,
      { userId },
    );
  }

  unlink(slug: string, studentId: string, studentUserId: string) {
    return this.api.delete<void>(
      `/organizations/${slug}/students/${studentId}/users/${studentUserId}`,
    );
  }
}
