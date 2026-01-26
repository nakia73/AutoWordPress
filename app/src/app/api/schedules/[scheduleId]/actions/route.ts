// Argo Note - Schedule Actions API

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { inngest } from '@/lib/inngest/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  try {
    const user = await requireAuth();
    const { scheduleId } = await params;
    const { action } = await request.json();

    // Verify schedule belongs to user
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        userId: user.id,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'toggle': {
        // Toggle schedule active status
        const nextRunAt = !schedule.isActive
          ? calculateNextRun(schedule.cronExpression)
          : null;

        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            isActive: !schedule.isActive,
            nextRunAt,
          },
        });

        return NextResponse.json({
          success: true,
          isActive: !schedule.isActive,
        });
      }

      case 'trigger': {
        // Manually trigger the schedule
        await inngest.send({
          name: 'schedule/trigger-manual',
          data: {
            scheduleId: schedule.id,
          },
        });

        return NextResponse.json({ success: true, status: 'triggered' });
      }

      case 'delete': {
        // Delete the schedule
        await prisma.schedule.delete({
          where: { id: schedule.id },
        });

        return NextResponse.json({ success: true, status: 'deleted' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Schedule action error:', error);
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    );
  }
}

function calculateNextRun(cronExpression: string | null): Date {
  if (!cronExpression) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const parts = cronExpression.split(' ');
  if (parts.length !== 5) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  const [minute, hour, , , dayOfWeek] = parts;
  const targetHour = parseInt(hour, 10) || 9;
  const targetMinute = parseInt(minute, 10) || 0;

  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(targetHour, targetMinute, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  if (dayOfWeek !== '*') {
    const validDays = dayOfWeek.split(',').map((d) => parseInt(d, 10));
    while (!validDays.includes(nextRun.getDay())) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
  }

  return nextRun;
}
