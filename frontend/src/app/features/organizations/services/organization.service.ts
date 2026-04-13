import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  CreateOrganizationBody,
  Organization,
  UpdateOrganizationBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly api = inject(ApiService);

  getBySlug(slug: string) {
    return this.api.get<ApiResponse<Organization>>(`/organizations/${slug}`);
  }

  create(body: CreateOrganizationBody) {
    return this.api.post<ApiResponse<Organization>>('/organizations', body);
  }

  update(slug: string, body: UpdateOrganizationBody) {
    return this.api.patch<ApiResponse<Organization>>(`/organizations/${slug}`, body);
  }

  delete(slug: string) {
    return this.api.delete<void>(`/organizations/${slug}`);
  }
}
