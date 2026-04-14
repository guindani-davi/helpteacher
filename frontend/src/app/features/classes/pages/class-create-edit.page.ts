import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DayOfWeekEnum,
  type MembershipWithUser,
  type Schedule,
  type Student,
} from '@help-teacher/shared';
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
                      {{ member.user.name }} {{ member.user.surname }} ({{
                        member.roles.join(', ')
                      }})
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
                @if (selectedScheduleDay()) {
                  <p class="label text-info text-sm">
                    📅 The selected schedule is on
                    <strong>{{ capitalize(selectedScheduleDay()!) }}</strong
                    >s. Please pick a date that falls on that day.
                  </p>
                }
                @if (dateWeekdayError()) {
                  <p class="label text-error">{{ dateWeekdayError() }}</p>
                }
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
  protected readonly members = signal<MembershipWithUser[]>([]);

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

  /** Day-of-week enum value for the currently selected schedule. */
  protected readonly selectedScheduleDay = computed(() => {
    const scheduleId = this.classModel().scheduleId;
    if (!scheduleId) return null;
    return this.schedules().find((s) => s.id === scheduleId)?.dayOfWeek ?? null;
  });

  /** Maps DayOfWeekEnum → JS Date.getUTCDay() (0=Sun … 6=Sat). */
  private static readonly DAY_MAP: Record<string, number> = {
    [DayOfWeekEnum.SUNDAY]: 0,
    [DayOfWeekEnum.MONDAY]: 1,
    [DayOfWeekEnum.TUESDAY]: 2,
    [DayOfWeekEnum.WEDNESDAY]: 3,
    [DayOfWeekEnum.THURSDAY]: 4,
    [DayOfWeekEnum.FRIDAY]: 5,
    [DayOfWeekEnum.SATURDAY]: 6,
  };

  /** Cross-field validation: date vs schedule day-of-week. */
  protected readonly dateWeekdayError = computed(() => {
    const day = this.selectedScheduleDay();
    const date = this.classModel().date;
    if (!day || !date) return null;
    const jsDay = new Date(date + 'T00:00:00Z').getUTCDay();
    const expectedDay = ClassCreateEditPage.DAY_MAP[day];
    if (jsDay !== expectedDay) {
      return `The selected date is not a ${capitalize(day)}. Please choose a ${capitalize(day)}.`;
    }
    return null;
  });

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
    if (this.dateWeekdayError()) {
      this.toastService.error(this.dateWeekdayError()!);
      return;
    }
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
