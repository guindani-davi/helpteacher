import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  CreateTopicBody,
  PaginatedResponse,
  Topic,
  UpdateTopicBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.get<PaginatedResponse<Topic>>(`/organizations/${slug}/topics`, {
      page,
      limit,
    });
  }

  listBySubject(slug: string, subjectId: string, page = 1, limit = 20) {
    return this.api.get<PaginatedResponse<Topic>>(`/organizations/${slug}/topics`, {
      page,
      limit,
      subjectId,
    } as Record<string, string | number | boolean>);
  }

  getById(slug: string, topicId: string) {
    return this.api.get<ApiResponse<Topic>>(`/organizations/${slug}/topics/${topicId}`);
  }

  create(slug: string, body: CreateTopicBody) {
    return this.api.post<ApiResponse<Topic>>(`/organizations/${slug}/topics`, body);
  }

  update(slug: string, topicId: string, body: UpdateTopicBody) {
    return this.api.patch<ApiResponse<Topic>>(`/organizations/${slug}/topics/${topicId}`, body);
  }

  delete(slug: string, topicId: string) {
    return this.api.delete<void>(`/organizations/${slug}/topics/${topicId}`);
  }
}
