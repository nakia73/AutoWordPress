// Argo Note - Dashboard Page
// Main dashboard showing user's sites and articles

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { redirect } from 'next/navigation';
import DashboardContent from './dashboard-content';

export default async function DashboardPage() {
  const user = await requireAuth();

  // Get user's profile with sites and products
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      sites: {
        include: {
          products: {
            include: {
              articleClusters: {
                include: {
                  articles: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // If user has no sites, redirect to onboarding
  if (!profile?.sites || profile.sites.length === 0) {
    redirect('/onboarding');
  }

  return <DashboardContent profile={profile} />;
}
