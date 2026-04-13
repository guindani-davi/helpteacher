import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import type { PaginatedResponse, Topic } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { SubjectService } from '../services/subject.service';
import { TopicService } from '../services/topic.service';

@Component({
  selector: 'app-topic-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header
      [title]="'Topics' + (subjectName() ? ' — ' + subjectName() : '')"
      subtitle="Manage topics for this subject"
    >
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" (click)="goBack()">← Back</button>
        <button class="btn btn-primary btn-sm" (click)="openCreateModal()">+ Add Topic</button>
      </div>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (topics().length === 0) {
      <app-empty-state
        icon="📝"
        title="No topics yet"
        description="Create your first topic for this subject."
      >
        <button class="btn btn-primary" (click)="openCreateModal()">Add Topic</button>
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
              @for (topic of topics(); track topic.id) {
                <tr>
                  <td class="font-medium">{{ topic.name }}</td>
                  <td class="text-right">
                    <button class="btn btn-ghost btn-xs" (click)="openEditModal(topic)">
                      Edit
                    </button>
                    <button class="btn btn-ghost btn-xs text-error" (click)="confirmDelete(topic)">
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
          (pageChanged)="loadTopics($event)"
        />
      </div>
    }

    <!-- Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingTopic() ? 'Edit Topic' : 'Add Topic' }}
        </h3>
        <form (submit)="onSubmit($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Topic name"
              [formField]="topicForm.name"
            />
            @if (topicForm.name().touched() && topicForm.name().invalid()) {
              <p class="label text-error">
                @for (err of topicForm.name().errors(); track err.kind) {
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
              {{ editingTopic() ? 'Save' : 'Create' }}
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
      title="Delete Topic"
      [message]="
        'Delete topic &quot;' + (deleteTarget()?.name ?? '') + '&quot;? This cannot be undone.'
      "
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteTopic()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class TopicListPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly subjectService = inject(SubjectService);
  private readonly topicService = inject(TopicService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly subjectId = signal('');
  protected readonly subjectName = signal('');
  protected readonly topics = signal<Topic[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showModal = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly editingTopic = signal<Topic | null>(null);
  protected readonly deleteTarget = signal<Topic | null>(null);

  protected readonly topicModel = signal({ name: '' });
  protected readonly topicForm = form(this.topicModel, (s) => {
    required(s.name, { message: 'Name is required' });
  });

  ngOnInit(): void {
    const subjectId = this.route.snapshot.paramMap.get('subjectId') ?? '';
    this.subjectId.set(subjectId);
    this.loadSubjectName(subjectId);
    this.loadTopics(1);
  }

  private loadSubjectName(subjectId: string): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !subjectId) return;

    this.subjectService.getById(slug, subjectId).subscribe({
      next: (res) => this.subjectName.set(res.data.name),
      error: () => {},
    });
  }

  loadTopics(page: number): void {
    const slug = this.orgContext.org()?.slug;
    const subjectId = this.subjectId();
    if (!slug || !subjectId) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.topicService.listBySubject(slug, subjectId, page).subscribe({
      next: (res: PaginatedResponse<Topic>) => {
        this.topics.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load topics');
      },
    });
  }

  protected openCreateModal(): void {
    this.editingTopic.set(null);
    this.topicModel.set({ name: '' });
    this.showModal.set(true);
  }

  protected openEditModal(topic: Topic): void {
    this.editingTopic.set(topic);
    this.topicModel.set({ name: topic.name });
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingTopic.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    submit(this.topicForm, async () => {
      const slug = this.orgContext.org()?.slug;
      const subjectId = this.subjectId();
      if (!slug || !subjectId) return;
      this.saving.set(true);

      try {
        const { name } = this.topicModel();
        const editing = this.editingTopic();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.topicService.update(slug, editing.id, { name: name.trim() })
            : this.topicService.create(slug, { name: name.trim(), subjectId });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeModal();
        this.toastService.success(editing ? 'Topic updated!' : 'Topic created!');
        this.loadTopics(this.currentPage());
      } catch {
        this.toastService.error('Failed to save topic');
      } finally {
        this.saving.set(false);
      }
    });
  }

  protected goBack(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'subjects']);
  }

  protected confirmDelete(topic: Topic): void {
    this.deleteTarget.set(topic);
    this.showDeleteConfirm.set(true);
  }

  protected deleteTopic(): void {
    const topic = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!topic || !slug) return;
    this.showDeleteConfirm.set(false);

    this.topicService.delete(slug, topic.id).subscribe({
      next: () => {
        this.toastService.success('Topic deleted');
        this.loadTopics(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete topic'),
    });
  }
}
