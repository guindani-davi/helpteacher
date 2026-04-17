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
      [title]="isEditing() ? 'Editar Aluno' : 'Novo Aluno'"
      [subtitle]="isEditing() ? 'Atualizar informações do aluno' : 'Criar um novo aluno'"
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
                <legend class="fieldset-legend">Nome</legend>
                <input
                  type="text"
                  class="input input-bordered w-full"
                  placeholder="Nome"
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
                <legend class="fieldset-legend">Sobrenome</legend>
                <input
                  type="text"
                  class="input input-bordered w-full"
                  placeholder="Sobrenome"
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
                <button type="button" class="btn" (click)="goBack()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  {{ isEditing() ? 'Salvar Alterações' : 'Criar Aluno' }}
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
    required(s.name, { message: 'Nome é obrigatório' });
    required(s.surname, { message: 'Sobrenome é obrigatório' });
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
        this.toastService.error('Falha ao carregar aluno');
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

        this.toastService.success(this.isEditing() ? 'Aluno atualizado!' : 'Aluno criado!');

        if (this.isEditing()) {
          this.router.navigate(['/orgs', slug, 'students', this.studentId]);
        } else {
          this.router.navigate(['/orgs', slug, 'students']);
        }
      } catch {
        this.toastService.error('Falha ao salvar aluno');
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
