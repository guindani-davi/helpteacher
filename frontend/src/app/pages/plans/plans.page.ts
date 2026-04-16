import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { SubscriptionPlanResponse } from '@help-teacher/shared';
import { SubscriptionTierEnum } from '@help-teacher/shared';
import { AuthService } from '../../core/auth';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-plans-page',
  imports: [RouterLink, UpperCasePipe],
  template: `
    <div class="min-h-screen bg-base-200/30 flex flex-col">
      <header class="navbar bg-base-100 border-b border-base-300">
        <div class="flex-1">
          <a routerLink="/" class="text-xl font-bold text-primary">Help Teacher</a>
        </div>
        <div class="flex-none">
          @if (isAuthenticated()) {
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
                class="menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow border border-base-300"
              >
                <li><a routerLink="/orgs">My Organizations</a></li>
                <li><a routerLink="/subscription">My Subscription</a></li>
                <li><a routerLink="/profile">My Profile</a></li>
                <li><a routerLink="/invites">Pending Invites</a></li>
                <li><button (click)="logout()">Logout</button></li>
              </ul>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-ghost">Login</a>
          }
        </div>
      </header>

      <main class="flex-1 max-w-5xl mx-auto w-full p-6">
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-base-content">Choose Your Plan</h1>
          <p class="text-base-content/60 mt-2">Pick the plan that best fits your teaching needs.</p>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-16">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        } @else if (plans().length === 0) {
          <div class="text-center py-16">
            <p class="text-base-content/60">No plans available at the moment.</p>
          </div>
        } @else {
          <div class="flex gap-6 justify-center flex-wrap">
            @for (plan of plans(); track plan.id) {
              <div
                class="card bg-base-100 shadow-lg w-80"
                [class.card-bordered]="isPro(plan)"
                [class.border-primary]="isPro(plan)"
              >
                @if (isPro(plan)) {
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span class="badge badge-primary">Recommended</span>
                  </div>
                }
                <div class="card-body items-center text-center">
                  <h2 class="card-title text-2xl">{{ plan.name }}</h2>
                  <span class="badge badge-primary mt-1" [class.badge-outline]="!isPro(plan)">
                    {{ plan.tier | uppercase }}
                  </span>

                  <div class="my-6">
                    <span class="text-4xl font-bold text-base-content">
                      $ {{ formatPrice(plan.priceCents) }}
                    </span>
                    @if (plan.billingCycle) {
                      <span class="text-base-content/60 text-sm"> / {{ plan.billingCycle }} </span>
                    }
                  </div>

                  <ul class="text-sm text-base-content/70 space-y-2 mb-6">
                    @if (isPro(plan)) {
                      <li>✓ Unlimited organizations</li>
                      <li>✓ Advanced reports</li>
                      <li>✓ Priority support</li>
                      <li>✓ All features included</li>
                    } @else {
                      <li>✓ Up to 3 organizations</li>
                      <li>✓ Basic reports</li>
                      <li>✓ Email support</li>
                      <li>✓ Core features</li>
                    }
                  </ul>

                  <div class="card-actions w-full">
                    <button
                      class="btn w-full"
                      [class.btn-primary]="isPro(plan)"
                      [class.btn-outline]="!isPro(plan)"
                      (click)="selectPlan(plan)"
                    >
                      {{ isPro(plan) ? 'Get Started' : 'Choose Plan' }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export default class PlansPage implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly plans = signal<SubscriptionPlanResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  protected readonly userInitials = computed(() => {
    const user = this.authService.user();
    if (!user) return '?';
    return (user.name?.[0] ?? user.email[0] ?? '?').toUpperCase();
  });

  ngOnInit(): void {
    this.loadPlans();
  }

  protected isPro(plan: SubscriptionPlanResponse): boolean {
    return plan.tier === SubscriptionTierEnum.PRO;
  }

  protected formatPrice(priceCents: number): string {
    return (priceCents / 100).toFixed(2);
  }

  protected selectPlan(plan: SubscriptionPlanResponse): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/subscription'], { queryParams: { planId: plan.id } });
    } else {
      this.router.navigate(['/register']);
    }
  }

  private loadPlans(): void {
    this.loading.set(true);
    this.subscriptionService.getPlans().subscribe({
      next: (res) => {
        this.plans.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected logout(): void {
    this.authService.logout();
  }
}
