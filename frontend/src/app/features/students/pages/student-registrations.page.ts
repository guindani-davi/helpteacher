import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  EducationLevel,
  GradeLevel,
  PaginatedResponse,
  Registration,
  School,
} from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { EducationLevelService } from '../../education-levels/services/education-level.service';
import { GradeLevelService } from '../../education-levels/services/grade-level.service';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { SchoolService } from '../../schools/services/school.service';
import { RegistrationService } from '../services/registration.service';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-registrations-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header
      [title]="'Registrations — ' + studentName()"
      subtitle="Manage student registrations"
    >
      <div class="flex gap-2">
        <button class="btn" (click)="goBackToDetail()">← Back</button>
        <button class="btn btn-primary" (click)="openCreateModal()">
          + Add Registration
        </button>
      </div>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (registrations().length === 0) {
      <app-empty-state
        icon="📋"
        title="No registrations yet"
        description="Create a registration for this student."
      >
        <button class="btn btn-primary" (click)="openCreateModal()">Add Registration</button>
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>School</th>
                <th>Grade Level</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Active</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (reg of registrations(); track reg.id) {
                <tr>
                  <td>{{ reg.schoolId }}</td>
                  <td>{{ reg.gradeLevelId }}</td>
                  <td>{{ reg.startDate }}</td>
                  <td>{{ reg.endDate ?? 'Ongoing' }}</td>
                  <td>
                    @if (reg.isActive) {
                      <span class="badge badge-success badge-sm">Active</span>
                    } @else {
                      <span class="badge badge-sm">Inactive</span>
                    }
                  </td>
                  <td class="text-right">
                    <button class="btn btn-ghost" (click)="openEditModal(reg)">Edit</button>
                    <button class="btn btn-ghost text-error" (click)="confirmDelete(reg)">
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
          (pageChanged)="loadRegistrations($event)"
        />
      </div>
    }

    <!-- Create / Edit Registration modal -->
    <dialog class="modal" [class.modal-open]="showModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingReg() ? 'Edit Registration' : 'Add Registration' }}
        </h3>
        <form (submit)="onSubmit($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">School</legend>
            <select class="select select-bordered w-full" [formField]="regForm.schoolId">
              <option value="">Select a school</option>
              @for (school of schools(); track school.id) {
                <option [value]="school.id">{{ school.name }}</option>
              }
            </select>
            @if (regForm.schoolId().touched() && regForm.schoolId().invalid()) {
              <p class="label text-error">School is required</p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Education Level</legend>
            <select
              class="select select-bordered w-full"
              [value]="selectedEducationLevelId()"
              (change)="onEducationLevelChange($event)"
            >
              <option value="">Select an education level</option>
              @for (el of educationLevels(); track el.id) {
                <option [value]="el.id">{{ el.name }}</option>
              }
            </select>
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Grade Level</legend>
            <select class="select select-bordered w-full" [formField]="regForm.gradeLevelId">
              <option value="">Select a grade level</option>
              @for (gl of gradeLevels(); track gl.id) {
                <option [value]="gl.id">{{ gl.name }}</option>
              }
            </select>
            @if (regForm.gradeLevelId().touched() && regForm.gradeLevelId().invalid()) {
              <p class="label text-error">Grade level is required</p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Start Date</legend>
            <input
              type="date"
              class="input input-bordered w-full"
              [formField]="regForm.startDate"
            />
            @if (regForm.startDate().touched() && regForm.startDate().invalid()) {
              <p class="label text-error">Start date is required</p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">End Date (optional)</legend>
            <input type="date" class="input input-bordered w-full" [formField]="regForm.endDate" />
          </fieldset>
          <div class="modal-action">
            <button type="button" class="btn" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingReg() ? 'Save' : 'Create' }}
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
      title="Delete Registration"
      message="Delete this registration? This cannot be undone."
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteRegistration()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class StudentRegistrationsPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly studentService = inject(StudentService);
  private readonly registrationService = inject(RegistrationService);
  private readonly schoolService = inject(SchoolService);
  private readonly educationLevelService = inject(EducationLevelService);
  private readonly gradeLevelService = inject(GradeLevelService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly registrations = signal<Registration[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showModal = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly editingReg = signal<Registration | null>(null);
  protected readonly deleteTarget = signal<Registration | null>(null);
  protected readonly studentName = signal('');

  // Dropdown data
  protected readonly schools = signal<School[]>([]);
  protected readonly educationLevels = signal<EducationLevel[]>([]);
  protected readonly gradeLevels = signal<GradeLevel[]>([]);
  protected readonly selectedEducationLevelId = signal('');

  private studentId = '';

  protected readonly regModel = signal({
    schoolId: '',
    gradeLevelId: '',
    startDate: '',
    endDate: '',
  });
  protected readonly regForm = form(this.regModel, (s) => {
    required(s.schoolId, { message: 'School is required' });
    required(s.gradeLevelId, { message: 'Grade level is required' });
    required(s.startDate, { message: 'Start date is required' });
  });

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId') ?? '';
    this.loadStudentName();
    this.loadRegistrations(1);
  }

  private loadStudentName(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.studentId) return;

    this.studentService.getById(slug, this.studentId).subscribe({
      next: (res) => this.studentName.set(`${res.data.name} ${res.data.surname}`),
      error: () => {},
    });
  }

  loadRegistrations(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.registrationService.list(slug, page).subscribe({
      next: (res: PaginatedResponse<Registration>) => {
        // Filter registrations for this student on the client side
        this.registrations.set(res.items.filter((r) => r.studentId === this.studentId));
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load registrations');
      },
    });
  }

  private loadDropdownData(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.schoolService.list(slug, 1, 100).subscribe({
      next: (res: PaginatedResponse<School>) => this.schools.set(res.items),
      error: () => this.toastService.error('Failed to load schools'),
    });

    this.educationLevelService.list(slug, 1, 100).subscribe({
      next: (res: PaginatedResponse<EducationLevel>) => this.educationLevels.set(res.items),
      error: () => this.toastService.error('Failed to load education levels'),
    });
  }

  protected onEducationLevelChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedEducationLevelId.set(id);
    this.gradeLevels.set([]);
    this.regModel.update((m) => ({ ...m, gradeLevelId: '' }));

    if (!id) return;
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.gradeLevelService.list(slug, id, 1, 100).subscribe({
      next: (res: PaginatedResponse<GradeLevel>) => this.gradeLevels.set(res.items),
      error: () => this.toastService.error('Failed to load grade levels'),
    });
  }

  protected openCreateModal(): void {
    this.editingReg.set(null);
    this.regModel.set({ schoolId: '', gradeLevelId: '', startDate: '', endDate: '' });
    this.selectedEducationLevelId.set('');
    this.gradeLevels.set([]);
    this.showModal.set(true);
    this.loadDropdownData();
  }

  protected openEditModal(reg: Registration): void {
    this.editingReg.set(reg);
    this.regModel.set({
      schoolId: reg.schoolId,
      gradeLevelId: reg.gradeLevelId,
      startDate: reg.startDate,
      endDate: reg.endDate ?? '',
    });
    this.selectedEducationLevelId.set('');
    this.gradeLevels.set([]);
    this.showModal.set(true);
    this.loadDropdownData();
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingReg.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.regForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.saving.set(true);

      try {
        const { schoolId, gradeLevelId, startDate, endDate } = this.regModel();
        const editing = this.editingReg();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.registrationService.update(slug, editing.id, {
                schoolId,
                gradeLevelId,
                startDate,
                endDate: endDate || undefined,
              })
            : this.registrationService.create(slug, {
                studentId: this.studentId,
                schoolId,
                gradeLevelId,
                startDate,
                endDate: endDate || undefined,
              });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeModal();
        this.toastService.success(editing ? 'Registration updated!' : 'Registration created!');
        this.loadRegistrations(this.currentPage());
      } catch {
        this.toastService.error('Failed to save registration');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected confirmDelete(reg: Registration): void {
    this.deleteTarget.set(reg);
    this.showDeleteConfirm.set(true);
  }

  protected deleteRegistration(): void {
    const reg = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!reg || !slug) return;
    this.showDeleteConfirm.set(false);

    this.registrationService.delete(slug, reg.id).subscribe({
      next: () => {
        this.toastService.success('Registration deleted');
        this.loadRegistrations(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete registration'),
    });
  }

  protected goBackToDetail(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'students', this.studentId]);
  }
}
