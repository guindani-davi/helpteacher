import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import type { ClassDetail, ClassTopicDetail, PaginatedResponse, Topic } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, PageHeader } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { TopicService } from '../../subjects/services/topic.service';
import { ClassTopicService } from '../services/class-topic.service';
import { ClassService } from '../services/class.service';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

@Component({
  selector: 'app-class-detail-page',
  imports: [PageHeader, ConfirmDialog, FormField],
  template: `
    <app-page-header
      [title]="'Class on ' + (detail()?.classInfo?.date ?? '')"
      subtitle="Class details and topics"
    >
      <div class="flex gap-2">
        <button class="btn" (click)="goBack()">Back</button>
        <button class="btn" (click)="goToEdit()">Edit</button>
      </div>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (detail()) {
      <div class="space-y-6">
        <!-- Class Info Card -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Class Information</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <p class="text-sm text-base-content/60">Date</p>
                <p class="font-medium">{{ detail()!.classInfo.date }}</p>
              </div>
              <div>
                <p class="text-sm text-base-content/60">Student</p>
                <p class="font-medium">
                  {{ detail()!.student.name }} {{ detail()!.student.surname }}
                </p>
              </div>
              <div>
                <p class="text-sm text-base-content/60">Teacher</p>
                <p class="font-medium">
                  {{ detail()!.teacher.name }} {{ detail()!.teacher.surname }}
                </p>
              </div>
              <div>
                <p class="text-sm text-base-content/60">Schedule</p>
                <p class="font-medium">
                  {{ capitalize(detail()!.schedule.dayOfWeek) }}
                  {{ detail()!.schedule.startTime }}–{{ detail()!.schedule.endTime }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Topics Card -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-base">
                Topics
                @if (topics().length > 0) {
                  <span class="badge badge-sm">{{ topics().length }}</span>
                }
              </h2>
              <button class="btn btn-primary" (click)="openAddTopicModal()">
                + Add Topic
              </button>
            </div>
            @if (loadingTopics()) {
              <div class="flex justify-center py-4">
                <span class="loading loading-spinner loading-md text-primary"></span>
              </div>
            } @else if (topics().length === 0) {
              <p class="text-base-content/60 mt-2">No topics attached to this class.</p>
            } @else {
              <div class="overflow-x-auto mt-2">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Subject</th>
                      <th class="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (topic of topics(); track topic.classTopicId) {
                      <tr>
                        <td class="font-medium">{{ topic.topicName }}</td>
                        <td>{{ topic.subjectName }}</td>
                        <td class="text-right">
                          <button
                            class="btn btn-ghost text-error"
                            (click)="confirmRemoveTopic(topic)"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Add Topic modal -->
    <dialog class="modal" [class.modal-open]="showTopicModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Add Topic</h3>
        <form (submit)="onAddTopic($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Topic</legend>
            <select class="select select-bordered w-full" [formField]="topicForm.topicId">
              <option value="">Select a topic</option>
              @for (topic of availableTopics(); track topic.id) {
                <option [value]="topic.id">{{ topic.name }}</option>
              }
            </select>
            @if (topicForm.topicId().touched() && topicForm.topicId().invalid()) {
              <p class="label text-error">
                @for (err of topicForm.topicId().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>
          <div class="modal-action">
            <button type="button" class="btn" (click)="closeTopicModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="savingTopic()">
              @if (savingTopic()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Add
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeTopicModal()">close</button>
      </form>
    </dialog>

    <app-confirm-dialog
      [open]="showRemoveConfirm()"
      title="Remove Topic"
      [message]="
        'Remove topic &quot;' + (removeTarget()?.topicName ?? '') + '&quot; from this class?'
      "
      confirmLabel="Remove"
      variant="danger"
      (confirmed)="removeTopic()"
      (cancelled)="showRemoveConfirm.set(false)"
    />
  `,
})
export default class ClassDetailPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly classService = inject(ClassService);
  private readonly classTopicService = inject(ClassTopicService);
  private readonly topicService = inject(TopicService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly detail = signal<ClassDetail | null>(null);
  protected readonly topics = signal<ClassTopicDetail[]>([]);
  protected readonly availableTopics = signal<Topic[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingTopics = signal(true);
  protected readonly savingTopic = signal(false);
  protected readonly showTopicModal = signal(false);
  protected readonly showRemoveConfirm = signal(false);
  protected readonly removeTarget = signal<ClassTopicDetail | null>(null);

  private classId = '';

  protected readonly topicModel = signal({ topicId: '' });
  protected readonly topicForm = form(this.topicModel, (s) => {
    required(s.topicId, { message: 'Topic is required' });
  });

  protected capitalize = capitalize;

  ngOnInit(): void {
    this.classId = this.route.snapshot.paramMap.get('classId') ?? '';
    this.loadDetail();
    this.loadTopics();
  }

  private loadDetail(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.classId) return;

    this.classService.getDetails(slug, this.classId).subscribe({
      next: (res) => {
        this.detail.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load class details');
      },
    });
  }

  private loadTopics(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.classId) return;
    this.loadingTopics.set(true);

    this.classTopicService.getByClassId(slug, this.classId).subscribe({
      next: (res) => {
        this.topics.set(res.data);
        this.loadingTopics.set(false);
      },
      error: () => {
        this.loadingTopics.set(false);
        this.toastService.error('Failed to load topics');
      },
    });
  }

  protected openAddTopicModal(): void {
    this.topicModel.set({ topicId: '' });
    this.loadAvailableTopics();
    this.showTopicModal.set(true);
  }

  protected closeTopicModal(): void {
    this.showTopicModal.set(false);
  }

  private loadAvailableTopics(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.topicService.list(slug, 1, 100).subscribe({
      next: (res: PaginatedResponse<Topic>) => {
        this.availableTopics.set(res.items);
      },
      error: () => this.toastService.error('Failed to load available topics'),
    });
  }

  protected onAddTopic(event: Event): void {
    event.preventDefault();
    submit(this.topicForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.savingTopic.set(true);

      try {
        const { topicId } = this.topicModel();
        await new Promise<void>((resolve, reject) => {
          this.classTopicService
            .add(slug, this.classId, { topicId })
            .subscribe({ next: () => resolve(), error: reject });
        });

        this.closeTopicModal();
        this.toastService.success('Topic added!');
        this.loadTopics();
      } catch {
        this.toastService.error('Failed to add topic');
      } finally {
        this.savingTopic.set(false);
      }
    });
  }

  protected confirmRemoveTopic(topic: ClassTopicDetail): void {
    this.removeTarget.set(topic);
    this.showRemoveConfirm.set(true);
  }

  protected removeTopic(): void {
    const target = this.removeTarget();
    const slug = this.orgContext.org()?.slug;
    if (!target || !slug) return;
    this.showRemoveConfirm.set(false);

    this.classTopicService.remove(slug, this.classId, target.classTopicId).subscribe({
      next: () => {
        this.toastService.success('Topic removed');
        this.loadTopics();
      },
      error: () => this.toastService.error('Failed to remove topic'),
    });
  }

  protected goToEdit(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes', this.classId, 'edit']);
  }

  protected goBack(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes']);
  }
}
