import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ClassDetail } from '@help-teacher/shared';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { PageHeader } from '../../../../shared';
import { ClassService } from '../../../classes/services/class.service';
import { OrgContextService } from '../../state/org-context.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeader, RouterLink, DatePipe],
  template: `
    <app-page-header title="Dashboard" subtitle="Overview of your organization" />

    <!-- Stats Row -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="stats shadow bg-base-100 border border-base-300">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
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
          </div>
          <div class="stat-title text-sm">Students</div>
          <div class="stat-value text-primary">{{ loading() ? '…' : studentsCount() }}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-100 border border-base-300">
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
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
          </div>
          <div class="stat-title text-sm">Schedules</div>
          <div class="stat-value text-secondary">{{ loading() ? '…' : schedulesCount() }}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-100 border border-base-300">
        <div class="stat">
          <div class="stat-figure text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
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
          </div>
          <div class="stat-title text-sm">Classes</div>
          <div class="stat-value text-accent">{{ loading() ? '…' : classesCount() }}</div>
        </div>
      </div>
      <div class="stats shadow bg-base-100 border border-base-300">
        <div class="stat">
          <div class="stat-figure text-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
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
          </div>
          <div class="stat-title text-sm">Subjects</div>
          <div class="stat-value text-info">{{ loading() ? '…' : subjectsCount() }}</div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left column: Role & Quick Actions -->
      <div class="space-y-6">
        <!-- Your Role -->
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Your Role</h2>
            <div class="flex flex-wrap gap-2 mt-2">
              @for (role of roles(); track role) {
                <span class="badge badge-primary">{{ role }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Quick Actions</h2>
            <div class="flex flex-col gap-2 mt-2">
              <a
                [routerLink]="basePath() + '/students'"
                class="btn btn-primary justify-start gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Student
              </a>
              <a
                [routerLink]="basePath() + '/classes/new'"
                class="btn btn-secondary justify-start gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
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
                Add Class
              </a>
              <a [routerLink]="basePath() + '/reports'" class="btn btn-accent justify-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Reports
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Recent Classes -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base-content">Recent Classes</h2>
            @if (loading()) {
              <div class="flex justify-center py-8">
                <span class="loading loading-spinner loading-md text-primary"></span>
              </div>
            } @else if (recentClasses().length === 0) {
              <p class="text-base-content/60 py-4">No classes recorded yet.</p>
            } @else {
              <div class="overflow-x-auto">
                <table class="table table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (cls of recentClasses(); track cls.classInfo.id) {
                      <tr>
                        <td class="text-base-content">
                          {{ cls.classInfo.date | date: 'mediumDate' }}
                        </td>
                        <td class="text-base-content/70">
                          {{ cls.student.name }} {{ cls.student.surname }}
                        </td>
                        <td class="text-base-content/70">
                          {{ cls.teacher.name }} {{ cls.teacher.surname }}
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
    </div>
  `,
})
export default class DashboardPage implements OnInit {
  private readonly orgContext = inject(OrgContextService);
  private readonly api = inject(ApiService);
  private readonly classService = inject(ClassService);

  protected loading = signal(true);
  protected studentsCount = signal(0);
  protected schedulesCount = signal(0);
  protected classesCount = signal(0);
  protected subjectsCount = signal(0);
  protected recentClasses = signal<ClassDetail[]>([]);

  protected roles = computed(() => {
    const r = this.orgContext.currentUserRoles();
    return r.length > 0 ? r : ['Member'];
  });

  protected basePath = computed(() => {
    const slug = this.orgContext.org()?.slug ?? '';
    return `/orgs/${slug}`;
  });

  ngOnInit(): void {
    const slug = this.orgContext.org()?.slug;
    if (!slug) return;

    forkJoin({
      students: this.api.getPaginated<unknown>(`/organizations/${slug}/students`, {
        limit: 1,
      }),
      schedules: this.api.getPaginated<unknown>(`/organizations/${slug}/schedules`, {
        limit: 1,
      }),
      classes: this.api.getPaginated<unknown>(`/organizations/${slug}/classes`, {
        limit: 1,
      }),
      subjects: this.api.getPaginated<unknown>(`/organizations/${slug}/subjects`, {
        limit: 1,
      }),
      recentClasses: this.classService.listWithDetails(slug, 1, 5),
    }).subscribe({
      next: (res) => {
        this.studentsCount.set(res.students.total);
        this.schedulesCount.set(res.schedules.total);
        this.classesCount.set(res.classes.total);
        this.subjectsCount.set(res.subjects.total);
        this.recentClasses.set(res.recentClasses.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
