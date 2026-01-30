// Argo Note - Article Generator Service
// Combines Tavily research with LLM generation
// Phase 4: Integrated with image generation (NanoBanana Pro)

import { LLMClient, llmClient as defaultLlmClient } from './llm-client';
import { ARTICLE_PROMPTS } from './prompts';
import { tavilyClient } from './tavily-client';
import { imageGenerator } from './image-generator';
import { sectionImageService } from './section-image-service';
import { createPipelineLogger, type PipelineLogger, type LogEntry } from './pipeline-logger';
import type { ArticleContent, ArticleType } from '@/types';
import type { ClaudeProvider } from './claude-client';

type ArticleOutline = {
  title: string;
  sections: Array<{
    heading: string;
    level: 2 | 3;
    notes: string;
  }>;
};

/**
 * LLMプロバイダーインターフェース
 * LLMClientとClaudeProviderの共通インターフェース
 */
interface LLMProvider {
  complete(
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string>;
  prompt(systemPrompt: string, userPrompt: string): Promise<string>;
  jsonPrompt<T>(systemPrompt: string, userPrompt: string): Promise<T>;
}

/**
 * ClaudeProviderをLLMProviderインターフェースにアダプト
 */
class ClaudeProviderAdapter implements LLMProvider {
  constructor(private provider: ClaudeProvider) {}

