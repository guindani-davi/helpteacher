import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import type { PaginatedResponse, Subject } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { SubjectService } from '../services/subject.service';

@Component({
  selector: 'app-subject-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Subjects" subtitle="Manage your subjects and their topics">
      <button class="btn btn-primary btn-sm" (click)="openCreateModal()">+ Add Subject</button>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (subjects().length === 0) {
      <app-empty-state
        icon="📚"
        title="No subjects yet"
        description="Create your first subject to start organizing topics."
      >
        <button class="btn btn-primary" (click)="openCreateModal()">Add Subject</button>
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (subject of subjects(); track subject.id) {
                <tr>
                  <td>
                    <button class="link link-hover font-medium" (click)="navigateToTopics(subject)">
                      {{ subject.name }}
                    </button>
                  </td>
                  <td class="text-right">
                    <button class="btn btn-ghost btn-xs" (click)="openEditModal(subject)">
                      Edit
                    </button>
                    <button
                      class="btn btn-ghost btn-xs text-error"
                      (click)="confirmDelete(subject)"
                    >
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
          (pageChanged)="loadSubjects($event)"
        />
      </div>
    }

    <!-- Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingSubject() ? 'Edit Subject' : 'Add Subject' }}
        </h3>
        <form (submit)="onSubmit($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Subject name"
              [formField]="subjectForm.name"
            />
            @if (subjectForm.name().touched() && subjectForm.name().invalid()) {
              <p class="label text-error">
                @for (err of subjectForm.name().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>
          <div class="modal-action">
            <button type="button" class="btn" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingSubject() ? 'Save' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeModal()">close</button>
      </form>
    </dialog>

    <app-confirm-dialog
      [open]="showDeleteConfirm()"
      title="Delete Subject"
      [message]="
        'Delete subject &quot;' + (deleteTarget()?.name ?? '') + '&quot;? This cannot be undone.'
      "
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteSubject()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class SubjectListPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly subjectService = inject(SubjectService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly subjects = signal<Subject[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showModal = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly editingSubject = signal<Subject | null>(null);
  protected readonly deleteTarget = signal<Subject | null>(null);

  protected readonly subjectModel = signal({ name: '' });
  protected readonly subjectForm = form(this.subjectModel, (s) => {
    required(s.name, { message: 'Name is required' });
  });

  ngOnInit(): void {
    this.loadSubjects(1);
  }

  loadSubjects(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.subjectService.list(slug, page).subscribe({
      next: (res: PaginatedResponse<Subject>) => {
        this.subjects.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load subjects');
      },
    });
  }

  protected openCreateModal(): void {
    this.editingSubject.set(null);
    this.subjectModel.set({ name: '' });
    this.showModal.set(true);
  }

  protected openEditModal(subject: Subject): void {
    this.editingSubject.set(subject);
    this.subjectModel.set({ name: subject.name });
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingSubject.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.subjectForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.saving.set(true);

      try {
        const { name } = this.subjectModel();
        const editing = this.editingSubject();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.subjectService.update(slug, editing.id, { name: name.trim() })
            : this.subjectService.create(slug, { name: name.trim() });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeModal();
        this.toastService.success(editing ? 'Subject updated!' : 'Subject created!');
        this.loadSubjects(this.currentPage());
      } catch {
        this.toastService.error('Failed to save subject');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected navigateToTopics(subject: Subject): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'subjects', subject.id, 'topics']);
  }

  protected confirmDelete(subject: Subject): void {
    this.deleteTarget.set(subject);
    this.showDeleteConfirm.set(true);
  }

  protected deleteSubject(): void {
    const subject = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!subject || !slug) return;
    this.showDeleteConfirm.set(false);

    this.subjectService.delete(slug, subject.id).subscribe({
      next: () => {
        this.toastService.success('Subject deleted');
        this.loadSubjects(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete subject'),
    });
  }
}
