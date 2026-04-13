import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-create-edit-page',
  imports: [PageHeader, FormField],
  template: `
    <app-page-header
      [title]="isEditing() ? 'Edit Student' : 'New Student'"
      [subtitle]="isEditing() ? 'Update student information' : 'Create a new student'"
    />

    @if (loadingStudent()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else {
      <div class="max-w-2xl">
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <form (submit)="onSave($event)">
              <fieldset class="fieldset mb-4">
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
              <fieldset class="fieldset mb-4">
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
              <div class="flex justify-end gap-2 mt-6">
                <button type="button" class="btn" (click)="goBack()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  {{ isEditing() ? 'Save Changes' : 'Create Student' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export default class StudentCreateEditPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly studentService = inject(StudentService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isEditing = signal(false);
  protected readonly loadingStudent = signal(false);
  protected readonly saving = signal(false);
  private studentId = '';

  protected readonly studentModel = signal({ name: '', surname: '' });
  protected readonly studentForm = form(this.studentModel, (s) => {
    required(s.name, { message: 'Name is required' });
    required(s.surname, { message: 'Surname is required' });
  });

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId') ?? '';
    if (this.studentId) {
      this.isEditing.set(true);
      this.loadStudent();
    }
  }

  private loadStudent(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.studentId) return;
    this.loadingStudent.set(true);

    this.studentService.getById(slug, this.studentId).subscribe({
      next: (res) => {
        this.studentModel.set({ name: res.data.name, surname: res.data.surname });
        this.loadingStudent.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load student');
        this.loadingStudent.set(false);
        this.goBack();
      },
    });
  }

  protected onSave(event: Event): void {
    event.preventDefault();
    submit(this.studentForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.saving.set(true);

      try {
        const { name, surname } = this.studentModel();
        const body = { name: name.trim(), surname: surname.trim() };

        await new Promise<void>((resolve, reject) => {
          const obs = this.isEditing()
            ? this.studentService.update(slug, this.studentId, body)
            : this.studentService.create(slug, body);
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.toastService.success(this.isEditing() ? 'Student updated!' : 'Student created!');

        if (this.isEditing()) {
          this.router.navigate(['/orgs', slug, 'students', this.studentId]);
        } else {
          this.router.navigate(['/orgs', slug, 'students']);
        }
      } catch {
        this.toastService.error('Failed to save student');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected goBack(): void {
    const slug = this.orgContext.org()?.slug;
    if (this.isEditing() && this.studentId) {
      this.router.navigate(['/orgs', slug, 'students', this.studentId]);
    } else {
      this.router.navigate(['/orgs', slug, 'students']);
    }
  }
}
