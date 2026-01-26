// Argo Note - Sync WordPress Function
// Publishes/updates/deletes articles on WordPress

import { inngest } from '../client';
import { prisma } from '@/lib/prisma/client';
import { createWordPressClient, WordPressAPIError } from '@/lib/wordpress/client';
import type { WPPostStatus } from '@/types';

export const syncWordPress = inngest.createFunction(
  {
    id: 'sync-wordpress',
    retries: 5,
  },
  { event: 'wordpress/sync' },
  async ({ event, step }) => {
    const { articleId, siteId, action } = event.data;

    // Get article and site
    const [article, site] = await step.run('get-data', async () => {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });
      const site = await prisma.site.findUnique({
        where: { id: siteId },
      });
      return [article, site] as const;
    });

    if (!article || !site) {
      throw new Error('Article or site not found');
    }

    if (!site.wpApiToken || !site.wpUsername || !site.wpSiteUrl) {
      throw new Error('WordPress connection not configured');
    }

    // Create WordPress client
    const wpClient = createWordPressClient({
      wpSiteUrl: site.wpSiteUrl,
      wpUsername: site.wpUsername,
      wpApiToken: site.wpApiToken,
    });

    // Perform WordPress API operation
    const result = await step.run('wordpress-api-call', async () => {
      try {
        switch (action) {
          case 'create': {
            console.log(`Creating post on WordPress: ${article.title}`);

            const wpPost = await wpClient.createPost({
              title: article.title || '',
              content: article.content || '',
              status: 'publish' as WPPostStatus,
              excerpt: article.metaDescription || undefined,
            });

            return { wpPostId: wpPost.id, status: wpPost.status, link: wpPost.link };
          }

          case 'update': {
            if (!article.wpPostId) {
              throw new Error('No WordPress post ID found for update');
            }

            console.log(`Updating post on WordPress: ${article.wpPostId}`);

            const wpPost = await wpClient.updatePost(article.wpPostId, {
              title: article.title || '',
              content: article.content || '',
              excerpt: article.metaDescription || undefined,
            });

            return { wpPostId: wpPost.id, status: wpPost.status, link: wpPost.link };
          }

          case 'delete': {
            if (!article.wpPostId) {
              throw new Error('No WordPress post ID found for delete');
            }

            console.log(`Deleting post on WordPress: ${article.wpPostId}`);

            await wpClient.deletePost(article.wpPostId, true);

            return { wpPostId: article.wpPostId, status: 'deleted' as const };
          }

          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error) {
        if (error instanceof WordPressAPIError) {
          const recommendation = error.getRecommendedAction();

          // Update site status if needed
          if (recommendation.action === 'notify_user') {
            await prisma.site.update({
              where: { id: siteId },
              data: {
                wpConnectionStatus: 'error',
              },
            });
          }

          // Re-throw for retry if recommended
          if (recommendation.retry) {
            throw error;
          }

          throw new Error(recommendation.message);
        }
        throw error;
      }
    });

    // Update article with WordPress post ID and status
    await step.run('update-article', async () => {
      if (action === 'delete') {
        await prisma.article.update({
          where: { id: articleId },
          data: {
            wpPostId: null,
            status: 'archived',
          },
        });
      } else {
        await prisma.article.update({
          where: { id: articleId },
          data: {
            wpPostId: result.wpPostId,
            status: 'published',
            publishedAt: new Date(),
          },
        });
      }
    });

    // Update job status
    await step.run('update-job-status', async () => {
      await prisma.job.updateMany({
        where: {
          jobType: 'SYNC_WP',
          payload: {
            path: ['data', 'article_id'],
            equals: articleId,
          },
          status: { in: ['pending', 'processing'] },
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    });

    return { success: true, articleId, action, wpPostId: result.wpPostId };
  }
);
