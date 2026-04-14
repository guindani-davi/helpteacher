import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { StudentReport } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-student-report-page',
  imports: [PageHeader, DatePipe],
  template: `
    <app-page-header title="Student Report" subtitle="Visual report overview">
      <div class="flex gap-2">
        <button class="btn" (click)="goBack()">← Back</button>
        @if (report()) {
          <button class="btn btn-primary" [disabled]="downloading()" (click)="downloadPdf()">
            @if (downloading()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            📥 Download PDF
          </button>
        }
      </div>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (report(); as r) {
      <div class="space-y-6">
        <!-- Organization Header -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body flex-row items-center gap-4">
            @if (r.organization.logoUrl) {
              <img
                [src]="r.organization.logoUrl"
                [alt]="r.organization.name"
                class="h-12 w-12 rounded-lg object-cover"
              />
            }
            <div>
              <h2 class="card-title text-lg">{{ r.organization.name }}</h2>
              <p class="text-sm text-base-content/60">Student Report</p>
            </div>
          </div>
        </div>

        <!-- Student Info -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Student</h2>
            <p class="text-lg font-semibold mt-1">{{ r.student.name }} {{ r.student.surname }}</p>
          </div>
        </div>

        <!-- Registration -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Registration</h2>
            @if (r.registration; as reg) {
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <p class="text-sm text-base-content/60">Education Level</p>
                  <p class="font-medium">{{ reg.educationLevelName }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Grade Level</p>
                  <p class="font-medium">{{ reg.gradeLevelName }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">School</p>
                  <p class="font-medium">{{ reg.schoolName }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Start Date</p>
                  <p class="font-medium">{{ reg.startDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">End Date</p>
                  <p class="font-medium">{{ reg.endDate ?? 'Ongoing' }}</p>
                </div>
              </div>
            } @else {
              <p class="text-base-content/60 mt-2">No active registration.</p>
            }
          </div>
        </div>

        <!-- Classes -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">
              Classes
              @if (r.classes.length > 0) {
                <span class="badge badge-sm">{{ r.classes.length }}</span>
              }
            </h2>
            @if (r.classes.length === 0) {
              <p class="text-base-content/60 mt-2">No classes recorded.</p>
            } @else {
              <div class="overflow-x-auto mt-2">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Teacher</th>
                      <th>Subjects</th>
                      <th>Topics</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cls of r.classes; track cls.id) {
                      <tr>
                        <td>{{ cls.date }}</td>
                        <td>{{ cls.dayOfWeek }}</td>
                        <td>{{ cls.startTime }}–{{ cls.endTime }}</td>
                        <td>{{ cls.teacherName }}</td>
                        <td>
                          @for (topic of cls.topics; track topic.id; let i = $index) {
                            @if (i === 0 || cls.topics[i - 1].subjectName !== topic.subjectName) {
                              <span class="badge badge-sm badge-primary badge-outline mr-1">
                                {{ topic.subjectName }}
                              </span>
                            }
                          }
                        </td>
                        <td>
                          @for (topic of cls.topics; track topic.id) {
                            <span class="badge badge-sm badge-outline mr-1">
                              {{ topic.name }}
                            </span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-sm text-base-content/50 py-4">
          Generated on {{ today | date: 'mediumDate' }}
        </div>
      </div>
    } @else {
      <div class="flex justify-center py-16">
        <p class="text-base-content/60">Failed to load report.</p>
      </div>
    }
  `,
})
export default class StudentReportPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly reportService = inject(ReportService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly report = signal<StudentReport | null>(null);
  protected readonly loading = signal(true);
  protected readonly downloading = signal(false);
  protected readonly today = new Date();

  private studentId = '';

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId') ?? '';
    this.loadReport();
  }

  private loadReport(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.studentId) return;
    this.loading.set(true);

    this.reportService.getStudentReport(slug, this.studentId).subscribe({
      next: (res) => {
        this.report.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load student report');
        this.loading.set(false);
      },
    });
  }

  protected downloadPdf(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.studentId) return;
    this.downloading.set(true);

    this.reportService.downloadStudentReportPdf(slug, this.studentId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-report-${this.studentId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to download PDF');
        this.downloading.set(false);
      },
    });
  }

  protected goBack(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'students', this.studentId]);
  }
}
