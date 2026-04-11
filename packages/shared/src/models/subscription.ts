import type { BillingCycleEnum } from "../enums/billing-cycle.enum";
import type { SubscriptionStatusEnum } from "../enums/subscription-status.enum";
import type { SubscriptionTierEnum } from "../enums/subscription-tier.enum";

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  tier: SubscriptionTierEnum;
  priceCents: number;
  billingCycle: BillingCycleEnum | null;
}

export interface UserSubscriptionResponse {
  plan: SubscriptionPlanResponse;
  status: SubscriptionStatusEnum;
  pendingPlan: SubscriptionPlanResponse | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  prorationAsaasPaymentId: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}
