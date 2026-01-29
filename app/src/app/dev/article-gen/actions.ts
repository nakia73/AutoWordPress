'use server';

import { articleGenerator } from '@/lib/ai/article-generator';
import type { ArticleContent, ArticleType } from '@/types';

export type GenerationInput = {
  targetKeyword: string;
  productName: string;
  productDescription: string;
  articleType: ArticleType;
  language: 'ja' | 'en';
  includeImages: boolean;
};

export type GenerationMetadata = {
  title: string;
  targetKeyword: string;
  articleType: ArticleType;
  language: string;
  metaDescription: string;
  wordCount: number;
  generationTimeMs: number;
  sources: string[];
  sectionImagesGenerated: number;
  generatedAt: string;
};

export type GenerationResult = {
  success: boolean;
  article?: ArticleContent;
  metadata?: GenerationMetadata;
  error?: string;
};

export async function generateArticleAction(
  input: GenerationInput
): Promise<GenerationResult> {
  const startTime = Date.now();

  try {
    console.log('[ArticleGen] Starting generation:', {
      keyword: input.targetKeyword,
      type: input.articleType,
      language: input.language,
    });

    const article = await articleGenerator.generate({
      targetKeyword: input.targetKeyword,
      productName: input.productName,
      productDescription: input.productDescription,
      articleType: input.articleType,
      language: input.language,
      includeImages: input.includeImages,
    });

    const generationTimeMs = Date.now() - startTime;

    // Extract sources from content (simple regex for URLs in href)
    const urlRegex = /href=["']([^"']+)["']/g;
    const sources: string[] = [];
    let match;
    while ((match = urlRegex.exec(article.content)) !== null) {
      if (match[1].startsWith('http')) {
        sources.push(match[1]);
      }
    }

    // Count words (rough estimation for Japanese/English)
    const textContent = article.content.replace(/<[^>]*>/g, '');
    const wordCount = input.language === 'ja'
      ? textContent.length
      : textContent.split(/\s+/).length;

    const metadata: GenerationMetadata = {
      title: article.title,
      targetKeyword: article.target_keyword,
      articleType: article.article_type,
      language: input.language,
      metaDescription: article.meta_description,
      wordCount,
      generationTimeMs,
      sources: [...new Set(sources)],
      sectionImagesGenerated: article.sectionImagesGenerated || 0,
      generatedAt: new Date().toISOString(),
    };

    console.log('[ArticleGen] Generation complete:', {
      title: article.title,
      wordCount,
      timeMs: generationTimeMs,
    });

    return {
      success: true,
      article,
      metadata,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ArticleGen] Generation failed:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
