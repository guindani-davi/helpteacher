import { inject, Injectable } from '@angular/core';
import type {
  ApiResponse,
  ChangePlanBody,
  CheckoutSessionResponse,
  SubscriptionPlanResponse,
  UserSubscriptionResponse,
} from '@help-teacher/shared';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);

  getPlans() {
    return this.api.get<ApiResponse<SubscriptionPlanResponse[]>>('/subscriptions/plans');
  }

  getMySubscription() {
    return this.api.get<ApiResponse<UserSubscriptionResponse | null>>('/subscriptions/me');
  }

  changePlan(body: ChangePlanBody) {
    return this.api.put<ApiResponse<CheckoutSessionResponse | UserSubscriptionResponse>>(
      '/subscriptions/change-plan',
      body,
    );
  }

  cancel() {
    return this.api.post<void>('/subscriptions/cancel');
  }

  reactivate() {
    return this.api.post<void>('/subscriptions/reactivate');
  }
}
