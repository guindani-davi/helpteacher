import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Class, PaginatedResponse } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { ClassService } from '../services/class.service';

@Component({
  selector: 'app-class-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState],
  template: `
    <app-page-header title="Classes" subtitle="Manage your classes">
      <button class="btn btn-primary btn-sm" (click)="navigateToCreate()">+ New Class</button>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (classes().length === 0) {
      <app-empty-state
        icon="🏫"
        title="No classes yet"
        description="Create your first class to start tracking lessons."
      >
        <button class="btn btn-primary" (click)="navigateToCreate()">New Class</button>
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student ID</th>
                <th>Teacher ID</th>
                <th>Schedule ID</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cls of classes(); track cls.id) {
                <tr>
                  <td class="font-medium">{{ cls.date }}</td>
                  <td class="font-mono text-sm text-base-content/70">
                    {{ cls.studentId.slice(0, 8) }}…
                  </td>
                  <td class="font-mono text-sm text-base-content/70">
                    {{ cls.teacherId.slice(0, 8) }}…
                  </td>
                  <td class="font-mono text-sm text-base-content/70">
                    {{ cls.scheduleId.slice(0, 8) }}…
                  </td>
                  <td class="text-right">
                    <button class="btn btn-ghost btn-xs" (click)="viewDetails(cls)">View</button>
                    <button class="btn btn-ghost btn-xs" (click)="navigateToEdit(cls)">Edit</button>
                    <button class="btn btn-ghost btn-xs text-error" (click)="confirmDelete(cls)">
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex justify-center mt-4">
        <app-pagination
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (pageChanged)="loadClasses($event)"
        />
      </div>
    }

    <app-confirm-dialog
      [open]="showDeleteConfirm()"
      title="Delete Class"
      [message]="'Delete class on ' + (deleteTarget()?.date ?? '') + '? This cannot be undone.'"
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteClass()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class ClassListPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly classService = inject(ClassService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly classes = signal<Class[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly deleteTarget = signal<Class | null>(null);

  ngOnInit(): void {
    this.loadClasses(1);
  }

  loadClasses(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.classService.list(slug, page).subscribe({
      next: (res: PaginatedResponse<Class>) => {
        this.classes.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load classes');
      },
    });
  }

  protected navigateToCreate(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes', 'new']);
  }

  protected viewDetails(cls: Class): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes', cls.id]);
  }

  protected navigateToEdit(cls: Class): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes', cls.id, 'edit']);
  }

  protected confirmDelete(cls: Class): void {
    this.deleteTarget.set(cls);
    this.showDeleteConfirm.set(true);
  }

  protected deleteClass(): void {
    const cls = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!cls || !slug) return;
    this.showDeleteConfirm.set(false);

    this.classService.delete(slug, cls.id).subscribe({
      next: () => {
        this.toastService.success('Class deleted');
        this.loadClasses(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete class'),
    });
  }
}
