// Argo Note - Schedules API

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';

// Parse cron expression to calculate next run time
function getNextRunTime(cronExpression: string): Date {
  // Simple implementation - for MVP, just calculate based on common patterns
  const now = new Date();
  const parts = cronExpression.split(' ');

  if (parts.length !== 5) {
    // Default to 24 hours from now if invalid
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  const [minute, hour, , , dayOfWeek] = parts;

  // Parse hour and minute
  const targetHour = parseInt(hour, 10) || 9;
  const targetMinute = parseInt(minute, 10) || 0;

  // Create next run date
  const nextRun = new Date(now);
  nextRun.setHours(targetHour, targetMinute, 0, 0);

  // If time has passed today, move to next valid day
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  // If specific days of week are specified
  if (dayOfWeek !== '*') {
    const validDays = dayOfWeek.split(',').map((d) => parseInt(d, 10));
    while (!validDays.includes(nextRun.getDay())) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
  }

  return nextRun;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { siteId, cronExpression, articlesPerRun, publishMode, isActive } = body;

    // Validate site belongs to user
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: user.id,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Calculate next run time
    const nextRunAt = isActive ? getNextRunTime(cronExpression) : null;

    // Create schedule
    const schedule = await prisma.schedule.create({
      data: {
        userId: user.id,
        siteId,
        cronExpression,
        articlesPerRun: articlesPerRun || 1,
        publishMode: publishMode || 'draft',
        isActive: isActive ?? true,
        nextRunAt,
      },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');

    const schedules = await prisma.schedule.findMany({
      where: {
        userId: user.id,
        ...(siteId && { siteId }),
      },
      include: {
        site: true,
        scheduleJobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}
