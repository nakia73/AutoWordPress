// Argo Note - New Schedule Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NewScheduleForm } from './new-schedule-form';

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: { siteId?: string };
}) {
  const user = await requireAuth();

  const sites = await prisma.site.findMany({
    where: {
      userId: user.id,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/schedules"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to Schedules
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Schedule</CardTitle>
          <CardDescription>
            Set up automated article generation and publishing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewScheduleForm
            sites={sites}
            defaultSiteId={searchParams.siteId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
