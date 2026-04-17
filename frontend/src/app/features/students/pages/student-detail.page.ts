import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  EducationLevel,
  GradeLevel,
  MembershipWithUser,
  PaginatedResponse,
  School,
  StudentDetail,
  StudentUserWithUser,
} from '@help-teacher/shared';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialog, PageHeader } from '../../../shared';
import { EducationLevelService } from '../../education-levels/services/education-level.service';
import { GradeLevelService } from '../../education-levels/services/grade-level.service';
import { MembershipService } from '../../organizations/services/membership.service';
import { OrgContextService } from '../../organizations/state/org-context.service';
import { SchoolService } from '../../schools/services/school.service';
import { RegistrationService } from '../services/registration.service';
import { StudentUserService } from '../services/student-user.service';
import { StudentService } from '../services/student.service';

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
  selector: 'app-student-detail-page',
  imports: [PageHeader, FormField, ConfirmDialog],
  template: `
    <app-page-header
      [title]="detail()?.student?.name + ' ' + detail()?.student?.surname"
      subtitle="Detalhes do aluno"
    >
      <div class="flex gap-2">
        @if (orgContext.isAdmin()) {
          <button class="btn" (click)="goToEdit()">Editar Aluno</button>
        }
        <button class="btn btn-accent" (click)="goToReport()">📊 Ver Relatório</button>
        <button class="btn btn-primary" (click)="openRegistrationModal()">
          + Adicionar Matrícula
        </button>
      </div>
    </app-page-header>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (detail()) {
      <div class="space-y-6">
        <!-- Student Info Card -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Informações do Aluno</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div>
                <p class="text-sm text-base-content/60">Nome</p>
                <p class="font-medium">{{ detail()?.student?.name }}</p>
              </div>
              <div>
                <p class="text-sm text-base-content/60">Sobrenome</p>
                <p class="font-medium">{{ detail()?.student?.surname }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Linked Responsibles -->
        @if (orgContext.isAdmin()) {
          <div class="card bg-base-100 shadow-sm border border-base-300">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <h2 class="card-title text-base">Responsáveis Vinculados</h2>
                <button class="btn btn-primary" (click)="openLinkModal()">
                  + Vincular Usuário
                </button>
              </div>
              @if (linkedUsersLoading()) {
                <div class="flex justify-center py-4">
                  <span class="loading loading-spinner loading-sm text-primary"></span>
                </div>
              } @else if (linkedUsers().length === 0) {
                <p class="text-base-content/60 mt-2">Nenhum responsável vinculado a este aluno.</p>
              } @else {
                <div class="overflow-x-auto mt-2">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th class="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (link of linkedUsers(); track link.id) {
                        <tr>
                          <td class="font-medium">{{ link.user.name }} {{ link.user.surname }}</td>
                          <td class="text-base-content/60 text-sm">{{ link.user.email }}</td>
                          <td class="text-right">
                            <button class="btn btn-ghost text-error" (click)="confirmUnlink(link)">
                              Desvincular
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
        }

        <!-- Current Registration -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">Matrícula Atual</h2>
            @if (detail()?.currentRegistration; as reg) {
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                  <p class="text-sm text-base-content/60">Escola</p>
                  <p class="font-medium">{{ reg.school.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Série</p>
                  <p class="font-medium">{{ reg.gradeLevel.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Nível de Ensino</p>
                  <p class="font-medium">{{ reg.gradeLevel.educationLevel.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Data de Início</p>
                  <p class="font-medium">{{ reg.startDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Data de Término</p>
                  <p class="font-medium">{{ reg.endDate ?? 'Em andamento' }}</p>
                </div>
              </div>
            } @else {
              <p class="text-base-content/60 mt-2">Nenhuma matrícula ativa.</p>
            }
          </div>
        </div>

        <!-- Registration History -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-base">Histórico de Matrículas</h2>
              <button class="btn btn-ghost" (click)="goToRegistrations()">Ver Todas</button>
            </div>
            @if (detail()!.registrations.length === 0) {
              <p class="text-base-content/60 mt-2">Nenhuma matrícula encontrada.</p>
            } @else {
              <div class="overflow-x-auto mt-2">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Escola</th>
                      <th>Série</th>
                      <th>Data de Início</th>
                      <th>Data de Término</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (reg of detail()!.registrations; track reg.id) {
                      <tr>
                        <td>{{ reg.school.name }}</td>
                        <td>
                          {{ reg.gradeLevel.name }} ({{ reg.gradeLevel.educationLevel.name }})
                        </td>
                        <td>{{ reg.startDate }}</td>
                        <td>{{ reg.endDate ?? 'Em andamento' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>

        <!-- Recent Classes -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-base">
              Aulas Recentes
              @if (detail()!.totalClasses > 0) {
                <span class="badge badge-primary">{{ detail()!.totalClasses }}</span>
              }
            </h2>
            @if (detail()!.classes.length === 0) {
              <p class="text-base-content/60 mt-2">Nenhuma aula encontrada.</p>
            } @else {
              <div class="overflow-x-auto mt-2">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Professor</th>
                      <th>Tópicos</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cls of detail()!.classes; track cls.id) {
                      <tr>
                        <td>{{ cls.date }}</td>
                        <td>
                          {{ translateDay(cls.schedule.dayOfWeek) }} {{ cls.schedule.startTime }}–{{
                            cls.schedule.endTime
                          }}
                        </td>
                        <td>{{ cls.teacher.name }} {{ cls.teacher.surname }}</td>
                        <td>
                          @for (topic of cls.topics; track topic.id) {
                            <span class="badge badge-primary badge-outline mr-1">{{
                              topic.name
                            }}</span>
                          }
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

    <!-- Add Registration modal -->
    <dialog class="modal" [class.modal-open]="showRegModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Adicionar Matrícula</h3>
        <form (submit)="onSubmitRegistration($event)">
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Escola</legend>
            <select class="select select-bordered w-full" [formField]="regForm.schoolId">
              <option value="">Selecione uma escola</option>
              @for (school of schools(); track school.id) {
                <option [value]="school.id">{{ school.name }}</option>
              }
            </select>
            @if (regForm.schoolId().touched() && regForm.schoolId().invalid()) {
              <p class="label text-error">Escola é obrigatória</p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Nível de Ensino</legend>
            <select
              class="select select-bordered w-full"
              [value]="selectedEducationLevelId()"
              (change)="onEducationLevelChange($event)"
            >
              <option value="">Selecione um nível de ensino</option>
              @for (el of educationLevels(); track el.id) {
                <option [value]="el.id">{{ el.name }}</option>
              }
            </select>
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Série</legend>
            <select class="select select-bordered w-full" [formField]="regForm.gradeLevelId">
              <option value="">Selecione uma série</option>
              @for (gl of gradeLevels(); track gl.id) {
                <option [value]="gl.id">{{ gl.name }}</option>
              }
            </select>
            @if (regForm.gradeLevelId().touched() && regForm.gradeLevelId().invalid()) {
              <p class="label text-error">Série é obrigatória</p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Data de Início</legend>
            <input
              type="date"
              class="input input-bordered w-full"
              [formField]="regForm.startDate"
            />
            @if (regForm.startDate().touched() && regForm.startDate().invalid()) {
              <p class="label text-error">Data de início é obrigatória</p>
            }
          </fieldset>
          <fieldset class="fieldset mt-4">
            <legend class="fieldset-legend">Data de Término (opcional)</legend>
            <input type="date" class="input input-bordered w-full" [formField]="regForm.endDate" />
          </fieldset>
          <div class="modal-action">
            <button type="button" class="btn" (click)="closeRegModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="savingReg()">
              @if (savingReg()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Criar
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeRegModal()">close</button>
      </form>
    </dialog>

    <!-- Link User modal -->
    <dialog class="modal" [class.modal-open]="showLinkModal()">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Vincular Responsável</h3>
        <p class="text-sm text-base-content/60 mt-1">
          Selecione um membro da organização para vincular como responsável por este aluno.
        </p>
        <fieldset class="fieldset mt-4">
          <legend class="fieldset-legend">Membro</legend>
          <select
            class="select select-bordered w-full"
            [value]="selectedLinkUserId()"
            (change)="selectedLinkUserId.set($any($event.target).value)"
          >
            <option value="">Selecione um membro</option>
            @for (member of availableMembers(); track member.userId) {
              <option [value]="member.userId">
                {{ member.user.name }} {{ member.user.surname }} ({{ member.user.email }})
              </option>
            }
          </select>
        </fieldset>
        <div class="modal-action">
          <button class="btn" (click)="closeLinkModal()">Cancelar</button>
          <button
            class="btn btn-primary"
            [disabled]="linkingUser() || !selectedLinkUserId()"
            (click)="linkUser()"
          >
            @if (linkingUser()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            Vincular
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button (click)="closeLinkModal()">close</button>
      </form>
    </dialog>

    <app-confirm-dialog
      [open]="showUnlinkConfirm()"
      title="Desvincular Responsável"
      [message]="
        'Remover ' +
        (unlinkTarget()?.user?.name ?? '') +
        ' ' +
        (unlinkTarget()?.user?.surname ?? '') +
        ' como responsável por este aluno?'
      "
      confirmLabel="Desvincular"
      variant="danger"
      (confirmed)="unlinkUser()"
      (cancelled)="showUnlinkConfirm.set(false)"
    />
  `,
})
export default class StudentDetailPage implements OnInit {
  protected readonly orgContext = inject(OrgContextService);
  private readonly studentService = inject(StudentService);
  private readonly registrationService = inject(RegistrationService);
  private readonly schoolService = inject(SchoolService);
  private readonly educationLevelService = inject(EducationLevelService);
  private readonly gradeLevelService = inject(GradeLevelService);
  private readonly studentUserService = inject(StudentUserService);
  private readonly membershipService = inject(MembershipService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly detail = signal<StudentDetail | null>(null);
  protected readonly loading = signal(true);

  // Registration modal state
  protected readonly showRegModal = signal(false);
  protected readonly savingReg = signal(false);
  protected readonly schools = signal<School[]>([]);
  protected readonly educationLevels = signal<EducationLevel[]>([]);
  protected readonly gradeLevels = signal<GradeLevel[]>([]);
  protected readonly selectedEducationLevelId = signal('');

  // Linked responsibles state
  protected readonly linkedUsers = signal<StudentUserWithUser[]>([]);
  protected readonly linkedUsersLoading = signal(false);
  protected readonly showLinkModal = signal(false);
  protected readonly linkingUser = signal(false);
  protected readonly orgMembers = signal<MembershipWithUser[]>([]);
  protected readonly selectedLinkUserId = signal('');
  protected readonly showUnlinkConfirm = signal(false);
  protected readonly unlinkTarget = signal<StudentUserWithUser | null>(null);

  protected readonly availableMembers = computed(() => {
    const linked = new Set(this.linkedUsers().map((l) => l.userId));
    return this.orgMembers().filter((m) => !linked.has(m.userId));
  });

  private studentId = '';

  protected readonly regModel = signal({
    schoolId: '',
    gradeLevelId: '',
    startDate: '',
    endDate: '',
  });
  protected readonly regForm = form(this.regModel, (s) => {
    required(s.schoolId, { message: 'Escola é obrigatória' });
    required(s.gradeLevelId, { message: 'Série é obrigatória' });
    required(s.startDate, { message: 'Data de início é obrigatória' });
  });

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('studentId') ?? '';
    this.loadDetail();
  }

