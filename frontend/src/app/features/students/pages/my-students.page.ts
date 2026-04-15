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
    <app-page-header title="My Students" subtitle="Students linked to your account" />

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (students().length === 0) {
      <app-empty-state
        title="No students linked"
        description="You don't have any students linked to your account in this organization."
        icon="👨‍👩‍👧‍👦"
      />
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (student of students(); track student.id) {
          <div
            class="card bg-base-100 shadow-sm border border-base-300 cursor-pointer hover:shadow-md transition-shadow"
            (click)="goToProgress(student.id)"
          >
            <div class="card-body">
              <h3 class="card-title text-base">{{ student.name }} {{ student.surname }}</h3>
              <div class="flex items-center gap-2 mt-1">
                @if (student.isActive) {
                  <span class="badge badge-success">Active</span>
                } @else {
                  <span class="badge badge-primary badge-outline">Inactive</span>
                }
              </div>
              <div class="card-actions justify-end mt-2">
                <button
                  class="btn btn-primary"
                  (click)="goToProgress(student.id); $event.stopPropagation()"
                >
                  View Progress →
                </button>
              </div>
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
        this.toastService.error('Failed to load students');
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
