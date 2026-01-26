// Argo Note - Onboarding Page
// Guides new users through site setup

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { redirect } from 'next/navigation';
import OnboardingWizard from './onboarding-wizard';

export default async function OnboardingPage() {
  const user = await requireAuth();

  // Check if user already has a site
  const existingSites = await prisma.site.findMany({
    where: { userId: user.id },
  });

  // If user has sites, redirect to dashboard
  if (existingSites.length > 0) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Argo Note
          </h1>
          <p className="mt-2 text-gray-600">
            Let&apos;s set up your AI-powered blog in just a few steps.
          </p>
        </div>

        <OnboardingWizard userId={user.id} />
      </div>
    </div>
  );
}
