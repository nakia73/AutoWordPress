// Argo Note - Schedule Cron Function
// Runs periodically to check and trigger due schedules

import { inngest } from '../client';
import { prisma } from '@/lib/prisma/client';

// Parse cron expression to calculate next run time
function getNextRunTime(cronExpression: string, fromDate: Date = new Date()): Date {
  const parts = cronExpression.split(' ');

  if (parts.length !== 5) {
    // Default to 24 hours from now if invalid
    return new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const [minute, hour, , , dayOfWeek] = parts;

  // Parse hour and minute
  const targetHour = parseInt(hour, 10) || 9;
  const targetMinute = parseInt(minute, 10) || 0;

  // Create next run date starting from tomorrow
  const nextRun = new Date(fromDate);
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(targetHour, targetMinute, 0, 0);

  // If specific days of week are specified
  if (dayOfWeek !== '*') {
    const validDays = dayOfWeek.split(',').map((d) => parseInt(d, 10));
    // Find the next valid day
    let attempts = 0;
    while (!validDays.includes(nextRun.getDay()) && attempts < 7) {
      nextRun.setDate(nextRun.getDate() + 1);
      attempts++;
    }
  }

  return nextRun;
}

// Cron function that runs every 5 minutes to check for due schedules
export const scheduleCron = inngest.createFunction(
  {
    id: 'schedule-cron',
    retries: 0, // Don't retry cron jobs
  },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    // Find schedules that are due to run
    const dueSchedules = await step.run('find-due-schedules', async () => {
      const now = new Date();

      return prisma.schedule.findMany({
        where: {
          isActive: true,
          nextRunAt: {
            lte: now,
          },
        },
        include: {
          site: true,
        },
      });
    });

    if (dueSchedules.length === 0) {
      return { triggered: 0 };
    }

    // Trigger each due schedule
    const results = [];

    for (const schedule of dueSchedules) {
      const result = await step.run(`trigger-schedule-${schedule.id}`, async () => {
        try {
          // Create a schedule job record
          const scheduleJob = await prisma.scheduleJob.create({
            data: {
              scheduleId: schedule.id,
              status: 'pending',
            },
          });

          // Trigger the execute-schedule function
          await inngest.send({
            name: 'schedule/execute',
            data: {
              scheduleId: schedule.id,
              scheduleJobId: scheduleJob.id,
            },
          });

          // Calculate and update next run time
          const nextRunAt = getNextRunTime(schedule.cronExpression || '0 9 * * *');

          await prisma.schedule.update({
            where: { id: schedule.id },
            data: { nextRunAt },
          });

          return {
            scheduleId: schedule.id,
            scheduleJobId: scheduleJob.id,
            status: 'triggered',
            nextRunAt,
          };
        } catch (error) {
          console.error(`Failed to trigger schedule ${schedule.id}:`, error);
          return {
            scheduleId: schedule.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      results.push(result);
    }

    return {
      triggered: results.filter((r) => r.status === 'triggered').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };
  }
);

// Manual trigger for testing a schedule
export const triggerScheduleManually = inngest.createFunction(
  {
    id: 'trigger-schedule-manually',
    retries: 1,
  },
  { event: 'schedule/trigger-manual' },
  async ({ event, step }) => {
    const { scheduleId } = event.data;

    const schedule = await step.run('get-schedule', async () => {
      return prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { site: true },
      });
    });

    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    // Create a schedule job record
    const scheduleJob = await step.run('create-schedule-job', async () => {
      return prisma.scheduleJob.create({
        data: {
          scheduleId: schedule.id,
          status: 'pending',
        },
      });
    });

    // Trigger the execute-schedule function
    await step.run('trigger-execution', async () => {
      await inngest.send({
        name: 'schedule/execute',
        data: {
          scheduleId: schedule.id,
          scheduleJobId: scheduleJob.id,
        },
      });
    });

    return {
      scheduleId: schedule.id,
      scheduleJobId: scheduleJob.id,
      status: 'triggered',
    };
  }
);
