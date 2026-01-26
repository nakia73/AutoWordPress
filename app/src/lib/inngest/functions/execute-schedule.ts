// Argo Note - Execute Schedule Function
// Runs scheduled article generation

import { inngest } from '../client';
import { prisma } from '@/lib/prisma/client';

export const executeSchedule = inngest.createFunction(
  {
    id: 'execute-schedule',
    retries: 3,
  },
  { event: 'schedule/execute' },
  async ({ event, step }) => {
    const { scheduleId, scheduleJobId } = event.data;

    // Get schedule
    const schedule = await step.run('get-schedule', async () => {
      return prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: {
          site: {
            include: {
              products: {
                include: {
                  articleClusters: {
                    include: {
                      articles: {
                        where: { status: 'draft' },
                        take: 10, // Get draft articles
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    if (!schedule.isActive) {
      return { success: false, reason: 'Schedule is inactive' };
    }

    // Update schedule job status
    await step.run('update-schedule-job-running', async () => {
      await prisma.scheduleJob.update({
        where: { id: scheduleJobId },
        data: {
          status: 'running',
          startedAt: new Date(),
        },
      });
    });

    // Get draft articles to generate
    const draftArticles = schedule.site?.products
      .flatMap((p) => p.articleClusters)
      .flatMap((c) => c.articles)
      .slice(0, schedule.articlesPerRun) || [];

    if (draftArticles.length === 0) {
      await step.run('no-articles-to-generate', async () => {
        await prisma.scheduleJob.update({
          where: { id: scheduleJobId },
          data: {
            status: 'completed',
            completedAt: new Date(),
            articlesGenerated: 0,
            generationDetails: {
              message: 'No draft articles available to generate',
            },
          },
        });
      });

      return { success: true, articlesGenerated: 0 };
    }

    // Generate articles
    const generationResults = [];

    for (const article of draftArticles) {
      const result = await step.run(`generate-article-${article.id}`, async () => {
        try {
          // Trigger article generation
          await inngest.send({
            name: 'article/generate',
            data: {
              articleId: article.id,
              productId: article.cluster?.productId || '',
              targetKeyword: article.targetKeyword || '',
              clusterId: article.clusterId,
            },
          });

          return { articleId: article.id, status: 'triggered' };
        } catch (error) {
          return {
            articleId: article.id,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      generationResults.push(result);
    }

    // If publish mode is 'publish', trigger WordPress sync for completed articles
    if (schedule.publishMode === 'publish') {
      await step.sleep('wait-for-generation', '5m'); // Wait for generation to complete

      for (const result of generationResults) {
        if (result.status === 'triggered') {
          await step.run(`sync-wordpress-${result.articleId}`, async () => {
            const article = await prisma.article.findUnique({
              where: { id: result.articleId },
            });

            if (article?.status === 'review' && schedule.siteId) {
              await inngest.send({
                name: 'wordpress/sync',
                data: {
                  articleId: result.articleId,
                  siteId: schedule.siteId,
                  action: 'create' as const,
                },
              });
            }
          });
        }
      }
    }

    // Update schedule job status
    await step.run('update-schedule-job-completed', async () => {
      const successCount = generationResults.filter(
        (r) => r.status === 'triggered'
      ).length;

      await prisma.scheduleJob.update({
        where: { id: scheduleJobId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          articlesGenerated: successCount,
          generationDetails: {
            requested: draftArticles.length,
            completed: successCount,
            failed: draftArticles.length - successCount,
            details: generationResults,
          },
        },
      });
    });

    // Calculate next run time
    await step.run('update-next-run', async () => {
      // TODO: Parse cron expression and calculate next run
      // For now, just add 24 hours
      const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.schedule.update({
        where: { id: scheduleId },
        data: { nextRunAt: nextRun },
      });
    });

    return {
      success: true,
      articlesGenerated: generationResults.filter((r) => r.status === 'triggered')
        .length,
    };
  }
);
