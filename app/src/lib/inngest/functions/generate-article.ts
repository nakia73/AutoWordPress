// Argo Note - Generate Article Function
// Creates article content using AI
// Phase 4: Integrated with image generation (NanoBanana Pro)
// Note: Fact Check is user responsibility (design decision 2026-01-27)

import { inngest } from '../client';
import { prisma } from '@/lib/prisma/client';
import { articleGenerator } from '@/lib/ai/article-generator';
import type { ArticleType } from '@/types';

export const generateArticle = inngest.createFunction(
  {
    id: 'generate-article',
    retries: 3,
    // Limit concurrent generations to manage LLM API rate limits
    concurrency: {
      limit: 5,
    },
  },
  { event: 'article/generate' },
  async ({ event, step }) => {
    const { articleId, targetKeyword, includeImages = false } = event.data;

    const startTime = Date.now();

    // Get article and related data
    const article = await step.run('get-article', async () => {
      return prisma.article.findUnique({
        where: { id: articleId },
        include: {
          cluster: {
            include: {
              product: {
                include: {
                  site: true,
                },
              },
            },
          },
        },
      });
    });

    if (!article) {
      throw new Error(`Article not found: ${articleId}`);
    }

    const product = article.cluster.product;
    const language = (product.site?.language as 'en' | 'ja') || 'en';

    // Update status to generating
    await step.run('update-status-generating', async () => {
      await prisma.article.update({
        where: { id: articleId },
        data: { status: 'generating' },
      });
    });

    // Generate article using the ArticleGenerator service
    const generatedContent = await step.run('generate-article-content', async () => {
      console.log(`Generating article for: ${targetKeyword}`);
      console.log(`Include images: ${includeImages}`);

      return articleGenerator.generate({
        targetKeyword: targetKeyword || article.targetKeyword || '',
        productName: product.name || 'Unnamed Product',
        productDescription: product.description || '',
        articleType: (article.articleType as ArticleType) || 'article',
        language,
        includeImages,
      });
    });

    // Save generated content
    await step.run('save-content', async () => {
      await prisma.article.update({
        where: { id: articleId },
        data: {
          title: generatedContent.title,
          content: generatedContent.content,
          metaDescription: generatedContent.meta_description,
          searchIntent: generatedContent.search_intent,
          status: 'review',
        },
      });
    });

    // Save generated images metadata (if images were generated)
    let thumbnailSaved = false;
    if (includeImages && generatedContent.thumbnail) {
      await step.run('save-thumbnail-metadata', async () => {
        await prisma.generatedImage.create({
          data: {
            articleId: articleId,
            prompt: generatedContent.thumbnail?.promptUsed || '',
            sectionRef: 'thumbnail',
            // Note: imageUrl and r2ObjectKey will be populated when uploading to storage
          },
        });
        thumbnailSaved = true;
        console.log('Thumbnail metadata saved');
      });
    }

    const generationTimeMs = Date.now() - startTime;

    // Create generation log with image info
    await step.run('create-generation-log', async () => {
      await prisma.articleGenerationLog.create({
        data: {
          articleId: articleId,
          modelUsed: process.env.LLM_MODEL || 'gemini-3-flash',
          inputTokens: 0, // Would be tracked by LLM client in production
          outputTokens: 0,
          generationTimeMs,
        },
      });

      // Log image generation info
      if (includeImages) {
        console.log(`Images generated - Thumbnail: ${thumbnailSaved}, Section images: ${generatedContent.sectionImagesGenerated || 0}`);
      }
    });

    // Update job status
    await step.run('update-job-status', async () => {
      await prisma.job.updateMany({
        where: {
          jobType: 'GENERATE_ARTICLE',
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

    return {
      success: true,
      articleId,
      generationTimeMs,
      imagesGenerated: includeImages
        ? {
            thumbnail: thumbnailSaved,
            sectionImages: generatedContent.sectionImagesGenerated || 0,
          }
        : null,
    };
  }
);