  async complete(
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const systemMessage = messages.find((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    const response = await this.provider.complete({
      system: systemMessage?.content,
      messages: nonSystemMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    return response.content;
  }

  async prompt(systemPrompt: string, userPrompt: string): Promise<string> {
    return this.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  async jsonPrompt<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const response = await this.complete([
      {
        role: 'system',
        content: `${systemPrompt}\n\nYou must respond with valid JSON only. No markdown, no code blocks, just pure JSON.`,
      },
      { role: 'user', content: userPrompt },
    ]);

    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }

    return JSON.parse(jsonStr.trim()) as T;
  }
}

type GenerationOptions = {
  targetKeyword: string;
  productName: string;
  productDescription: string;
  articleType: ArticleType;
  language?: 'en' | 'ja';
  includeImages?: boolean;
  logger?: PipelineLogger;
  // Optional enrichment from InputHandler
  siteContent?: string;
  additionalContext?: string;
  // Optional LLM provider injection
  llmClient?: LLMClient;
  claudeProvider?: ClaudeProvider;
};

export type GenerationResultWithLogs = ArticleContent & {
  logs: LogEntry[];
};

export class ArticleGenerator {
  /**
   * オプションからLLMプロバイダーを取得
   * 優先順位: claudeProvider > llmClient > デフォルト(defaultLlmClient)
   */
  private getLLMProvider(options: GenerationOptions): LLMProvider {
    if (options.claudeProvider) {
      return new ClaudeProviderAdapter(options.claudeProvider);
    }
    if (options.llmClient) {
      return options.llmClient;
    }
    return defaultLlmClient;
  }

  // Step 1: Research the topic using enhanced 3-phase search
  async research(keyword: string, language: 'en' | 'ja' = 'en', logger?: PipelineLogger) {
    // Use enhanced multi-phase research (NEWS, SNS, OFFICIAL)
    const result = await tavilyClient.researchForArticle(keyword, {
      language,
      includeSubQueries: true,
      logger,
    });

    return result;
  }

  // Step 2: Generate article outline
  async generateOutline(options: GenerationOptions): Promise<ArticleOutline> {
    const logger = options.logger;
    logger?.info('Outline', 'アウトライン生成を開始', {
      keyword: options.targetKeyword,
      articleType: options.articleType,
    });

    const stopTimer = logger?.startTimer('Outline');

    const systemPrompt = ARTICLE_PROMPTS.OUTLINE;
    const userPrompt = `
Generate an article outline for the following:

Target Keyword: ${options.targetKeyword}
Product: ${options.productName}
Product Description: ${options.productDescription}
Article Type: ${options.articleType}
Language: ${options.language || 'en'}

The article should be comprehensive, SEO-optimized, and provide genuine value to readers searching for "${options.targetKeyword}".
`;

    const llm = this.getLLMProvider(options);
    const outline = await llm.jsonPrompt<ArticleOutline>(systemPrompt, userPrompt);
    const duration = stopTimer?.();

    logger?.success('Outline', 'アウトライン生成完了', {
      title: outline.title,
      sectionCount: outline.sections.length,
      sections: outline.sections.map(s => `${s.level === 2 ? 'H2' : 'H3'}: ${s.heading}`),
      durationMs: duration,
    });

    return outline;
  }

  // Step 3: Generate full article content
  async generateContent(
    outline: ArticleOutline,
    research: string,
    options: GenerationOptions
  ): Promise<string> {
    const logger = options.logger;
    const wordCount =
      options.articleType === 'article'
        ? { min: 3000, max: 4000 }
        : options.articleType === 'faq'
        ? { min: 1500, max: 2500 }
        : { min: 1000, max: 2000 };

    logger?.info('Content', 'コンテンツ生成を開始', {
      title: outline.title,
      targetWordCount: wordCount,
      researchLength: research.length,
      hasSiteContent: !!options.siteContent,
    });

    const stopTimer = logger?.startTimer('Content');

    // Build site content section if available
    let siteContentSection = '';
    if (options.siteContent) {
      siteContentSection = `
## Product Site Content
The following content was extracted from the product's website. Use this to ensure accuracy:
${options.siteContent.slice(0, 2000)}
`;
      logger?.debug('Content', 'サイトコンテンツを参照', {
        siteContentLength: options.siteContent.length,
      });
    }

    // Build additional context section if available
    let additionalContextSection = '';
    if (options.additionalContext) {
      additionalContextSection = `
## Additional Context
${options.additionalContext}
`;
    }

    const systemPrompt = ARTICLE_PROMPTS.CONTENT;
    const userPrompt = `
Write a complete ${options.articleType} article based on the following:

## Article Outline
Title: ${outline.title}
Sections:
${outline.sections.map((s) => `- ${'#'.repeat(s.level)} ${s.heading}: ${s.notes}`).join('\n')}

## Research Data
${research}
${siteContentSection}${additionalContextSection}
## Requirements
- Target Keyword: ${options.targetKeyword}
- Product: ${options.productName} - ${options.productDescription}
- Word Count: ${wordCount.min}-${wordCount.max} words
- Language: ${options.language || 'en'}
- Format: HTML with proper heading tags (h1, h2, h3), paragraphs, lists, and emphasis

Write the complete article content in valid HTML. Start with the h1 title and include all sections from the outline.
`;

    logger?.debug('Content', 'LLMリクエスト送信', {
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      maxTokens: 8192,
      temperature: 0.7,
    });

    const llm = this.getLLMProvider(options);
    const content = await llm.complete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        maxTokens: 8192,
        temperature: 0.7,
      }
    );

    const duration = stopTimer?.();

    logger?.success('Content', 'コンテンツ生成完了', {
      contentLength: content.length,
      durationMs: duration,
    });

    return content;
  }

  // Step 4: Generate meta description
  async generateMetaDescription(
    title: string,
    content: string,
    targetKeyword: string,
    options?: GenerationOptions
  ): Promise<string> {
    const logger = options?.logger;
    logger?.info('MetaDescription', 'メタディスクリプション生成を開始', { title, targetKeyword });
    const stopTimer = logger?.startTimer('MetaDescription');

    const systemPrompt = ARTICLE_PROMPTS.META_DESCRIPTION;
    const userPrompt = `
Generate a meta description for this article:

Title: ${title}
Target Keyword: ${targetKeyword}
Content Summary: ${content.slice(0, 1000)}...
`;

    const llm = options ? this.getLLMProvider(options) : defaultLlmClient;
    const metaDescription = await llm.prompt(systemPrompt, userPrompt);
    const truncated = metaDescription.slice(0, 160);
    const duration = stopTimer?.();

    logger?.success('MetaDescription', 'メタディスクリプション生成完了', {
      length: truncated.length,
      preview: truncated.slice(0, 50) + '...',
      durationMs: duration,
    });

    return truncated;
  }

  // Step 5: Generate thumbnail image
  async generateThumbnail(
    title: string,
    content: string,
    options?: { referenceImageUrl?: string; logger?: PipelineLogger }
  ): Promise<{ imageData: Buffer; promptUsed: string } | null> {
    const logger = options?.logger;
    try {
      logger?.info('Thumbnail', 'サムネイル画像生成を開始', { title });
      const stopTimer = logger?.startTimer('Thumbnail');

      const result = await imageGenerator.generateThumbnail(title, content, {
        referenceImageUrl: options?.referenceImageUrl,
      });

      const duration = stopTimer?.();

      if (result.isFallback) {
        logger?.warning('Thumbnail', 'サムネイル生成失敗（フォールバック）', {
          error: result.errorMessage,
          durationMs: duration,
        });
        return null;
      }

      logger?.success('Thumbnail', 'サムネイル画像生成完了', {
        imageSize: result.imageData.length,
        promptUsed: result.promptUsed.slice(0, 100) + '...',
        durationMs: duration,
      });

      return {
        imageData: result.imageData,
        promptUsed: result.promptUsed,
      };
    } catch (error) {
      logger?.error('Thumbnail', 'サムネイル生成エラー', { error: String(error) });
      return null;
    }
  }

  // Step 6: Process section images
  async processContentWithSectionImages(
    htmlContent: string,
    articleTitle: string,
    options?: { maxImages?: number; referenceImageUrl?: string; logger?: PipelineLogger }
  ): Promise<{ processedHtml: string; imagesGenerated: number; errors: string[] }> {
    const logger = options?.logger;
    try {
      logger?.info('SectionImages', 'セクション画像処理を開始', {
        articleTitle,
        maxImages: options?.maxImages ?? 5,
      });
      const stopTimer = logger?.startTimer('SectionImages');

      const result = await sectionImageService.processArticleImages(
        htmlContent,
        articleTitle,
        {
          maxImages: options?.maxImages ?? 5,
          referenceImageUrl: options?.referenceImageUrl,
        }
      );

      const duration = stopTimer?.();

      if (result.errors.length > 0) {
        logger?.warning('SectionImages', 'セクション画像で一部エラー', {
          errors: result.errors,
        });
      }

      logger?.success('SectionImages', 'セクション画像処理完了', {
        imagesGenerated: result.imagesGenerated,
        errorCount: result.errors.length,
        durationMs: duration,
      });

      return result;
    } catch (error) {
      logger?.error('SectionImages', 'セクション画像処理エラー', { error: String(error) });
      return {
        processedHtml: htmlContent,
        imagesGenerated: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  // Full article generation pipeline
  async generate(options: GenerationOptions): Promise<GenerationResultWithLogs> {
    const language = options.language || 'en';
    const logger = options.logger || createPipelineLogger();
    const totalTimer = logger.startTimer('Total');

    logger.info('Pipeline', '記事生成パイプラインを開始', {
      keyword: options.targetKeyword,
      productName: options.productName,
      articleType: options.articleType,
      language,
      includeImages: options.includeImages,
      hasSiteContent: !!options.siteContent,
      hasAdditionalContext: !!options.additionalContext,
    });

    // Step 1: Research (using enhanced 3-phase search)
    logger.info('Pipeline', 'Step 1/6: リサーチ開始');
    const researchResult = await this.research(options.targetKeyword, language, logger);
    const research = researchResult.context;

    // Step 2: Generate outline
    logger.info('Pipeline', 'Step 2/6: アウトライン生成開始');
    const outline = await this.generateOutline({ ...options, logger });

    // Step 3: Generate content
    logger.info('Pipeline', 'Step 3/6: コンテンツ生成開始');
    const content = await this.generateContent(outline, research, { ...options, logger });

    // Step 4: Generate meta description
    logger.info('Pipeline', 'Step 4/6: メタディスクリプション生成開始');
    const metaDescription = await this.generateMetaDescription(
      outline.title,
      content,
      options.targetKeyword,
      { ...options, logger }
    );

    // Initialize result
    const result: ArticleContent = {
      title: outline.title,
      content,
      meta_description: metaDescription,
      target_keyword: options.targetKeyword,
      search_intent: 'informational',
      article_type: options.articleType,
    };

    // Step 5 & 6: Generate images (if enabled)
    if (options.includeImages) {
      // Step 5: Generate thumbnail
      logger.info('Pipeline', 'Step 5/6: サムネイル生成開始');
      const thumbnail = await this.generateThumbnail(outline.title, content, { logger });
      if (thumbnail) {
        result.thumbnail = thumbnail;
      }

      // Step 6: Process section images
      logger.info('Pipeline', 'Step 6/6: セクション画像処理開始');
      const sectionResult = await this.processContentWithSectionImages(
        content,
        outline.title,
        { maxImages: 5, logger }
      );
      result.content = sectionResult.processedHtml;
      result.sectionImagesGenerated = sectionResult.imagesGenerated;
    } else {
      logger.info('Pipeline', 'Step 5-6: 画像生成スキップ（無効化）');
    }

    const totalDuration = totalTimer();
    logger.success('Pipeline', '記事生成パイプライン完了', {
      title: result.title,
      contentLength: result.content.length,
      totalDurationMs: totalDuration,
      tavilyApiCalls: researchResult.apiCallCount,
    });

    return {
      ...result,
      logs: logger.logs,
    };
  }
}

// Default instance
export const articleGenerator = new ArticleGenerator();
