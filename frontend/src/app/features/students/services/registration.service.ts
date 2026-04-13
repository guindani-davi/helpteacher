import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  CreateRegistrationBody,
  PaginatedResponse,
  Registration,
  UpdateRegistrationBody,
} from '@help-teacher/shared';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly api = inject(ApiService);

  list(slug: string, page = 1, limit = 20) {
    return this.api.get<PaginatedResponse<Registration>>(`/organizations/${slug}/registrations`, {
      page,
      limit,
    });
  }

  getById(slug: string, registrationId: string) {
    return this.api.get<ApiResponse<Registration>>(
      `/organizations/${slug}/registrations/${registrationId}`,
    );
  }

  create(slug: string, body: CreateRegistrationBody) {
    return this.api.post<ApiResponse<Registration>>(`/organizations/${slug}/registrations`, body);
  }

  update(slug: string, registrationId: string, body: UpdateRegistrationBody) {
    return this.api.patch<ApiResponse<Registration>>(
      `/organizations/${slug}/registrations/${registrationId}`,
      body,
    );
  }

  delete(slug: string, registrationId: string) {
    return this.api.delete<void>(`/organizations/${slug}/registrations/${registrationId}`);
  }
}
