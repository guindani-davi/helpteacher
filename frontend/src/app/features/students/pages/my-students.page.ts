import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { PaginatedResponse, Student } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { StudentUserService } from '../services/student-user.service';

@Component({
  selector: 'app-my-students-page',
  imports: [PageHeader, Pagination, EmptyState],
  template: `
    <app-page-header title="Meus Alunos" subtitle="Alunos vinculados à sua conta" />

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (students().length === 0) {
      <app-empty-state
        title="Nenhum aluno vinculado"
        description="Você não tem nenhum aluno vinculado à sua conta nesta organização."
        icon="👨‍👩‍👧‍👦"
      />
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (student of students(); track student.id) {
          <div
            class="card bg-base-100 shadow-sm border border-base-300 cursor-pointer hover:shadow-md transition-shadow"
            (click)="goToProgress(student.id)"
          >
            <div class="card-body items-center text-center">
              <div class="text-primary mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 class="card-title text-base">{{ student.name }} {{ student.surname }}</h3>
              <button
                class="btn btn-primary btn-block mt-4"
                (click)="goToProgress(student.id); $event.stopPropagation()"
              >
                Ver Progresso →
              </button>
            </div>
          </div>
        }
      </div>

      @if (totalPages() > 1) {
        <div class="mt-6">
          <app-pagination
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChanged)="onPageChange($event)"
          />
        </div>
      }
    }
  `,
})
export default class MyStudentsPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly studentUserService = inject(StudentUserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly students = signal<Student[]>([]);
  protected readonly loading = signal(true);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);

  private readonly limit = 20;

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);

    this.studentUserService.getMyStudents(slug, this.currentPage(), this.limit).subscribe({
      next: (res: PaginatedResponse<Student>) => {
        this.students.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Falha ao carregar alunos');
        this.loading.set(false);
      },
    });
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadStudents();
  }

  protected goToProgress(studentId: string): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'my-students', studentId]);
  }
}
