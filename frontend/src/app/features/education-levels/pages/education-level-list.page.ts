import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import type { EducationLevel, GradeLevel, PaginatedResponse } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { EducationLevelService } from '../services/education-level.service';
import { GradeLevelService } from '../services/grade-level.service';

interface ExpandedLevel {
  level: EducationLevel;
  expanded: boolean;
  gradeLevels: GradeLevel[];
  gradeLoading: boolean;
  gradeLoaded: boolean;
}

@Component({
  selector: 'app-education-level-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, FormField],
  template: `
    <app-page-header title="Níveis de Ensino" subtitle="Gerencie níveis de ensino e suas séries">
      @if (orgContext.isAdmin()) {
        <button class="btn btn-primary" (click)="openCreateLevelModal()">
          + Adicionar Nível de Ensino
        </button>
      }
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (levels().length === 0) {
      <app-empty-state
        icon="🎓"
        title="Nenhum nível de ensino ainda"
        description="Crie seu primeiro nível de ensino para organizar as séries."
      >
        @if (orgContext.isAdmin()) {
          <button class="btn btn-primary" (click)="openCreateLevelModal()">
            Adicionar Nível de Ensino
          </button>
        }
      </app-empty-state>
    } @else {
      <div class="flex flex-col gap-2">
        @for (item of levels(); track item.level.id) {
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
                <span class="font-medium">{{ item.level.name }}</span>
              </div>
              <div class="flex items-center gap-1">
                @if (orgContext.isAdmin()) {
                  <button
                    class="btn btn-ghost"
                    (click)="openEditLevelModal(item.level); $event.stopPropagation()"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-ghost text-error"
                    (click)="confirmDeleteLevel(item.level); $event.stopPropagation()"
                  >
                    Excluir
                  </button>
                }
              </div>
            </div>

            @if (item.expanded) {
              <div class="border-t border-base-300 px-4 py-3">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold text-base-content/70">Séries</span>
                  @if (orgContext.isAdmin()) {
                    <button
                      class="btn btn-outline btn-primary"
                      (click)="openCreateGradeModal(item.level)"
                    >
                      + Adicionar Série
                    </button>
                  }
                </div>

                @if (item.gradeLoading) {
                  <div class="flex justify-center py-4">
                    <span class="loading loading-spinner loading-sm text-primary"></span>
                  </div>
                } @else if (item.gradeLevels.length === 0) {
                  <p class="text-sm text-base-content/50 py-2">
                    Nenhuma série ainda. Adicione uma acima.
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
                        @for (grade of item.gradeLevels; track grade.id) {
                          <tr>
                            <td>{{ grade.name }}</td>
                            <td class="text-right">
                              @if (orgContext.isAdmin()) {
                                <button
                                  class="btn btn-ghost"
                                  (click)="openEditGradeModal(item.level, grade)"
                                >
                                  Editar
                                </button>
                                <button
                                  class="btn btn-ghost text-error"
                                  (click)="confirmDeleteGrade(item.level, grade)"
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
          (pageChanged)="loadLevels($event)"
        />
      </div>
    }

    <!-- Education Level Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showLevelModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingLevel() ? 'Editar Nível de Ensino' : 'Adicionar Nível de Ensino' }}
        </h3>
        <form (submit)="onSubmitLevel($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Nome</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Nome do nível de ensino"
              [formField]="levelForm.name"
            />
            @if (levelForm.name().touched() && levelForm.name().invalid()) {
              <p class="label text-error">
                @for (err of levelForm.name().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>
          <div class="modal-action">
            <button type="button" class="btn" (click)="closeLevelModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="savingLevel()">
              @if (savingLevel()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingLevel() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeLevelModal()">close</button>
      </form>
    </dialog>

    <!-- Grade Level Create / Edit modal -->
    <dialog class="modal" [class.modal-open]="showGradeModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          {{ editingGrade() ? 'Editar Série' : 'Adicionar Série' }}
        </h3>
        <form (submit)="onSubmitGrade($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Nome</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Nome da série"
              [formField]="gradeForm.name"
            />
            @if (gradeForm.name().touched() && gradeForm.name().invalid()) {
              <p class="label text-error">
                @for (err of gradeForm.name().errors(); track err.kind) {
                  {{ err.message }}
                }
              </p>
            }
          </fieldset>
          <div class="modal-action">
            <button type="button" class="btn" (click)="closeGradeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="savingGrade()">
              @if (savingGrade()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingGrade() ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeGradeModal()">close</button>
      </form>
    </dialog>

    <!-- Delete education level confirm -->
    <app-confirm-dialog
      [open]="showDeleteLevelConfirm()"
      title="Excluir Nível de Ensino"
      [message]="
        'Excluir &quot;' +
        (deleteLevelTarget()?.name ?? '') +
        '&quot; e todas as suas séries? Esta ação não pode ser desfeita.'
      "
      confirmLabel="Excluir"
      variant="danger"
      (confirmed)="deleteLevel()"
      (cancelled)="showDeleteLevelConfirm.set(false)"
    />

    <!-- Delete grade level confirm -->
    <app-confirm-dialog
      [open]="showDeleteGradeConfirm()"
      title="Excluir Série"
      [message]="
        'Excluir série &quot;' +
        (deleteGradeTarget()?.name ?? '') +
        '&quot;? Esta ação não pode ser desfeita.'
      "
      confirmLabel="Excluir"
      variant="danger"
      (confirmed)="deleteGrade()"
      (cancelled)="showDeleteGradeConfirm.set(false)"
    />
  `,
})
export default class EducationLevelListPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly levelService = inject(EducationLevelService);
  private readonly gradeService = inject(GradeLevelService);
  private readonly toastService = inject(ToastService);

  protected readonly levels = signal<ExpandedLevel[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);

  // Education level modal
  protected readonly showLevelModal = signal(false);
  protected readonly savingLevel = signal(false);
  protected readonly editingLevel = signal<EducationLevel | null>(null);
  protected readonly showDeleteLevelConfirm = signal(false);
  protected readonly deleteLevelTarget = signal<EducationLevel | null>(null);

  protected readonly levelModel = signal({ name: '' });
  protected readonly levelForm = form(this.levelModel, (s) => {
    required(s.name, { message: 'Nome é obrigatório' });
  });

  // Grade level modal
  protected readonly showGradeModal = signal(false);
  protected readonly savingGrade = signal(false);
  protected readonly editingGrade = signal<GradeLevel | null>(null);
  protected readonly gradeParentLevel = signal<EducationLevel | null>(null);
  protected readonly showDeleteGradeConfirm = signal(false);
  protected readonly deleteGradeTarget = signal<GradeLevel | null>(null);
  protected readonly deleteGradeParent = signal<EducationLevel | null>(null);

  protected readonly gradeModel = signal({ name: '' });
  protected readonly gradeForm = form(this.gradeModel, (s) => {
    required(s.name, { message: 'Nome é obrigatório' });
  });

  ngOnInit(): void {
    this.loadLevels(1);
  }

  loadLevels(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.levelService.list(slug, page).subscribe({
      next: (res: PaginatedResponse<EducationLevel>) => {
        this.levels.set(
          res.items.map((level) => ({
            level,
            expanded: false,
            gradeLevels: [],
            gradeLoading: false,
            gradeLoaded: false,
          })),
        );
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Falha ao carregar níveis de ensino');
      },
    });
  }

  protected toggleExpand(item: ExpandedLevel): void {
    if (!item.expanded && !item.gradeLoaded) {
      this.loadGradeLevels(item);
    }
    this.levels.update((list) =>
      list.map((l) => (l.level.id === item.level.id ? { ...l, expanded: !l.expanded } : l)),
    );
  }

  private loadGradeLevels(item: ExpandedLevel): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.levels.update((list) =>
      list.map((l) => (l.level.id === item.level.id ? { ...l, gradeLoading: true } : l)),
    );

    this.gradeService.list(slug, item.level.id).subscribe({
      next: (res: PaginatedResponse<GradeLevel>) => {
        this.levels.update((list) =>
          list.map((l) =>
            l.level.id === item.level.id
              ? { ...l, gradeLevels: res.items, gradeLoading: false, gradeLoaded: true }
              : l,
          ),
        );
      },
      error: () => {
        this.levels.update((list) =>
          list.map((l) => (l.level.id === item.level.id ? { ...l, gradeLoading: false } : l)),
        );
        this.toastService.error('Falha ao carregar séries');
      },
    });
  }

  // --- Education Level CRUD ---

  protected openCreateLevelModal(): void {
    this.editingLevel.set(null);
    this.levelModel.set({ name: '' });
    this.showLevelModal.set(true);
  }

  protected openEditLevelModal(level: EducationLevel): void {
    this.editingLevel.set(level);
    this.levelModel.set({ name: level.name });
    this.showLevelModal.set(true);
  }

  protected closeLevelModal(): void {
    this.showLevelModal.set(false);
    this.editingLevel.set(null);
  }

  protected onSubmitLevel(event: Event): void {
    event.preventDefault();
    submit(this.levelForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.savingLevel.set(true);

      try {
        const { name } = this.levelModel();
        const editing = this.editingLevel();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.levelService.update(slug, editing.id, { name: name.trim() })
            : this.levelService.create(slug, { name: name.trim() });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeLevelModal();
        this.toastService.success(
          editing ? 'Nível de ensino atualizado!' : 'Nível de ensino criado!',
        );
        this.loadLevels(this.currentPage());
      } catch {
        this.toastService.error('Falha ao salvar nível de ensino');
      } finally {
        this.savingLevel.set(false);
      }
    });
  }

  protected confirmDeleteLevel(level: EducationLevel): void {
    this.deleteLevelTarget.set(level);
    this.showDeleteLevelConfirm.set(true);
  }

  protected deleteLevel(): void {
    const level = this.deleteLevelTarget();
    const slug = this.orgContext.org()?.slug;
    if (!level || !slug) return;
    this.showDeleteLevelConfirm.set(false);

    this.levelService.delete(slug, level.id).subscribe({
      next: () => {
        this.toastService.success('Nível de ensino excluído');
        this.loadLevels(this.currentPage());
      },
      error: () => this.toastService.error('Falha ao excluir nível de ensino'),
    });
  }

  // --- Grade Level CRUD ---

  protected openCreateGradeModal(parentLevel: EducationLevel): void {
    this.editingGrade.set(null);
    this.gradeParentLevel.set(parentLevel);
    this.gradeModel.set({ name: '' });
    this.showGradeModal.set(true);
  }

  protected openEditGradeModal(parentLevel: EducationLevel, grade: GradeLevel): void {
    this.editingGrade.set(grade);
    this.gradeParentLevel.set(parentLevel);
    this.gradeModel.set({ name: grade.name });
    this.showGradeModal.set(true);
  }

  protected closeGradeModal(): void {
    this.showGradeModal.set(false);
    this.editingGrade.set(null);
    this.gradeParentLevel.set(null);
  }

  protected onSubmitGrade(event: Event): void {
    event.preventDefault();
    submit(this.gradeForm, async () => {
      const slug = this.orgContext.org()?.slug;
      const parentLevel = this.gradeParentLevel();
      if (!slug || !parentLevel) return;
      this.savingGrade.set(true);

      try {
        const { name } = this.gradeModel();
        const editing = this.editingGrade();

        await new Promise<void>((resolve, reject) => {
          const obs = editing
            ? this.gradeService.update(slug, parentLevel.id, editing.id, { name: name.trim() })
            : this.gradeService.create(slug, parentLevel.id, { name: name.trim() });
          obs.subscribe({ next: () => resolve(), error: reject });
        });

        this.closeGradeModal();
        this.toastService.success(editing ? 'Série atualizada!' : 'Série criada!');
        this.refreshGradeLevels(parentLevel.id);
      } catch {
        this.toastService.error('Falha ao salvar série');
      } finally {
        this.savingGrade.set(false);
      }
    });
  }

  protected confirmDeleteGrade(parentLevel: EducationLevel, grade: GradeLevel): void {
    this.deleteGradeTarget.set(grade);
    this.deleteGradeParent.set(parentLevel);
    this.showDeleteGradeConfirm.set(true);
  }

  protected deleteGrade(): void {
    const grade = this.deleteGradeTarget();
    const parent = this.deleteGradeParent();
    const slug = this.orgContext.org()?.slug;
    if (!grade || !parent || !slug) return;
    this.showDeleteGradeConfirm.set(false);

    this.gradeService.delete(slug, parent.id, grade.id).subscribe({
      next: () => {
        this.toastService.success('Série excluída');
        this.refreshGradeLevels(parent.id);
      },
      error: () => this.toastService.error('Falha ao excluir série'),
    });
  }

  private refreshGradeLevels(educationLevelId: string): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.gradeService.list(slug, educationLevelId).subscribe({
      next: (res: PaginatedResponse<GradeLevel>) => {
        this.levels.update((list) =>
          list.map((l) =>
            l.level.id === educationLevelId
              ? { ...l, gradeLevels: res.items, gradeLoaded: true }
              : l,
          ),
        );
      },
      error: () => this.toastService.error('Falha ao atualizar séries'),
    });
  }
}
