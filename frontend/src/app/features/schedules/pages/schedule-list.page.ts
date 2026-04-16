import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import type { PaginatedResponse, Schedule } from '@help-teacher/shared';
import { DayOfWeekEnum } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { ScheduleService } from '../services/schedule.service';

const DAY_ORDER: Record<string, number> = {
  [DayOfWeekEnum.MONDAY]: 1,
  [DayOfWeekEnum.TUESDAY]: 2,
  [DayOfWeekEnum.WEDNESDAY]: 3,
  [DayOfWeekEnum.THURSDAY]: 4,
  [DayOfWeekEnum.FRIDAY]: 5,
  [DayOfWeekEnum.SATURDAY]: 6,
  [DayOfWeekEnum.SUNDAY]: 7,
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

@Component({
  selector: 'app-schedule-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Schedules" subtitle="Manage your weekly schedules">
      @if (orgContext.isAdmin()) {
        <button class="btn btn-primary" (click)="openCreateModal()">+ Add Schedule</button>
      }
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (sortedSchedules().length === 0) {
      <app-empty-state
        icon="📅"
        title="No schedules yet"
        description="Create your first schedule to define class time slots."
      >
        @if (orgContext.isAdmin()) {
          <button class="btn btn-primary" (click)="openCreateModal()">Add Schedule</button>
        }
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Day of Week</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (schedule of sortedSchedules(); track schedule.id) {
                <tr>
                  <td class="font-medium">{{ capitalize(schedule.dayOfWeek) }}</td>
                  <td>{{ formatTime(schedule.startTime) }}</td>
                  <td>{{ formatTime(schedule.endTime) }}</td>
                  <td class="text-right">
                    @if (orgContext.isAdmin()) {
                      <button class="btn btn-ghost" (click)="openEditModal(schedule)">Edit</button>
                      <button class="btn btn-ghost text-error" (click)="confirmDelete(schedule)">
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
          (pageChanged)="loadSchedules($event)"
        />
      </div>
    }

    <!-- Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingSchedule() ? 'Edit Schedule' : 'Add Schedule' }}
        </h3>
        <form (submit)="onSubmit($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Day of Week</legend>
            <select class="select select-bordered w-full" [formField]="scheduleForm.dayOfWeek">
              <option value="">Select a day</option>
              @for (day of dayOptions; track day.value) {
                <option [value]="day.value">{{ day.label }}</option>
              }
            </select>
            @if (scheduleForm.dayOfWeek().touched() && scheduleForm.dayOfWeek().invalid()) {
              <p class="label text-error">
                @for (err of scheduleForm.dayOfWeek().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Start Time</legend>
            <input
              type="time"
              class="input input-bordered w-full"
              [formField]="scheduleForm.startTime"
            />
            @if (scheduleForm.startTime().touched() && scheduleForm.startTime().invalid()) {
              <p class="label text-error">
                @for (err of scheduleForm.startTime().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">End Time</legend>
            <input
              type="time"
              class="input input-bordered w-full"
              [formField]="scheduleForm.endTime"
            />
            @if (scheduleForm.endTime().touched() && scheduleForm.endTime().invalid()) {
              <p class="label text-error">
                @for (err of scheduleForm.endTime().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
            @if (timeRangeError()) {
              <p class="label text-error">{{ timeRangeError() }}</p>
            }
          </fieldset>
          <div class="modal-action">
            <button type="button" class="btn" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving() || timeRangeError()">
              @if (saving()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingSchedule() ? 'Save' : 'Create' }}
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
      title="Delete Schedule"
      [message]="
        'Delete this schedule (' +
        capitalize(deleteTarget()?.dayOfWeek ?? '') +
        ' ' +
        formatTime(deleteTarget()?.startTime ?? '') +
        '–' +
        formatTime(deleteTarget()?.endTime ?? '') +
        ')? This cannot be undone.'
      "
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteSchedule()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class ScheduleListPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly toastService = inject(ToastService);

  protected readonly schedules = signal<Schedule[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showModal = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly editingSchedule = signal<Schedule | null>(null);
  protected readonly deleteTarget = signal<Schedule | null>(null);

  protected readonly sortedSchedules = computed(() =>
    [...this.schedules()].sort(
      (a, b) => (DAY_ORDER[a.dayOfWeek] ?? 99) - (DAY_ORDER[b.dayOfWeek] ?? 99),
    ),
  );

  protected readonly dayOptions = [
    { value: DayOfWeekEnum.MONDAY, label: 'Monday' },
    { value: DayOfWeekEnum.TUESDAY, label: 'Tuesday' },
    { value: DayOfWeekEnum.WEDNESDAY, label: 'Wednesday' },
    { value: DayOfWeekEnum.THURSDAY, label: 'Thursday' },
    { value: DayOfWeekEnum.FRIDAY, label: 'Friday' },
    { value: DayOfWeekEnum.SATURDAY, label: 'Saturday' },
    { value: DayOfWeekEnum.SUNDAY, label: 'Sunday' },
  ];

  protected readonly scheduleModel = signal({ dayOfWeek: '', startTime: '', endTime: '' });
  protected readonly scheduleForm = form(this.scheduleModel, (s) => {
    required(s.dayOfWeek, { message: 'Day of week is required' });
    required(s.startTime, { message: 'Start time is required' });
    required(s.endTime, { message: 'End time is required' });
  });

  protected readonly timeRangeError = computed(() => {
    const { startTime, endTime } = this.scheduleModel();
    if (!startTime || !endTime) return null;
    if (startTime >= endTime) {
      return 'Start time must be before end time';
    }
    return null;
  });

  protected capitalize = capitalize;

  protected formatTime(time: string): string {
    return time?.slice(0, 5) ?? '';
  }

  ngOnInit(): void {
    this.loadSchedules(1);
  }

  loadSchedules(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.scheduleService.list(slug, page).subscribe({
      next: (res: PaginatedResponse<Schedule>) => {
        this.schedules.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load schedules');
      },
    });
  }

  protected openCreateModal(): void {
    this.editingSchedule.set(null);
    this.scheduleModel.set({ dayOfWeek: '', startTime: '', endTime: '' });
    this.showModal.set(true);
  }

  protected openEditModal(schedule: Schedule): void {
    this.editingSchedule.set(schedule);
    this.scheduleModel.set({
      dayOfWeek: schedule.dayOfWeek,
      startTime: this.formatTime(schedule.startTime),
      endTime: this.formatTime(schedule.endTime),
    });
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingSchedule.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.scheduleForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.saving.set(true);

      try {
        const { dayOfWeek, startTime, endTime } = this.scheduleModel();
        const editing = this.editingSchedule();

        await new Promise<void>((resolve, reject) => {
          const body = {
            dayOfWeek: dayOfWeek as DayOfWeekEnum,
            startTime,
            endTime,
          };
          const obs = editing
            ? this.scheduleService.update(slug, editing.id, body)
            : this.scheduleService.create(slug, body);
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeModal();
        this.toastService.success(editing ? 'Schedule updated!' : 'Schedule created!');
        this.loadSchedules(this.currentPage());
      } catch {
        this.toastService.error('Failed to save schedule');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected confirmDelete(schedule: Schedule): void {
    this.deleteTarget.set(schedule);
    this.showDeleteConfirm.set(true);
  }

  protected deleteSchedule(): void {
    const schedule = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!schedule || !slug) return;
    this.showDeleteConfirm.set(false);

    this.scheduleService.delete(slug, schedule.id).subscribe({
      next: () => {
        this.toastService.success('Schedule deleted');
        this.loadSchedules(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete schedule'),
    });
  }
}
