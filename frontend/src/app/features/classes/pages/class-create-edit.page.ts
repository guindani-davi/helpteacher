import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import type { Membership, Schedule, Student } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared';
import { MembershipService } from '../../organizations/services/membership.service';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { ScheduleService } from '../../schedules/services/schedule.service';
import { StudentService } from '../../students/services/student.service';
import { ClassService } from '../services/class.service';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

@Component({
  selector: 'app-class-create-edit-page',
  imports: [PageHeader, FormField],
  template: `
    <app-page-header
      [title]="isEditing() ? 'Edit Class' : 'New Class'"
      [subtitle]="isEditing() ? 'Update class information' : 'Create a new class'"
    />

    @if (loadingData()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else {
      <div class="max-w-2xl">
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <form (submit)="onSave($event)">
              <fieldset class="fieldset mb-4">
                <legend class="fieldset-legend">Schedule</legend>
                <select class="select select-bordered w-full" [formField]="classForm.scheduleId">
                  <option value="">Select a schedule</option>
                  @for (schedule of schedules(); track schedule.id) {
                    <option [value]="schedule.id">
                      {{ capitalize(schedule.dayOfWeek) }} {{ schedule.startTime }}–{{
                        schedule.endTime
                      }}
                    </option>
                  }
                </select>
                @if (classForm.scheduleId().touched() && classForm.scheduleId().invalid()) {
                  <p class="label text-error">
                    @for (err of classForm.scheduleId().errors(); track err.kind) {
                      {{ err.message }}
                    }
                  </p>
                }
              </fieldset>
              <fieldset class="fieldset mb-4">
                <legend class="fieldset-legend">Student</legend>
                <select class="select select-bordered w-full" [formField]="classForm.studentId">
                  <option value="">Select a student</option>
                  @for (student of students(); track student.id) {
                    <option [value]="student.id">{{ student.name }} {{ student.surname }}</option>
                  }
                </select>
                @if (classForm.studentId().touched() && classForm.studentId().invalid()) {
                  <p class="label text-error">
                    @for (err of classForm.studentId().errors(); track err.kind) {
                      {{ err.message }}
                    }
                  </p>
                }
              </fieldset>
              <fieldset class="fieldset mb-4">
                <legend class="fieldset-legend">Teacher</legend>
                <select class="select select-bordered w-full" [formField]="classForm.teacherId">
                  <option value="">Select a teacher</option>
                  @for (member of members(); track member.id) {
                    <option [value]="member.userId">
                      {{ member.userId.slice(0, 8) }}… ({{ member.roles.join(', ') }})
                    </option>
                  }
                </select>
                @if (classForm.teacherId().touched() && classForm.teacherId().invalid()) {
                  <p class="label text-error">
                    @for (err of classForm.teacherId().errors(); track err.kind) {
                      {{ err.message }}
                    }
                  </p>
                }
              </fieldset>
              <fieldset class="fieldset mb-4">
                <legend class="fieldset-legend">Date</legend>
                <input
                  type="date"
                  class="input input-bordered w-full"
                  [formField]="classForm.date"
                />
                @if (classForm.date().touched() && classForm.date().invalid()) {
                  <p class="label text-error">
                    @for (err of classForm.date().errors(); track err.kind) {
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
                  {{ isEditing() ? 'Save Changes' : 'Create Class' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export default class ClassCreateEditPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly classService = inject(ClassService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly studentService = inject(StudentService);
  private readonly membershipService = inject(MembershipService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isEditing = signal(false);
  protected readonly loadingData = signal(true);
  protected readonly saving = signal(false);
  private classId = '';

  protected readonly schedules = signal<Schedule[]>([]);
  protected readonly students = signal<Student[]>([]);
  protected readonly members = signal<Membership[]>([]);

  protected readonly classModel = signal({
    scheduleId: '',
    studentId: '',
    teacherId: '',
    date: '',
  });
  protected readonly classForm = form(this.classModel, (s) => {
    required(s.scheduleId, { message: 'Schedule is required' });
    required(s.studentId, { message: 'Student is required' });
    required(s.teacherId, { message: 'Teacher is required' });
    required(s.date, { message: 'Date is required' });
  });

  protected capitalize = capitalize;

  ngOnInit(): void {
    this.classId = this.route.snapshot.paramMap.get('classId') ?? '';
    if (this.classId) {
      this.isEditing.set(true);
    }
    this.loadRelatedData();
  }

  private loadRelatedData(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    let loaded = 0;
    const total = this.isEditing() ? 4 : 3;

    const checkDone = () => {
      loaded++;
      if (loaded >= total) {
        this.loadingData.set(false);
      }
    };

    this.scheduleService.list(slug, 1, 100).subscribe({
      next: (res) => {
        this.schedules.set(res.items);
        checkDone();
      },
      error: () => {
        this.toastService.error('Failed to load schedules');
        checkDone();
      },
    });

    this.studentService.list(slug, 1, 100).subscribe({
      next: (res) => {
        this.students.set(res.items);
        checkDone();
      },
      error: () => {
        this.toastService.error('Failed to load students');
        checkDone();
      },
    });

    this.membershipService.listMembers(slug, 1, 100).subscribe({
      next: (res) => {
        this.members.set(res.items);
        checkDone();
      },
      error: () => {
        this.toastService.error('Failed to load members');
        checkDone();
      },
    });

    if (this.isEditing()) {
      this.classService.getById(slug, this.classId).subscribe({
        next: (res) => {
          this.classModel.set({
            scheduleId: res.data.scheduleId,
            studentId: res.data.studentId,
            teacherId: res.data.teacherId,
            date: res.data.date,
          });
          checkDone();
        },
        error: () => {
          this.toastService.error('Failed to load class');
          checkDone();
          this.goBack();
        },
      });
    }
  }

  protected onSave(event: Event): void {
    event.preventDefault();
    submit(this.classForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.saving.set(true);

      try {
        const { scheduleId, studentId, teacherId, date } = this.classModel();
        const body = { scheduleId, studentId, teacherId, date };

        await new Promise<void>((resolve, reject) => {
          const obs = this.isEditing()
            ? this.classService.update(slug, this.classId, body)
            : this.classService.create(slug, body);
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.toastService.success(this.isEditing() ? 'Class updated!' : 'Class created!');

        if (this.isEditing()) {
          this.router.navigate(['/orgs', slug, 'classes', this.classId]);
        } else {
          this.router.navigate(['/orgs', slug, 'classes']);
        }
      } catch {
        this.toastService.error('Failed to save class');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected goBack(): void {
    const slug = this.orgContext.org()?.slug;
    if (this.isEditing() && this.classId) {
      this.router.navigate(['/orgs', slug, 'classes', this.classId]);
    } else {
      this.router.navigate(['/orgs', slug, 'classes']);
    }
  }
}
