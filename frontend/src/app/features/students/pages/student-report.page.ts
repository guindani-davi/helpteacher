import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { StudentReport } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { ReportService } from '../services/report.service';

const DAY_LABELS: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

@Component({
  selector: 'app-student-report-page',
  imports: [PageHeader, DatePipe],
  template: `
    <app-page-header title="Relatório do Aluno" subtitle="Visão geral do relatório">
      <div class="flex gap-2">
        <button class="btn" (click)="goBack()">← Voltar</button>
        @if (report()) {
          <button class="btn btn-primary" [disabled]="downloading()" (click)="downloadPdf()">
            @if (downloading()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            📥 Baixar PDF
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
              <p class="text-sm text-base-content/60">Relatório do Aluno</p>
            </div>
          </div>
        </div>

        <!-- Student Info -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Aluno</h2>
            <p class="text-lg font-semibold mt-1">{{ r.student.name }} {{ r.student.surname }}</p>
          </div>
        </div>

        <!-- Registration -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Matrícula</h2>
            @if (r.registration; as reg) {
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <p class="text-sm text-base-content/60">Nível de Ensino</p>
                  <p class="font-medium">{{ reg.educationLevelName }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Série</p>
                  <p class="font-medium">{{ reg.gradeLevelName }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Escola</p>
                  <p class="font-medium">{{ reg.schoolName }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Data de Início</p>
                  <p class="font-medium">{{ reg.startDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Data de Término</p>
                  <p class="font-medium">{{ reg.endDate ?? 'Em andamento' }}</p>
                </div>
              </div>
            } @else {
              <p class="text-base-content/60 mt-2">Nenhuma matrícula ativa.</p>
            }
          </div>
        </div>

        <!-- Classes -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">
              Aulas
              @if (r.classes.length > 0) {
                <span class="badge badge-primary">{{ r.classes.length }}</span>
              }
            </h2>
            @if (r.classes.length === 0) {
              <p class="text-base-content/60 mt-2">Nenhuma aula registrada.</p>
            } @else {
              <div class="overflow-x-auto mt-2">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Dia</th>
                      <th>Horário</th>
                      <th>Professor</th>
                      <th>Disciplinas</th>
                      <th>Tópicos</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cls of r.classes; track cls.id) {
                      <tr>
                        <td>{{ cls.date }}</td>
                        <td>{{ translateDay(cls.dayOfWeek) }}</td>
                        <td>{{ cls.startTime }}–{{ cls.endTime }}</td>
                        <td>{{ cls.teacherName }}</td>
                        <td>
                          @for (topic of cls.topics; track topic.id; let i = $index) {
                            @if (i === 0 || cls.topics[i - 1].subjectName !== topic.subjectName) {
                              <span class="badge badge-primary badge-outline mr-1">
                                {{ topic.subjectName }}
                              </span>
                            }
                          }
                        </td>
                        <td>
                          @for (topic of cls.topics; track topic.id) {
                            <span class="badge badge-primary badge-outline mr-1">
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
          Gerado em {{ today | date: 'mediumDate' }}
        </div>
      </div>
    } @else {
      <div class="flex justify-center py-16">
        <p class="text-base-content/60">Falha ao carregar relatório.</p>
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

  protected translateDay(day: string): string {
    return DAY_LABELS[day.toLowerCase()] ?? day;
  }

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
        this.toastService.error('Falha ao carregar relatório do aluno');
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
        this.toastService.error('Falha ao baixar PDF');
        this.downloading.set(false);
      },
    });
  }

  protected goBack(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    if (this.orgContext.isOnlyResponsible()) {
      this.router.navigate(['/orgs', slug, 'my-students', this.studentId]);
    } else {
      this.router.navigate(['/orgs', slug, 'students', this.studentId]);
    }
  }
}
