import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import type { PaginatedResponse, School } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { SchoolService } from '../services/school.service';

@Component({
  selector: 'app-school-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Schools" subtitle="Manage your schools">
      <button class="btn btn-primary btn-sm" (click)="openCreateModal()">+ Add School</button>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (schools().length === 0) {
      <app-empty-state
        icon="🏫"
        title="No schools yet"
        description="Create your first school to get started."
      >
        <button class="btn btn-primary" (click)="openCreateModal()">Add School</button>
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
              @for (school of schools(); track school.id) {
                <tr>
                  <td class="font-medium">{{ school.name }}</td>
                  <td class="text-right">
                    <button class="btn btn-ghost btn-xs" (click)="openEditModal(school)">
                      Edit
                    </button>
                    <button class="btn btn-ghost btn-xs text-error" (click)="confirmDelete(school)">
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
          (pageChanged)="loadSchools($event)"
        />
      </div>
    }

    <!-- Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ editingSchool() ? 'Edit School' : 'Add School' }}</h3>
        <form (submit)="onSubmit($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="School name"
              [formField]="schoolForm.name"
            />
            @if (schoolForm.name().touched() && schoolForm.name().invalid()) {
              <p class="label text-error">
                @for (err of schoolForm.name().errors(); track err.kind) {
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
              {{ editingSchool() ? 'Save' : 'Create' }}
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
      title="Delete School"
      [message]="
        'Delete school &quot;' + (deleteTarget()?.name ?? '') + '&quot;? This cannot be undone.'
      "
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteSchool()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class SchoolListPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly schoolService = inject(SchoolService);
  private readonly toastService = inject(ToastService);

  protected readonly schools = signal<School[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showModal = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly editingSchool = signal<School | null>(null);
  protected readonly deleteTarget = signal<School | null>(null);

  protected readonly schoolModel = signal({ name: '' });
  protected readonly schoolForm = form(this.schoolModel, (s) => {
    required(s.name, { message: 'Name is required' });
  });

  ngOnInit(): void {
    this.loadSchools(1);
  }

  loadSchools(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.schoolService.list(slug, page).subscribe({
      next: (res: PaginatedResponse<School>) => {
        this.schools.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load schools');
      },
    });
  }

  protected openCreateModal(): void {
    this.editingSchool.set(null);
    this.schoolModel.set({ name: '' });
    this.showModal.set(true);
  }

  protected openEditModal(school: School): void {
    this.editingSchool.set(school);
    this.schoolModel.set({ name: school.name });
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingSchool.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.schoolForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.saving.set(true);

      try {
        const { name } = this.schoolModel();
        const editing = this.editingSchool();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.schoolService.update(slug, editing.id, { name: name.trim() })
            : this.schoolService.create(slug, { name: name.trim() });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeModal();
        this.toastService.success(editing ? 'School updated!' : 'School created!');
        this.loadSchools(this.currentPage());
      } catch {
        this.toastService.error('Failed to save school');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected confirmDelete(school: School): void {
    this.deleteTarget.set(school);
    this.showDeleteConfirm.set(true);
  }

  protected deleteSchool(): void {
    const school = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!school || !slug) return;
    this.showDeleteConfirm.set(false);

    this.schoolService.delete(slug, school.id).subscribe({
      next: () => {
        this.toastService.success('School deleted');
        this.loadSchools(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete school'),
    });
  }
}
