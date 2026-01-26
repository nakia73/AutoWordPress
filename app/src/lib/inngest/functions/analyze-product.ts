// Argo Note - Analyze Product Function
// Runs AI analysis pipeline (Phase A-E) on product

import { inngest } from '../client';
import { prisma } from '@/lib/prisma/client';
import { productAnalyzer } from '@/lib/ai/product-analyzer';
import type { ProductAnalysisResult } from '@/types';

export const analyzeProduct = inngest.createFunction(
  {
    id: 'analyze-product',
    retries: 3,
  },
  { event: 'product/analyze' },
  async ({ event, step }) => {
    const { productId, mode, url, answers, keywords } = event.data;

    // Get product details
    const product = await step.run('get-product', async () => {
      return prisma.product.findUnique({
        where: { id: productId },
        include: { site: true },
      });
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    // Update product status to analyzing
    await step.run('update-status-analyzing', async () => {
      await prisma.product.update({
        where: { id: productId },
        data: { status: 'analyzing' },
      });
    });

    const analyzeOptions = {
      productId,
      productName: product.name,
      productDescription: product.description || '',
      productUrl: url,
      userAnswers: answers,
      language: (product.site?.language as 'en' | 'ja') || 'en',
    };

    // Phase A: Product Analysis
    const phaseAResult = await step.run('phase-a-product-analysis', async () => {
      console.log(`Running Phase A for product: ${productId}`);
      return productAnalyzer.analyzeProduct(analyzeOptions);
    });

    // Phase B: Purchase Funnel Analysis
    const phaseBResult = await step.run('phase-b-funnel-analysis', async () => {
      console.log(`Running Phase B for product: ${productId}`);
      return productAnalyzer.analyzePurchaseFunnel(analyzeOptions, phaseAResult);
    });

    // Phase C: Keyword Research
    const phaseCResult = await step.run('phase-c-keyword-research', async () => {
      console.log(`Running Phase C for product: ${productId}`);
      return productAnalyzer.researchKeywords(analyzeOptions, phaseAResult);
    });

    // Phase D: Competitor Analysis
    const phaseDResult = await step.run('phase-d-competitor-analysis', async () => {
      console.log(`Running Phase D for product: ${productId}`);
      return productAnalyzer.analyzeCompetitors(analyzeOptions, phaseAResult);
    });

    // Phase E: Cluster Generation
    const phaseEResult = await step.run('phase-e-cluster-generation', async () => {
      console.log(`Running Phase E for product: ${productId}`);
      return productAnalyzer.generateClusters(
        analyzeOptions,
        phaseAResult,
        phaseBResult,
        phaseCResult,
        phaseDResult
      );
    });

    // Combine results
    const analysisResult: ProductAnalysisResult = {
      phaseA: phaseAResult,
      phaseB: phaseBResult,
      phaseC: phaseCResult,
      phaseD: phaseDResult,
      phaseE: phaseEResult,
    };

    // Save analysis result
    await step.run('save-analysis-result', async () => {
      await prisma.product.update({
        where: { id: productId },
        data: { analysisResult },
      });
    });

    // Create article clusters and articles
    await step.run('create-clusters-and-articles', async () => {
      for (const clusterPlan of phaseEResult.clusters) {
        const cluster = await prisma.articleCluster.create({
          data: {
            productId: productId,
            pillarKeyword: clusterPlan.pillar_topic,
            status: 'pending',
          },
        });

        for (const articlePlan of clusterPlan.articles) {
          await prisma.article.create({
            data: {
              clusterId: cluster.id,
              title: articlePlan.title,
              targetKeyword: articlePlan.target_keyword,
              searchIntent: 'informational',
              status: 'draft',
              articleType: 'article',
            },
          });
        }
      }
    });

    // Update product status to completed
    await step.run('update-product-status', async () => {
      await prisma.product.update({
        where: { id: productId },
        data: { status: 'completed' },
      });
    });

    // Update job status
    await step.run('update-job-status', async () => {
      await prisma.job.updateMany({
        where: {
          jobType: 'ANALYZE_PRODUCT',
          payload: {
            path: ['data', 'product_id'],
            equals: productId,
          },
          status: 'pending',
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    });

    return { success: true, productId, analysisResult };
  }
);
