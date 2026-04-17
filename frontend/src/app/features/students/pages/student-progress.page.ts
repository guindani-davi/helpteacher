import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { StudentDetail } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-progress-page',
  imports: [PageHeader],
  template: `
    <app-page-header
      [title]="detail()?.student?.name + ' ' + detail()?.student?.surname"
      subtitle="Visão geral do progresso do aluno"
    >
      <div class="flex gap-2">
        <button class="btn" (click)="goBack()">← Voltar</button>
        @if (detail()) {
          <button class="btn btn-accent" (click)="goToReport()">📊 Ver Relatório</button>
        }
      </div>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (detail()) {
      <div class="space-y-6">
        <!-- Student Info Card -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Informações do Aluno</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <p class="text-sm text-base-content/60">Nome</p>
                <p class="font-medium">{{ detail()?.student?.name }}</p>
              </div>
              <div>
                <p class="text-sm text-base-content/60">Sobrenome</p>
                <p class="font-medium">{{ detail()?.student?.surname }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Registration -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Matrícula Atual</h2>
            @if (detail()?.currentRegistration; as reg) {
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <p class="text-sm text-base-content/60">Escola</p>
                  <p class="font-medium">{{ reg.school.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Série</p>
                  <p class="font-medium">{{ reg.gradeLevel.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Nível de Ensino</p>
                  <p class="font-medium">{{ reg.gradeLevel.educationLevel.name }}</p>
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

        <!-- Registration History -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Histórico de Matrículas</h2>
            @if (detail()!.registrations.length === 0) {
              <p class="text-base-content/60 mt-2">Nenhuma matrícula encontrada.</p>
            } @else {
              <div class="overflow-x-auto mt-2">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Escola</th>
                      <th>Série</th>
                      <th>Data de Início</th>
                      <th>Data de Término</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (reg of detail()!.registrations; track reg.id) {
                      <tr>
                        <td>{{ reg.school.name }}</td>
                        <td>
                          {{ reg.gradeLevel.name }} ({{ reg.gradeLevel.educationLevel.name }})
                        </td>
                        <td>{{ reg.startDate }}</td>
                        <td>{{ reg.endDate ?? 'Em andamento' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <!-- Recent Classes -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">
              Aulas
              @if (detail()!.totalClasses > 0) {
                <span class="badge badge-primary">{{ detail()!.totalClasses }}</span>
              }
            </h2>
            @if (detail()!.classes.length === 0) {
              <p class="text-base-content/60 mt-2">Nenhuma aula encontrada.</p>
            } @else {
              <div class="overflow-x-auto mt-2">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Professor</th>
                      <th>Tópicos</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cls of detail()!.classes; track cls.id) {
                      <tr>
                        <td>{{ cls.date }}</td>
                        <td>
                          {{ cls.schedule.dayOfWeek }} {{ cls.schedule.startTime }}–{{
                            cls.schedule.endTime
                          }}
                        </td>
                        <td>{{ cls.teacher.name }} {{ cls.teacher.surname }}</td>
                        <td>
                          @for (topic of cls.topics; track topic.id) {
                            <span class="badge badge-primary badge-outline mr-1">{{
                              topic.name
                            }}</span>
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
      </div>
    }
  `,
})
export default class StudentProgressPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly studentService = inject(StudentService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly detail = signal<StudentDetail | null>(null);
  protected readonly loading = signal(true);

  private studentId = '';

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId') ?? '';
    this.loadDetail();
  }

  private loadDetail(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.studentId) return;
    this.loading.set(true);

    this.studentService.getDetails(slug, this.studentId).subscribe({
      next: (res) => {
        this.detail.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Falha ao carregar detalhes do aluno');
        this.loading.set(false);
      },
    });
  }

  protected goToReport(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'my-students', this.studentId, 'report']);
  }

  protected goBack(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'my-students']);
  }
}
