import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { ClassDetail, PaginatedResponse } from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, EmptyState, PageHeader, Pagination } from '../../../shared';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { ClassService } from '../services/class.service';

const DAY_LABELS: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

@Component({
  selector: 'app-class-list-page',
  imports: [PageHeader, ConfirmDialog, Pagination, EmptyState, DatePipe],
  template: `
    <app-page-header title="Aulas" subtitle="Gerencie suas aulas">
      @if (orgContext.isAdmin()) {
        <button class="btn btn-primary" (click)="navigateToCreate()">+ Nova Aula</button>
      }
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (classes().length === 0) {
      <app-empty-state
        icon="🏫"
        title="Nenhuma aula ainda"
        description="Crie sua primeira aula para começar a rastrear lições."
      >
        @if (orgContext.isAdmin()) {
          <button class="btn btn-primary" (click)="navigateToCreate()">Nova Aula</button>
        }
      </app-empty-state>
    } @else {
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Aluno</th>
                <th>Professor</th>
                <th>Horário</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (cls of classes(); track cls.classInfo.id) {
                <tr>
                  <td class="font-medium">{{ cls.classInfo.date | date: 'mediumDate' }}</td>
                  <td>{{ cls.student.name }} {{ cls.student.surname }}</td>
                  <td>{{ cls.teacher.name }} {{ cls.teacher.surname }}</td>
                  <td class="text-sm text-base-content/70">
                    {{ translateDay(cls.schedule.dayOfWeek) }}
                    {{ cls.schedule.startTime.slice(0, 5) }}–{{ cls.schedule.endTime.slice(0, 5) }}
                  </td>
                  <td class="text-right">
                    <button class="btn btn-ghost" (click)="viewDetails(cls)">Ver</button>
                    @if (orgContext.isAdmin()) {
                      <button class="btn btn-ghost" (click)="navigateToEdit(cls)">Editar</button>
                      <button class="btn btn-ghost text-error" (click)="confirmDelete(cls)">
                        Excluir
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
          (pageChanged)="loadClasses($event)"
        />
      </div>
    }

    <app-confirm-dialog
      [open]="showDeleteConfirm()"
      title="Excluir Aula"
      [message]="
        'Excluir aula em ' +
        (deleteTarget()?.classInfo?.date ?? '') +
        '? Esta ação não pode ser desfeita.'
      "
      confirmLabel="Excluir"
      variant="danger"
      (confirmed)="deleteClass()"
      (cancelled)="showDeleteConfirm.set(false)"
    />
  `,
})
export default class ClassListPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly classService = inject(ClassService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly classes = signal<ClassDetail[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly deleteTarget = signal<ClassDetail | null>(null);

  protected capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  protected translateDay(day: string): string {
    return DAY_LABELS[day.toLowerCase()] ?? day;
  }

  ngOnInit(): void {
    this.loadClasses(1);
  }

  loadClasses(page: number): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.loading.set(true);
    this.currentPage.set(page);

    this.classService.listWithDetails(slug, page).subscribe({
      next: (res: PaginatedResponse<ClassDetail>) => {
        this.classes.set(res.items);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Falha ao carregar aulas');
      },
    });
  }

  protected navigateToCreate(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes', 'new']);
  }

  protected viewDetails(cls: ClassDetail): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes', cls.classInfo.id]);
  }

  protected navigateToEdit(cls: ClassDetail): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'classes', cls.classInfo.id, 'edit']);
  }

  protected confirmDelete(cls: ClassDetail): void {
    this.deleteTarget.set(cls);
    this.showDeleteConfirm.set(true);
  }

  protected deleteClass(): void {
    const cls = this.deleteTarget();
    const slug = this.orgContext.org()?.slug;
    if (!cls || !slug) return;
    this.showDeleteConfirm.set(false);

    this.classService.delete(slug, cls.classInfo.id).subscribe({
      next: () => {
        this.toastService.success('Aula excluída');
        this.loadClasses(this.currentPage());
      },
      error: () => this.toastService.error('Falha ao excluir aula'),
    });
  }
}
