import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { ToastContainer } from '../../../shared';
import { OrgContextService } from '../state/org-context.service';

@Component({
  selector: 'app-org-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainer],
  template: `
    <div class="drawer lg:drawer-open min-h-screen">
      <input id="org-drawer" type="checkbox" class="drawer-toggle" />

      <!-- Main content -->
      <div class="drawer-content flex flex-col">
        <!-- Top bar -->
        <header class="navbar bg-base-100 border-b border-base-300 sticky top-0 z-30">
          <div class="flex-none lg:hidden">
            <label for="org-drawer" class="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <span class="text-lg font-semibold text-base-content">{{ orgName() }}</span>
          </div>
          <div class="flex-none">
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
                <div
                  class="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center"
                >
                  <span class="text-sm">{{ userInitials() }}</span>
                </div>
              </div>
              <ul
                tabindex="0"
                class="menu menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow border border-base-300"
              >
                <li><a routerLink="/orgs">Trocar Organização</a></li>
                <li><a routerLink="/profile">Meu Perfil</a></li>
                <li><a routerLink="/invites">Convites Pendentes</a></li>
                <li><button (click)="logout()">Sair</button></li>
              </ul>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 p-6 bg-base-200/30">
          <router-outlet />
        </main>
      </div>

      <!-- Sidebar -->
      <div class="drawer-side z-40">
        <label for="org-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside class="menu bg-base-100 border-r border-base-300 w-64 min-h-full p-4">
          <!-- Brand -->
          <div class="mb-8">
            <a routerLink="/orgs" class="text-xl font-bold text-primary">Help Teacher</a>
          </div>

          <ul class="space-y-1">
            @if (!isOnlyResponsible()) {
              <li>
                <a
                  [routerLink]="basePath()"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"
                    />
                  </svg>
                  Painel
                </a>
              </li>
              <li>
                <a [routerLink]="basePath() + '/students'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
                    />
                  </svg>
                  Alunos
                </a>
              </li>
              <li>
                <a [routerLink]="basePath() + '/classes'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Aulas
                </a>
              </li>
              <li>
                <a [routerLink]="basePath() + '/schedules'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Horários
                </a>
              </li>

              <div class="divider text-sm text-base-content/40 my-2">Currículo</div>
              <li>
                <a [routerLink]="basePath() + '/subjects'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Matérias
                </a>
              </li>
              <li>
                <a [routerLink]="basePath() + '/schools'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Escolas
                </a>
              </li>
              <li>
                <a [routerLink]="basePath() + '/education-levels'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Níveis de Ensino
                </a>
              </li>
            }

            @if (orgContext.isAdmin()) {
              <div class="divider text-sm text-base-content/40 my-2">Configurações</div>
              <li>
                <a
                  [routerLink]="basePath() + '/settings'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Configurações
                </a>
              </li>
              <li>
                <a [routerLink]="basePath() + '/settings/members'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Membros
                </a>
              </li>
              <li>
                <a [routerLink]="basePath() + '/settings/invites'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Convites
                </a>
              </li>
            }

            @if (hasResponsibleRole()) {
              <div class="divider text-sm text-base-content/40 my-2">Responsável</div>
              <li>
                <a [routerLink]="basePath() + '/my-students'" routerLinkActive="active">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Meus Alunos
                </a>
              </li>
            }
          </ul>
        </aside>
      </div>
    </div>
    <app-toast-container />
  `,
})
export default class OrgLayout {
  protected readonly orgContext = inject(OrgContextService);
  private readonly authService = inject(AuthService);

  protected orgName = computed(() => this.orgContext.org()?.name ?? 'Organização');

  protected userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return '?';
    return (user.name?.[0] ?? user.email[0] ?? '?').toUpperCase();
  });

  protected basePath = computed(() => {
    const slug = this.orgContext.org()?.slug ?? '';
    return `/orgs/${slug}`;
  });

  protected hasResponsibleRole = computed(() =>
    this.orgContext.currentUserRoles().some((r) => r === 'responsible'),
  );

  protected isOnlyResponsible = computed(() => this.orgContext.isOnlyResponsible());

  protected logout(): void {
    this.authService.logout();
  }
}
