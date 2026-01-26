// Argo Note - Stripe Client
// For payment processing (Phase 5)

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  TRIAL: 'trial',
  STARTER: 'starter',
  PRO: 'pro',
} as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

// Price configuration
export const PRICES = {
  STARTER: {
    monthly: 2000, // $20 in cents (JPY uses 円 as smallest unit)
    currency: 'jpy',
  },
  PRO: {
    monthly: 3000, // $30 equivalent
    currency: 'jpy',
  },
} as const;

// Helper to create checkout session
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// Helper to create customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Helper to get subscription status
export async function getSubscriptionStatus(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  return {
    status: subscription.status,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}
