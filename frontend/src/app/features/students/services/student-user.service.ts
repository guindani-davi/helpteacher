import { inject, Injectable } from '@angular/core';
import type { Student } from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class StudentUserService {
  private readonly api = inject(ApiService);

  getMyStudents(slug: string, page = 1, limit = 20) {
    return this.api.getPaginated<Student>(`/organizations/${slug}/students/my-students`, {
      page,
      limit,
    });
  }
}
