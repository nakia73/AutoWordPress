// Argo Note - Settings Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function SettingsPage() {
  const user = await requireAuth();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      _count: {
        select: {
          sites: true,
          products: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and subscription
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profile.name || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium capitalize">
                    {profile.subscriptionStatus} Plan
                  </p>
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
                      : 'Renews'}{' '}
                    on {new Date(profile.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Link href="/dashboard/settings/billing">
                <Button variant="outline">Manage Billing</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Your current usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Sites</p>
                <p className="text-2xl font-bold">{profile._count.sites}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <p className="text-2xl font-bold">{profile._count.products}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Account deletion is currently disabled. Contact support for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
