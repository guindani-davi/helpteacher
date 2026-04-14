import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import type { PaginatedResponse, Student } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Students" subtitle="Manage your students">
      @if (orgContext.isAdmin()) {
        <button class="btn btn-primary" (click)="openCreateModal()">+ Add Student</button>
      }
    </app-page-header>

    <!-- Search -->
    <div class="mb-4">
      <input
        type="text"
        class="input input-bordered w-full max-w-xs"
        placeholder="Search students…"
        [value]="searchQuery()"
        (input)="onSearch($event)"
      />
    </div>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (filteredStudents().length === 0) {
      <app-empty-state
        icon="🎓"
        title="No students yet"
        description="Create your first student to get started."
      >
        @if (orgContext.isAdmin()) {
          <button class="btn btn-primary" (click)="openCreateModal()">Add Student</button>
        }
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Surname</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (student of filteredStudents(); track student.id) {
                <tr>
                  <td class="font-medium">{{ student.name }}</td>
                  <td>{{ student.surname }}</td>
                  <td class="text-right">
                    <button class="btn btn-ghost" (click)="goToDetail(student)">View</button>
                    @if (orgContext.isAdmin()) {
                      <button class="btn btn-ghost" (click)="openEditModal(student)">Edit</button>
                      <button class="btn btn-ghost text-error" (click)="confirmDelete(student)">
                        Delete
                      </button>
                    }
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
          (pageChanged)="loadStudents($event)"
        />
      </div>
    }

    <!-- Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingStudent() ? 'Edit Student' : 'Add Student' }}
        </h3>
        <form (submit)="onSubmit($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="First name"
              [formField]="studentForm.name"
            />
            @if (studentForm.name().touched() && studentForm.name().invalid()) {
              <p class="label text-error">
                @for (err of studentForm.name().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Surname</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Last name"
              [formField]="studentForm.surname"
            />
            @if (studentForm.surname().touched() && studentForm.surname().invalid()) {
              <p class="label text-error">
                @for (err of studentForm.surname().errors(); track err.kind) {
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
              {{ editingStudent() ? 'Save' : 'Create' }}
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
      title="Delete Student"
      [message]="
        'Delete student &quot;' +
        (deleteTarget()?.name ?? '') +
        ' ' +
        (deleteTarget()?.surname ?? '') +
        '&quot;? This cannot be undone.'
      "
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteStudent()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class StudentListPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly studentService = inject(StudentService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly students = signal<Student[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showModal = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly editingStudent = signal<Student | null>(null);
  protected readonly deleteTarget = signal<Student | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly studentModel = signal({ name: '', surname: '' });
  protected readonly studentForm = form(this.studentModel, (s) => {
    required(s.name, { message: 'Name is required' });
    required(s.surname, { message: 'Surname is required' });
  });

  protected filteredStudents = signal<Student[]>([]);

  ngOnInit(): void {
    this.loadStudents(1);
  }

  loadStudents(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.studentService.list(slug, page).subscribe({
      next: (res: PaginatedResponse<Student>) => {
        this.students.set(res.items);
        this.applyFilter();
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load students');
      },
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.applyFilter();
  }

  private applyFilter(): void {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredStudents.set(this.students());
      return;
    }
    this.filteredStudents.set(
      this.students().filter(
        (s) => s.name.toLowerCase().includes(query) || s.surname.toLowerCase().includes(query),
      ),
    );
  }

  protected goToDetail(student: Student): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'students', student.id]);
  }

  protected openCreateModal(): void {
    this.editingStudent.set(null);
    this.studentModel.set({ name: '', surname: '' });
    this.showModal.set(true);
  }

  protected openEditModal(student: Student): void {
    this.editingStudent.set(student);
    this.studentModel.set({ name: student.name, surname: student.surname });
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingStudent.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.studentForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.saving.set(true);

      try {
        const { name, surname } = this.studentModel();
        const editing = this.editingStudent();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.studentService.update(slug, editing.id, {
                name: name.trim(),
                surname: surname.trim(),
              })
            : this.studentService.create(slug, {
                name: name.trim(),
                surname: surname.trim(),
              });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeModal();
        this.toastService.success(editing ? 'Student updated!' : 'Student created!');
        this.loadStudents(this.currentPage());
      } catch {
        this.toastService.error('Failed to save student');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected confirmDelete(student: Student): void {
    this.deleteTarget.set(student);
    this.showDeleteConfirm.set(true);
  }

  protected deleteStudent(): void {
    const student = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!student || !slug) return;
    this.showDeleteConfirm.set(false);

    this.studentService.delete(slug, student.id).subscribe({
      next: () => {
        this.toastService.success('Student deleted');
        this.loadStudents(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete student'),
    });
  }
}
