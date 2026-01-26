'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type BillingActionsProps = {
  hasSubscription: boolean;
  subscriptionStatus: string;
};

export function BillingActions({
  hasSubscription,
  subscriptionStatus,
}: BillingActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string) => {
    setIsLoading(true);
    setAction('upgrade');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setAction('manage');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  if (hasSubscription && subscriptionStatus === 'active') {
    return (
      <Button
        variant="outline"
        onClick={handleManageSubscription}
        loading={isLoading && action === 'manage'}
      >
        Manage Subscription
      </Button>
    );
  }

  // Show upgrade buttons for trial or canceled users
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '')}
        loading={isLoading && action === 'upgrade'}
      >
        Upgrade to Starter
      </Button>
      <Button
        onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '')}
        loading={isLoading && action === 'upgrade'}
      >
        Upgrade to Pro
      </Button>
    </div>
  );
}
