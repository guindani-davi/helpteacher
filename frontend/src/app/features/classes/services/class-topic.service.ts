import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  ClassTopic,
  ClassTopicDetail,
  CreateClassTopicBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ClassTopicService {
  private readonly api = inject(ApiService);

  getByClassId(slug: string, classId: string) {
    return this.api.get<ApiResponse<ClassTopicDetail[]>>(
      `/organizations/${slug}/classes/${classId}/topics`,
    );
  }

  add(slug: string, classId: string, body: CreateClassTopicBody) {
    return this.api.post<ApiResponse<ClassTopic>>(
      `/organizations/${slug}/classes/${classId}/topics`,
      body,
    );
  }

  remove(slug: string, classId: string, classTopicId: string) {
    return this.api.delete<void>(
      `/organizations/${slug}/classes/${classId}/topics/${classTopicId}`,
    );
  }
}
