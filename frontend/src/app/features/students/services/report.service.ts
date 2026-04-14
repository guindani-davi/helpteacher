import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ApiResponse, StudentReport } from '@help-teacher/shared';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  getStudentReport(slug: string, studentId: string) {
    return this.api.get<ApiResponse<StudentReport>>(
      `/organizations/${slug}/reports/students/${studentId}`,
    );
  }

  downloadStudentReportPdf(slug: string, studentId: string) {
    return this.http.get(
      `${environment.apiUrl}/organizations/${slug}/reports/students/${studentId}/pdf`,
      { responseType: 'blob' },
    );
  }
}
