// Argo Note - Execute Schedule Function
// Runs scheduled article generation

import { inngest } from '../client';
import { prisma } from '@/lib/prisma/client';

export const executeSchedule = inngest.createFunction(
  {
    id: 'execute-schedule',
    retries: 3,
    // Only one schedule execution at a time per schedule
    concurrency: {
      limit: 1,
      key: 'event.data.scheduleId',
    },
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

    // Get draft articles to generate (preserve productId from parent cluster)
    const draftArticles = schedule.site?.products
      .flatMap((p) => p.articleClusters.map((c) => ({
        ...c,
        productId: p.id,
      })))
      .flatMap((c) => c.articles.map((a) => ({
        ...a,
        productId: c.productId,
      })))
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
    const generationResults: Array<{ articleId: string; status: string; error?: string }> = [];

    for (const article of draftArticles) {
      const result = await step.run(`generate-article-${article.id}`, async () => {
        try {
          // Trigger article generation
          await inngest.send({
            name: 'article/generate',
            data: {
              articleId: article.id,
              productId: article.productId,
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

    // If publish mode is 'publish', wait for generation and trigger WordPress sync
    if (schedule.publishMode === 'publish') {
      const triggeredArticleIds = generationResults
        .filter((r) => r.status === 'triggered')
        .map((r) => r.articleId);

      if (triggeredArticleIds.length > 0) {
        // Poll for article completion with exponential backoff
        // Max 10 attempts: 30s, 30s, 30s, 30s, 60s, 60s, 60s, 120s, 120s, 120s = ~11 minutes total
        const pollIntervals = [30, 30, 30, 30, 60, 60, 60, 120, 120, 120]; // seconds
        let completedArticles: string[] = [];

        for (let attempt = 0; attempt < pollIntervals.length; attempt++) {
          // Wait before checking
          await step.sleep(`wait-poll-${attempt}`, `${pollIntervals[attempt]}s`);

          // Check article statuses
          const statusCheck = await step.run(`check-article-status-${attempt}`, async () => {
            const articles = await prisma.article.findMany({
              where: {
                id: { in: triggeredArticleIds },
              },
              select: {
                id: true,
                status: true,
              },
            });

            const completed = articles
              .filter((a) => a.status === 'review' || a.status === 'failed')
              .map((a) => a.id);

            const stillGenerating = articles.filter((a) => a.status === 'generating').length;

            return { completed, stillGenerating, total: articles.length };
          });

          completedArticles = statusCheck.completed;

          // If all articles are done (review or failed), break early
          if (statusCheck.stillGenerating === 0) {
            break;
          }
        }

        // Sync completed articles to WordPress
        for (const articleId of completedArticles) {
          await step.run(`sync-wordpress-${articleId}`, async () => {
            const article = await prisma.article.findUnique({
              where: { id: articleId },
            });

            // Only sync articles that successfully reached 'review' status
            if (article?.status === 'review' && schedule.siteId) {
              await inngest.send({
                name: 'wordpress/sync',
                data: {
                  articleId: articleId,
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
