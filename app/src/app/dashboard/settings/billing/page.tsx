// Argo Note - Billing Settings Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { BillingActions } from './billing-actions';

const PLANS = [
  {
    id: 'trial',
    name: 'Trial',
    price: 0,
    description: 'Try Argo Note for free',
    features: [
      '1 site',
      '1 product',
      '10 articles',
      'Basic AI generation',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 2000,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    description: 'For individuals getting started',
    features: [
      '3 sites',
      '5 products per site',
      'Unlimited articles',
      'Advanced AI generation',
      'Scheduled publishing',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 3000,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    description: 'For professionals and teams',
    features: [
      '10 sites',
      'Unlimited products',
      'Unlimited articles',
      'Priority AI generation',
      'Custom domains',
      'Analytics integration',
    ],
  },
];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  const user = await requireAuth();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      billingHistory: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!profile) {
    return null;
  }

  const currentPlan = PLANS.find(
    (p) =>
      p.id === profile.subscriptionStatus ||
      (profile.subscriptionStatus === 'active' && p.priceId)
  ) || PLANS[0];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Settings
          </Link>
          <span className="text-gray-400">/</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and billing
        </p>
      </div>

      {/* Success/Cancel Messages */}
      {searchParams.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            Your subscription has been updated successfully.
          </p>
        </div>
      )}
      {searchParams.canceled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Checkout was canceled. Your subscription has not been changed.
          </p>
        </div>
      )}

      {/* Current Plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{currentPlan.name}</p>
                <Badge
                  variant={
                    profile.subscriptionStatus === 'active'
                      ? 'success'
                      : profile.subscriptionStatus === 'trial'
                      ? 'default'
                      : 'warning'
                  }
                >
                  {profile.subscriptionStatus}
                </Badge>
              </div>
              {profile.currentPeriodEnd && (
                <p className="text-sm text-gray-500 mt-1">
                  {profile.subscriptionStatus === 'trial'
                    ? 'Trial ends'
                    : 'Current period ends'}{' '}
                  on {formatDate(profile.currentPeriodEnd)}
                </p>
              )}
            </div>
            <BillingActions
              hasSubscription={!!profile.subscriptionId}
              subscriptionStatus={profile.subscriptionStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={
                currentPlan.id === plan.id
                  ? 'border-blue-500 border-2'
                  : ''
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {currentPlan.id === plan.id && (
                    <Badge variant="default">Current</Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">
                  {plan.price === 0 ? 'Free' : `¥${plan.price.toLocaleString()}`}
                  {plan.price > 0 && (
                    <span className="text-sm font-normal text-gray-500">/月</span>
                  )}
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.billingHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No billing history yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {profile.billingHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {record.amountCents
                        ? `¥${record.amountCents.toLocaleString()}`
                        : '-'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(record.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      record.status === 'paid'
                        ? 'success'
                        : record.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
