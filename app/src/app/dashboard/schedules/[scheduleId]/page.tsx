// Argo Note - Schedule Detail Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { ScheduleActions } from './schedule-actions';

export default async function ScheduleDetailPage({
  params,
}: {
  params: { scheduleId: string };
}) {
  const user = await requireAuth();

  const schedule = await prisma.schedule.findFirst({
    where: {
      id: params.scheduleId,
      userId: user.id,
    },
    include: {
      site: true,
      scheduleJobs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!schedule) {
    notFound();
  }

  // Calculate stats
  const totalRuns = schedule.scheduleJobs.length;
  const successfulRuns = schedule.scheduleJobs.filter(
    (j) => j.status === 'completed'
  ).length;
  const totalArticlesGenerated = schedule.scheduleJobs.reduce(
    (acc, j) => acc + (j.articlesGenerated || 0),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/schedules"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Schedules
            </Link>
            <span className="text-gray-400">/</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {schedule.cronExpression || 'Manual Schedule'}
            </h1>
            <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
              {schedule.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <ScheduleActions schedule={schedule} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Runs</p>
              <p className="text-2xl font-bold">{totalRuns}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Successful Runs</p>
              <p className="text-2xl font-bold">{successfulRuns}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Articles Generated</p>
              <p className="text-2xl font-bold">{totalArticlesGenerated}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Next Run</p>
              <p className="text-lg font-bold">
                {schedule.isActive && schedule.nextRunAt
                  ? formatDateTime(schedule.nextRunAt)
                  : '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Details */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Site</p>
              <Link
                href={`/dashboard/sites/${schedule.siteId}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {schedule.site?.slug || 'Unknown'}.argonote.app
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cron Expression</p>
              <p className="font-medium font-mono">
                {schedule.cronExpression || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Articles per Run</p>
              <p className="font-medium">{schedule.articlesPerRun}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Publish Mode</p>
              <p className="font-medium capitalize">{schedule.publishMode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{formatDateTime(schedule.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Run History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Run History</CardTitle>
          </CardHeader>
          <CardContent>
            {schedule.scheduleJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No runs yet. The schedule will run automatically based on the cron expression.
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {schedule.scheduleJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {formatDateTime(job.createdAt)}
                      </p>
                      {job.articlesGenerated !== null && (
                        <p className="text-sm text-gray-500">
                          {job.articlesGenerated} articles generated
                        </p>
                      )}
                      {job.errorMessage && (
                        <p className="text-sm text-red-500">{job.errorMessage}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        job.status === 'completed'
                          ? 'success'
                          : job.status === 'running'
                          ? 'warning'
                          : job.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
