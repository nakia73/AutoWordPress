// Argo Note - Schedules List Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export default async function SchedulesPage() {
  const user = await requireAuth();

  const schedules = await prisma.schedule.findMany({
    where: { userId: user.id },
    include: {
      site: true,
      scheduleJobs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          scheduleJobs: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Automate your article generation and publishing
          </p>
        </div>
        <Link href="/dashboard/schedules/new">
          <Button>Create Schedule</Button>
        </Link>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              You don&apos;t have any schedules yet.
            </p>
            <Link href="/dashboard/schedules/new">
              <Button>Create Your First Schedule</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => {
            const lastJob = schedule.scheduleJobs[0];

            return (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold">
                          {schedule.cronExpression || 'Manual Schedule'}
                        </span>
                        <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Site</p>
                          <p className="font-medium">
                            {schedule.site?.slug || 'All sites'}
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
                          <p className="text-sm text-gray-500">Total Runs</p>
                          <p className="font-medium">{schedule._count.scheduleJobs}</p>
                        </div>
                      </div>
                      {schedule.nextRunAt && schedule.isActive && (
                        <p className="text-sm text-gray-500 mt-4">
                          Next run: {formatDateTime(schedule.nextRunAt)}
                        </p>
                      )}
                      {lastJob && (
                        <p className="text-sm text-gray-400 mt-2">
                          Last run: {formatDateTime(lastJob.createdAt)} -{' '}
                          <Badge
                            variant={
                              lastJob.status === 'completed'
                                ? 'success'
                                : lastJob.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {lastJob.status}
                          </Badge>
                          {lastJob.articlesGenerated !== null && (
                            <span className="ml-2">
                              ({lastJob.articlesGenerated} articles)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/schedules/${schedule.id}`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