  private loadDetail(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.studentId) return;
    this.loading.set(true);

    this.studentService.getDetails(slug, this.studentId).subscribe({
      next: (res) => {
        this.detail.set(res.data);
        this.loading.set(false);
        if (this.orgContext.isAdmin()) {
          this.loadLinkedUsers();
        }
      },
      error: () => {
        this.toastService.error('Falha ao carregar detalhes do aluno');
        this.loading.set(false);
      },
    });
  }

  protected translateDay(day: string): string {
    return DAY_LABELS[day.toLowerCase()] ?? day;
  }

  protected goToReport(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'students', this.studentId, 'report']);
  }

  protected goToEdit(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'students', this.studentId, 'edit']);
  }

  protected goToRegistrations(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.router.navigate(['/orgs', slug, 'students', this.studentId, 'registrations']);
  }

  protected openRegistrationModal(): void {
    this.regModel.set({ schoolId: '', gradeLevelId: '', startDate: '', endDate: '' });
    this.selectedEducationLevelId.set('');
    this.gradeLevels.set([]);
    this.showRegModal.set(true);
    this.loadSchools();
    this.loadEducationLevels();
  }

  protected closeRegModal(): void {
    this.showRegModal.set(false);
  }

  private loadSchools(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.schoolService.list(slug, 1, 100).subscribe({
      next: (res: PaginatedResponse<School>) => this.schools.set(res.items),
      error: () => this.toastService.error('Falha ao carregar escolas'),
    });
  }

  private loadEducationLevels(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;
    this.educationLevelService.list(slug, 1, 100).subscribe({
      next: (res: PaginatedResponse<EducationLevel>) => this.educationLevels.set(res.items),
      error: () => this.toastService.error('Falha ao carregar níveis de ensino'),
    });
  }

  protected onEducationLevelChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedEducationLevelId.set(id);
    this.gradeLevels.set([]);
    this.regModel.update((m) => ({ ...m, gradeLevelId: '' }));

    if (!id) return;
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.gradeLevelService.list(slug, id, 1, 100).subscribe({
      next: (res: PaginatedResponse<GradeLevel>) => this.gradeLevels.set(res.items),
      error: () => this.toastService.error('Falha ao carregar séries'),
    });
  }

  protected onSubmitRegistration(event: Event): void {
    event.preventDefault();
    submit(this.regForm, async () => {
      const slug = this.orgContext.org()?.slug;
      if (!slug) return;
      this.savingReg.set(true);

      try {
        const { schoolId, gradeLevelId, startDate, endDate } = this.regModel();
        await new Promise<void>((resolve, reject) => {
          this.registrationService
            .create(slug, {
              studentId: this.studentId,
              schoolId,
              gradeLevelId,
              startDate,
              endDate: endDate || undefined,
            })
            .subscribe({ next: () => resolve(), error: reject });
        });

        this.closeRegModal();
        this.toastService.success('Matrícula criada!');
        this.loadDetail();
      } catch {
        this.toastService.error('Falha ao criar matrícula');
      } finally {
        this.savingReg.set(false);
      }
    });
  }

  // — Linked Responsibles —

  private loadLinkedUsers(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug || !this.studentId) return;
    this.linkedUsersLoading.set(true);

    this.studentUserService.listLinked(slug, this.studentId).subscribe({
      next: (res) => {
        this.linkedUsers.set(res.data);
        this.linkedUsersLoading.set(false);
      },
      error: () => {
        this.toastService.error('Falha ao carregar usuários vinculados');
        this.linkedUsersLoading.set(false);
      },
    });
  }

  protected openLinkModal(): void {
    this.selectedLinkUserId.set('');
    this.showLinkModal.set(true);
    this.loadOrgMembers();
  }

  protected closeLinkModal(): void {
    this.showLinkModal.set(false);
  }

  private loadOrgMembers(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    this.membershipService.listMembers(slug, 1, 100).subscribe({
      next: (res) => this.orgMembers.set(res.items),
      error: () => this.toastService.error('Falha ao carregar membros'),
    });
  }

  protected linkUser(): void {
    const slug = this.orgContext.org()?.slug;
    const userId = this.selectedLinkUserId();
    if (!slug || !userId) return;
    this.linkingUser.set(true);

    this.studentUserService.link(slug, this.studentId, userId).subscribe({
      next: () => {
        this.toastService.success('Usuário vinculado com sucesso!');
        this.closeLinkModal();
        this.loadLinkedUsers();
        this.linkingUser.set(false);
      },
      error: () => {
        this.toastService.error('Falha ao vincular usuário');
        this.linkingUser.set(false);
      },
    });
  }

  protected confirmUnlink(link: StudentUserWithUser): void {
    this.unlinkTarget.set(link);
    this.showUnlinkConfirm.set(true);
  }

  protected unlinkUser(): void {
    const slug = this.orgContext.org()?.slug;
    const target = this.unlinkTarget();
    if (!slug || !target) return;

    this.studentUserService.unlink(slug, this.studentId, target.id).subscribe({
      next: () => {
        this.toastService.success('Usuário desvinculado com sucesso!');
        this.showUnlinkConfirm.set(false);
        this.unlinkTarget.set(null);
        this.loadLinkedUsers();
      },
      error: () => {
        this.toastService.error('Falha ao desvincular usuário');
        this.showUnlinkConfirm.set(false);
      },
    });
  }
}
