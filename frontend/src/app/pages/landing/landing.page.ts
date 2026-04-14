import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  template: `
    <!-- Hero -->
    <div class="hero min-h-[70vh] bg-base-200/30">
      <div class="hero-content text-center flex-col gap-6 py-16">
        <div>
          <h1 class="text-5xl font-bold text-base-content md:text-6xl">
            Help <span class="text-primary">Teacher</span>
          </h1>
          <p class="py-6 text-lg text-base-content/70 max-w-xl mx-auto">
            The all-in-one platform to manage your students, schedule classes, track curriculum, and
            generate detailed reports — so you can focus on teaching.
          </p>
          <div class="flex flex-wrap gap-4 justify-center">
            <a routerLink="/register" class="btn btn-primary btn-lg">Get Started Free</a>
            <a routerLink="/login" class="btn btn-outline btn-lg">Sign In</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Features -->
    <section class="py-16 px-4 bg-base-100">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-base-content mb-12">
          Everything you need to manage your teaching
        </h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Feature 1 -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body items-center text-center">
              <div class="bg-primary/10 p-3 rounded-full mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-primary"
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
              <h3 class="card-title text-base-content">Student Management</h3>
              <p class="text-base-content/60 text-sm">
                Track students, registrations, and progress across all your organizations.
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body items-center text-center">
              <div class="bg-secondary/10 p-3 rounded-full mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-secondary"
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
              <h3 class="card-title text-base-content">Class Scheduling</h3>
              <p class="text-base-content/60 text-sm">
                Organize schedules and class sessions with an intuitive calendar interface.
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body items-center text-center">
              <div class="bg-accent/10 p-3 rounded-full mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-accent"
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
              </div>
              <h3 class="card-title text-base-content">Reports</h3>
              <p class="text-base-content/60 text-sm">
                Generate detailed student reports with PDF export for parents and coordinators.
              </p>
            </div>
          </div>

          <!-- Feature 4 -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body items-center text-center">
              <div class="bg-info/10 p-3 rounded-full mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-info"
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
              </div>
              <h3 class="card-title text-base-content">Multi-Organization</h3>
              <p class="text-base-content/60 text-sm">
                Manage multiple organizations with team collaboration, roles, and invites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-4 bg-primary text-primary-content">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p class="mb-8 text-primary-content/80">
          Choose a plan that fits your needs and start managing your students today.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <a routerLink="/plans" class="btn btn-secondary btn-lg">View Plans</a>
          <a routerLink="/register" class="btn btn-ghost btn-lg border border-primary-content/30">
            Create Account
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer footer-center p-6 bg-base-200 text-base-content/60">
      <p>&copy; {{ currentYear }} Help Teacher. All rights reserved.</p>
    </footer>
  `,
})
export default class LandingPage {
  protected currentYear = new Date().getFullYear();
}
