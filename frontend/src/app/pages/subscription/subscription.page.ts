import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { UserSubscriptionResponse } from '@help-teacher/shared';
import { SubscriptionStatusEnum } from '@help-teacher/shared';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialog, EmptyState, ToastContainer } from '../../shared';

@Component({
  selector: 'app-subscription-page',
  imports: [RouterLink, DatePipe, UpperCasePipe, ConfirmDialog, ToastContainer, EmptyState],
  template: `
    <div class="min-h-screen bg-base-200/30 flex flex-col">
      <header class="navbar bg-base-100 border-b border-base-300">
        <div class="flex-1">
          <a routerLink="/orgs" class="text-xl font-bold text-primary">Help Teacher</a>
        </div>
        <div class="flex-none">
          <a routerLink="/plans" class="btn btn-ghost">View Plans</a>
        </div>
      </header>

      <main class="flex-1 max-w-2xl mx-auto w-full p-6">
        <h1 class="text-2xl font-bold text-base-content mb-6">My Subscription</h1>

        @if (loading()) {
          <div class="flex justify-center py-16">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        } @else if (!subscription()) {
          <app-empty-state
            icon="💳"
            title="No active subscription"
            description="You don't have an active subscription yet. Choose a plan to get started."
          >
            <a routerLink="/plans" class="btn btn-primary">View Plans</a>
          </app-empty-state>
        } @else {
          <div class="space-y-6">
            <!-- Current Plan Card -->
            <div class="card bg-base-100 shadow-sm border border-base-300">
              <div class="card-body">
                <div class="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 class="card-title">{{ subscription()!.plan.name }}</h2>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="badge badge-primary badge-outline">
                        {{ subscription()!.plan.tier | uppercase }}
                      </span>
                      <span [class]="statusBadgeClass(subscription()!.status)">
                        {{ subscription()!.status | uppercase }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-base-content">
                      $ {{ formatPrice(subscription()!.plan.priceCents) }}
                    </p>
                    @if (subscription()!.plan.billingCycle) {
                      <p class="text-sm text-base-content/60">
                        / {{ subscription()!.plan.billingCycle }}
                      </p>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Details Card -->
            <div class="card bg-base-100 shadow-sm border border-base-300">
              <div class="card-body space-y-3">
                <h3 class="font-semibold text-base-content">Subscription Details</h3>

                @if (
                  subscription()!.status === statusEnum.TRIALING && subscription()!.trialEndsAt
                ) {
                  <div class="alert alert-info">
                    <span>
                      🕐 Trial ends on {{ subscription()!.trialEndsAt | date: 'mediumDate' }}
                    </span>
                  </div>
                }

                @if (subscription()!.cancelAtPeriodEnd) {
                  <div class="alert alert-warning">
                    <span>
                      ⚠️ Your subscription will end on
                      {{ subscription()!.currentPeriodEnd | date: 'mediumDate' }}
                    </span>
                  </div>
                }

                @if (subscription()!.pendingPlan) {
                  <div class="alert alert-info">
                    <span>
                      ℹ️ You will be switched to
                      <strong>{{ subscription()!.pendingPlan!.name }}</strong>
                      at the next billing cycle.
                    </span>
                  </div>
                }

                @if (subscription()!.status === statusEnum.PAST_DUE) {
                  <div class="alert alert-warning">
                    <span>⚠️ Your payment is past due. Please update your payment method.</span>
                  </div>
                }

                @if (subscription()!.currentPeriodEnd && !subscription()!.cancelAtPeriodEnd) {
                  <div class="flex justify-between text-sm">
                    <span class="text-base-content/60">Current period ends</span>
                    <span class="text-base-content">
                      {{ subscription()!.currentPeriodEnd | date: 'mediumDate' }}
                    </span>
                  </div>
                }

                @if (subscription()!.canceledAt) {
                  <div class="flex justify-between text-sm">
                    <span class="text-base-content/60">Canceled on</span>
                    <span class="text-base-content">
                      {{ subscription()!.canceledAt | date: 'mediumDate' }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3">
              @if (
                !subscription()!.cancelAtPeriodEnd && subscription()!.status !== statusEnum.CANCELED
              ) {
                <a routerLink="/plans" class="btn btn-primary">Change Plan</a>
                <button class="btn btn-error btn-outline" (click)="showCancelDialog.set(true)">
                  Cancel Subscription
                </button>
              }

              @if (subscription()!.cancelAtPeriodEnd) {
                <button class="btn btn-primary" (click)="showReactivateDialog.set(true)">
                  Reactivate Subscription
                </button>
              }

              @if (subscription()!.status === statusEnum.CANCELED) {
                <a routerLink="/plans" class="btn btn-primary">Subscribe Again</a>
              }
            </div>
          </div>
        }
      </main>
    </div>

    <!-- Cancel Confirmation -->
    <app-confirm-dialog
      [open]="showCancelDialog()"
      title="Cancel Subscription"
      message="Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period."
      confirmLabel="Cancel Subscription"
      variant="danger"
      (confirmed)="confirmCancel()"
      (cancelled)="showCancelDialog.set(false)"
    />

    <!-- Reactivate Confirmation -->
    <app-confirm-dialog
      [open]="showReactivateDialog()"
      title="Reactivate Subscription"
      message="Would you like to reactivate your subscription? You will continue on your current plan."
      confirmLabel="Reactivate"
      variant="primary"
      (confirmed)="confirmReactivate()"
      (cancelled)="showReactivateDialog.set(false)"
    />

    <app-toast-container />
  `,
})
export default class SubscriptionPage implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  protected readonly statusEnum = SubscriptionStatusEnum;

  protected readonly subscription = signal<UserSubscriptionResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly showCancelDialog = signal(false);
  protected readonly showReactivateDialog = signal(false);

  ngOnInit(): void {
    this.loadSubscription();

    // Handle planId query param coming from plans page
    const planId = this.route.snapshot.queryParamMap.get('planId');
    if (planId) {
      this.changePlan(planId);
    }
  }

  protected statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      [SubscriptionStatusEnum.ACTIVE]: 'badge badge-success',
      [SubscriptionStatusEnum.TRIALING]: 'badge badge-info',
      [SubscriptionStatusEnum.PAST_DUE]: 'badge badge-warning',
      [SubscriptionStatusEnum.CANCELED]: 'badge badge-error',
    };
    return map[status] ?? 'badge';
  }

  protected formatPrice(priceCents: number): string {
    return (priceCents / 100).toFixed(2);
  }

  protected confirmCancel(): void {
    this.showCancelDialog.set(false);
    this.subscriptionService.cancel().subscribe({
      next: () => {
        this.toastService.success('Subscription canceled successfully.');
        this.loadSubscription();
      },
      error: () => this.toastService.error('Failed to cancel subscription.'),
    });
  }

  protected confirmReactivate(): void {
    this.showReactivateDialog.set(false);
    this.subscriptionService.reactivate().subscribe({
      next: () => {
        this.toastService.success('Subscription reactivated successfully!');
        this.loadSubscription();
      },
      error: () => this.toastService.error('Failed to reactivate subscription.'),
    });
  }

  private changePlan(planId: string): void {
    this.subscriptionService.changePlan({ planId }).subscribe({
      next: (res) => {
        if ('checkoutUrl' in res.data) {
          window.location.href = (res.data as { checkoutUrl: string }).checkoutUrl;
        } else {
          this.toastService.success('Plan changed successfully!');
          this.loadSubscription();
        }
      },
      error: () => this.toastService.error('Failed to change plan.'),
    });
  }

  private loadSubscription(): void {
    this.loading.set(true);
    this.subscriptionService.getMySubscription().subscribe({
      next: (res) => {
        this.subscription.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load subscription.');
      },
    });
  }
}
