import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import type { PaginatedResponse, Subject, Topic } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { SubjectService } from '../services/subject.service';
import { TopicService } from '../services/topic.service';

interface ExpandedSubject {
  subject: Subject;
  expanded: boolean;
  topics: Topic[];
  topicsLoading: boolean;
  topicsLoaded: boolean;
}

@Component({
  selector: 'app-subject-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Matérias" subtitle="Gerencie suas matérias e seus tópicos">
      @if (orgContext.isAdmin()) {
        <button class="btn btn-primary" (click)="openCreateModal()">+ Adicionar Matéria</button>
      }
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (subjects().length === 0) {
      <app-empty-state
        icon="📚"
        title="Nenhuma matéria ainda"
        description="Crie sua primeira matéria para começar a organizar tópicos."
      >
        @if (orgContext.isAdmin()) {
          <button class="btn btn-primary" (click)="openCreateModal()">Adicionar Matéria</button>
        }
      </app-empty-state>
    } @else {
      <div class="flex flex-col gap-2">
        @for (item of subjects(); track item.subject.id) {
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div
              class="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
              (click)="toggleExpand(item)"
            >
              <div class="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 transition-transform duration-200"
                  [class.rotate-90]="item.expanded"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span class="font-medium">{{ item.subject.name }}</span>
              </div>
              <div class="flex items-center gap-1">
                @if (orgContext.isAdmin()) {
                  <button
                    class="btn btn-ghost"
                    (click)="openEditModal(item.subject); $event.stopPropagation()"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-ghost text-error"
                    (click)="confirmDelete(item.subject); $event.stopPropagation()"
                  >
                    Excluir
                  </button>
                }
              </div>
            </div>

            @if (item.expanded) {
              <div class="border-t border-base-300 px-4 py-3">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold text-base-content/70">Tópicos</span>
                  @if (orgContext.isAdmin()) {
                    <button
                      class="btn btn-outline btn-primary"
                      (click)="openCreateTopicModal(item.subject)"
                    >
                      + Adicionar Tópico
                    </button>
                  }
                </div>

                @if (item.topicsLoading) {
                  <div class="flex justify-center py-4">
                    <span class="loading loading-spinner loading-sm text-primary"></span>
                  </div>
                } @else if (item.topics.length === 0) {
                  <p class="text-sm text-base-content/50 py-2">
                    Nenhum tópico ainda. Adicione um acima.
                  </p>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="table table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th class="text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (topic of item.topics; track topic.id) {
                          <tr>
                            <td>{{ topic.name }}</td>
                            <td class="text-right">
                              @if (orgContext.isAdmin()) {
                                <button
                                  class="btn btn-ghost"
                                  (click)="openEditTopicModal(item.subject, topic)"
                                >
                                  Editar
                                </button>
                                <button
                                  class="btn btn-ghost text-error"
                                  (click)="confirmDeleteTopic(item.subject, topic)"
                                >
                                  Excluir
                                </button>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
      <div class="flex justify-center mt-4">
        <app-pagination
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (pageChanged)="loadSubjects($event)"
        />
      </div>
    }

    <!-- Subject Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingSubject() ? 'Editar Matéria' : 'Adicionar Matéria' }}
        </h3>
        <form (submit)="onSubmit($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Nome</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Nome da matéria"
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
            <button type="button" class="btn" (click)="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingSubject() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeModal()">close</button>
      </form>
    </dialog>

    <!-- Topic Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showTopicModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingTopic() ? 'Editar Tópico' : 'Adicionar Tópico' }}
        </h3>
        <form (submit)="onSubmitTopic($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Nome</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Nome do tópico"
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
            <button type="button" class="btn" (click)="closeTopicModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="savingTopic()">
              @if (savingTopic()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingTopic() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeTopicModal()">close</button>
      </form>
    </dialog>

    <!-- Delete subject confirm -->
    <app-confirm-dialog
      [open]="showDeleteConfirm()"
      title="Excluir Matéria"
      [message]="
        'Excluir matéria &quot;' +
        (deleteTarget()?.name ?? '') +
        '&quot; e todos os seus tópicos? Esta ação não pode ser desfeita.'
      "
      confirmLabel="Excluir"
      variant="danger"
      (confirmed)="deleteSubject()"
      (cancelled)="showDeleteConfirm.set(false)"
    />

    <!-- Delete topic confirm -->
    <app-confirm-dialog
      [open]="showDeleteTopicConfirm()"
      title="Excluir Tópico"
      [message]="
        'Excluir tópico &quot;' +
        (deleteTopicTarget()?.name ?? '') +
        '&quot;? Esta ação não pode ser desfeita.'
      "
      confirmLabel="Excluir"
      variant="danger"
      (confirmed)="deleteTopic()"
      (cancelled)="showDeleteTopicConfirm.set(false)"
    />
  `,
})
export default class SubjectListPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly subjectService = inject(SubjectService);
  private readonly topicService = inject(TopicService);
  private readonly toastService = inject(ToastService);

  protected readonly subjects = signal<ExpandedSubject[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);

  // Subject modal
  protected readonly showModal = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingSubject = signal<Subject | null>(null);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly deleteTarget = signal<Subject | null>(null);

  protected readonly subjectModel = signal({ name: '' });
  protected readonly subjectForm = form(this.subjectModel, (s) => {
    required(s.name, { message: 'Nome é obrigatório' });
  });

  // Topic modal
  protected readonly showTopicModal = signal(false);
  protected readonly savingTopic = signal(false);
  protected readonly editingTopic = signal<Topic | null>(null);
  protected readonly topicParentSubject = signal<Subject | null>(null);
  protected readonly showDeleteTopicConfirm = signal(false);
  protected readonly deleteTopicTarget = signal<Topic | null>(null);
  protected readonly deleteTopicParent = signal<Subject | null>(null);

  protected readonly topicModel = signal({ name: '' });
  protected readonly topicForm = form(this.topicModel, (s) => {
    required(s.name, { message: 'Nome é obrigatório' });
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
        this.subjects.set(
          res.items.map((subject) => ({
            subject,
            expanded: false,
            topics: [],
            topicsLoading: false,
            topicsLoaded: false,
          })),
        );
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Falha ao carregar matérias');
      },
    });
  }

  protected toggleExpand(item: ExpandedSubject): void {
    if (!item.expanded && !item.topicsLoaded) {
      this.loadTopics(item);
    }
    this.subjects.update((list) =>
      list.map((s) => (s.subject.id === item.subject.id ? { ...s, expanded: !s.expanded } : s)),
    );
  }

  private loadTopics(item: ExpandedSubject): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.subjects.update((list) =>
      list.map((s) => (s.subject.id === item.subject.id ? { ...s, topicsLoading: true } : s)),
    );

    this.topicService.listBySubject(slug, item.subject.id, 1, 100).subscribe({
      next: (res: PaginatedResponse<Topic>) => {
        this.subjects.update((list) =>
          list.map((s) =>
            s.subject.id === item.subject.id
              ? { ...s, topics: res.items, topicsLoading: false, topicsLoaded: true }
              : s,
          ),
        );
      },
      error: () => {
        this.subjects.update((list) =>
          list.map((s) => (s.subject.id === item.subject.id ? { ...s, topicsLoading: false } : s)),
        );
        this.toastService.error('Falha ao carregar tópicos');
      },
    });
  }

  // --- Subject CRUD ---

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
        this.toastService.success(editing ? 'Matéria atualizada!' : 'Matéria criada!');
        this.loadSubjects(this.currentPage());
      } catch {
        this.toastService.error('Falha ao salvar matéria');
      } finally {
        this.saving.set(false);
      }
    });
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
        this.toastService.success('Matéria excluída');
        this.loadSubjects(this.currentPage());
      },
      error: () => this.toastService.error('Falha ao excluir matéria'),
    });
  }

  // --- Topic CRUD ---

  protected openCreateTopicModal(parentSubject: Subject): void {
    this.editingTopic.set(null);
    this.topicParentSubject.set(parentSubject);
    this.topicModel.set({ name: '' });
    this.showTopicModal.set(true);
  }

  protected openEditTopicModal(parentSubject: Subject, topic: Topic): void {
    this.editingTopic.set(topic);
    this.topicParentSubject.set(parentSubject);
    this.topicModel.set({ name: topic.name });
    this.showTopicModal.set(true);
  }

  protected closeTopicModal(): void {
    this.showTopicModal.set(false);
    this.editingTopic.set(null);
    this.topicParentSubject.set(null);
  }

  protected onSubmitTopic(event: Event): void {
    event.preventDefault();
    submit(this.topicForm, async () => {
      const slug = this.orgContext.org()?.slug;
      const parentSubject = this.topicParentSubject();
      if (!slug || !parentSubject) return;
      this.savingTopic.set(true);

      try {
        const { name } = this.topicModel();
        const editing = this.editingTopic();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.topicService.update(slug, editing.id, { name: name.trim() })
            : this.topicService.create(slug, { name: name.trim(), subjectId: parentSubject.id });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeTopicModal();
        this.toastService.success(editing ? 'Tópico atualizado!' : 'Tópico criado!');
        this.refreshTopics(parentSubject.id);
      } catch {
        this.toastService.error('Falha ao salvar tópico');
      } finally {
        this.savingTopic.set(false);
      }
    });
  }

  protected confirmDeleteTopic(parentSubject: Subject, topic: Topic): void {
    this.deleteTopicTarget.set(topic);
    this.deleteTopicParent.set(parentSubject);
    this.showDeleteTopicConfirm.set(true);
  }

  protected deleteTopic(): void {
    const topic = this.deleteTopicTarget();
    const parent = this.deleteTopicParent();
    const slug = this.orgContext.org()?.slug;
    if (!topic || !parent || !slug) return;
    this.showDeleteTopicConfirm.set(false);

    this.topicService.delete(slug, topic.id).subscribe({
      next: () => {
        this.toastService.success('Tópico excluído');
        this.refreshTopics(parent.id);
      },
      error: () => this.toastService.error('Falha ao excluir tópico'),
    });
  }

  private refreshTopics(subjectId: string): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.topicService.listBySubject(slug, subjectId, 1, 100).subscribe({
      next: (res: PaginatedResponse<Topic>) => {
        this.subjects.update((list) =>
          list.map((s) =>
            s.subject.id === subjectId ? { ...s, topics: res.items, topicsLoaded: true } : s,
          ),
        );
      },
      error: () => this.toastService.error('Falha ao atualizar tópicos'),
    });
  }
}
