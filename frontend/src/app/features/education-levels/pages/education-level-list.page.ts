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
    <app-page-header
      title="Education Levels"
      subtitle="Manage education levels and their grade levels"
    >
      <button class="btn btn-primary btn-sm" (click)="openCreateLevelModal()">
        + Add Education Level
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (levels().length === 0) {
      <app-empty-state
        icon="🎓"
        title="No education levels yet"
        description="Create your first education level to organize grade levels."
      >
        <button class="btn btn-primary" (click)="openCreateLevelModal()">
          Add Education Level
        </button>
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
                <span class="transition-transform duration-200" [class.rotate-90]="item.expanded">
                  ▶
                </span>
                <span class="font-medium">{{ item.level.name }}</span>
              </div>
              <div class="flex items-center gap-1">
                <button
                  class="btn btn-ghost btn-xs"
                  (click)="openEditLevelModal(item.level); $event.stopPropagation()"
                >
                  Edit
                </button>
                <button
                  class="btn btn-ghost btn-xs text-error"
                  (click)="confirmDeleteLevel(item.level); $event.stopPropagation()"
                >
                  Delete
                </button>
              </div>
            </div>

            @if (item.expanded) {
              <div class="border-t border-base-300 px-4 py-3">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold text-base-content/70">Grade Levels</span>
                  <button
                    class="btn btn-outline btn-xs btn-primary"
                    (click)="openCreateGradeModal(item.level)"
                  >
                    + Add Grade Level
                  </button>
                </div>

                @if (item.gradeLoading) {
                  <div class="flex justify-center py-4">
                    <span class="loading loading-spinner loading-sm text-primary"></span>
                  </div>
                } @else if (item.gradeLevels.length === 0) {
                  <p class="text-sm text-base-content/50 py-2">
                    No grade levels yet. Add one above.
                  </p>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th class="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (grade of item.gradeLevels; track grade.id) {
                          <tr>
                            <td>{{ grade.name }}</td>
                            <td class="text-right">
                              <button
                                class="btn btn-ghost btn-xs"
                                (click)="openEditGradeModal(item.level, grade)"
                              >
                                Edit
                              </button>
                              <button
                                class="btn btn-ghost btn-xs text-error"
                                (click)="confirmDeleteGrade(item.level, grade)"
                              >
                                Delete
                              </button>
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
          {{ editingLevel() ? 'Edit Education Level' : 'Add Education Level' }}
        </h3>
        <form (submit)="onSubmitLevel($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Education level name"
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
            <button type="button" class="btn" (click)="closeLevelModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="savingLevel()">
              @if (savingLevel()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingLevel() ? 'Save' : 'Create' }}
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
          {{ editingGrade() ? 'Edit Grade Level' : 'Add Grade Level' }}
        </h3>
        <form (submit)="onSubmitGrade($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Name</legend>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Grade level name"
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
            <button type="button" class="btn" (click)="closeGradeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="savingGrade()">
              @if (savingGrade()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              {{ editingGrade() ? 'Save' : 'Create' }}
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
      title="Delete Education Level"
      [message]="
        'Delete &quot;' +
        (deleteLevelTarget()?.name ?? '') +
        '&quot; and all its grade levels? This cannot be undone.'
      "
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteLevel()"
      (cancelled)="showDeleteLevelConfirm.set(false)"
    />

    <!-- Delete grade level confirm -->
    <app-confirm-dialog
      [open]="showDeleteGradeConfirm()"
      title="Delete Grade Level"
      [message]="
        'Delete grade level &quot;' +
        (deleteGradeTarget()?.name ?? '') +
        '&quot;? This cannot be undone.'
      "
      confirmLabel="Delete"
      variant="danger"
      (confirmed)="deleteGrade()"
      (cancelled)="showDeleteGradeConfirm.set(false)"
    />
  `,
})
export default class EducationLevelListPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
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
    required(s.name, { message: 'Name is required' });
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
    required(s.name, { message: 'Name is required' });
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
        this.toastService.error('Failed to load education levels');
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
        this.toastService.error('Failed to load grade levels');
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
          editing ? 'Education level updated!' : 'Education level created!',
        );
        this.loadLevels(this.currentPage());
      } catch {
        this.toastService.error('Failed to save education level');
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
        this.toastService.success('Education level deleted');
        this.loadLevels(this.currentPage());
      },
      error: () => this.toastService.error('Failed to delete education level'),
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
        this.toastService.success(editing ? 'Grade level updated!' : 'Grade level created!');
        this.refreshGradeLevels(parentLevel.id);
      } catch {
        this.toastService.error('Failed to save grade level');
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
        this.toastService.success('Grade level deleted');
        this.refreshGradeLevels(parent.id);
      },
      error: () => this.toastService.error('Failed to delete grade level'),
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
      error: () => this.toastService.error('Failed to refresh grade levels'),
    });
  }
}
