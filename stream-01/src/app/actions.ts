'use server';

import { ArticleGenerator } from '@/lib/ai/article-generator';
import { articleInputHandler } from '@/lib/ai/article-input-handler';
import { LLMClient } from '@/lib/ai/llm-client';
import { createClaudeProvider } from '@/lib/ai/claude-client';
import type { ArticleContent, ArticleType } from '@/types';
import type { LogEntry } from '@/lib/ai/pipeline-logger';
import { createPipelineLogger } from '@/lib/ai/pipeline-logger';

export type InputMode = 'text' | 'site_url' | 'hybrid';

export type LLMModelConfig = {
  modelId: string;
  provider: 'google' | 'anthropic';
  apiMode?: 'sync' | 'batch';
};

export type GenerationInput = {
  inputMode: InputMode;
  // Text mode
  targetKeyword?: string;
  productName?: string;
  productDescription?: string;
  additionalContext?: string;
  // URL mode
  siteUrl?: string;
  // Common
  articleType: ArticleType;
  language: 'ja' | 'en';
  includeImages: boolean;
  // Model selection (optional, defaults to env)
  llmModel?: LLMModelConfig;
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
  inputMode: InputMode;
  sourceUrls: string[];
  // Model info
  llmModel?: string;
  llmProvider?: string;
  llmApiMode?: string;
};

export type GenerationResult = {
  success: boolean;
  article?: ArticleContent;
  metadata?: GenerationMetadata;
  logs?: LogEntry[];
  error?: string;
  // Base64 encoded thumbnail image for UI display
  thumbnailBase64?: string;
};

export async function generateArticleAction(
  input: GenerationInput
): Promise<GenerationResult> {
  const startTime = Date.now();
  const logger = createPipelineLogger();

  try {
    const modelConfig = input.llmModel || {
      modelId: 'gemini-3-flash',
      provider: 'google' as const,
    };

    logger.info('Action', '記事生成アクションを開始', {
      inputMode: input.inputMode,
      articleType: input.articleType,
      language: input.language,
      llmModel: modelConfig.modelId,
      llmProvider: modelConfig.provider,
      llmApiMode: modelConfig.apiMode,
    });

    // Create LLM client based on model selection
    let llmClient: LLMClient | undefined;
    let claudeProvider: ReturnType<typeof createClaudeProvider> | undefined;

    if (modelConfig.provider === 'google') {
      llmClient = new LLMClient({ model: modelConfig.modelId });
      logger.debug('Action', 'Gemini LLMClient作成', { model: modelConfig.modelId });
    } else if (modelConfig.provider === 'anthropic') {
      claudeProvider = createClaudeProvider({
        type: modelConfig.apiMode || 'batch',
        defaultModel: modelConfig.modelId.replace('.', '-'), // claude-haiku-4.5 -> claude-haiku-4-5
      });
      logger.debug('Action', 'Claude Provider作成', {
        model: modelConfig.modelId,
        apiMode: modelConfig.apiMode,
      });
    }

    // Step 1: Normalize input using ArticleInputHandler
    logger.info('InputHandler', '入力の正規化を開始', { mode: input.inputMode });
    const stopInputTimer = logger.startTimer('InputHandler');

    let normalizedInput;
    try {
      switch (input.inputMode) {
        case 'text':
          normalizedInput = await articleInputHandler.normalize({
            mode: 'text',
            productName: input.productName || 'Generic Product',
            productDescription: input.productDescription || 'A product or service',
            targetKeyword: input.targetKeyword || '',
            additionalContext: input.additionalContext,
            language: input.language,
          });
          break;

        case 'site_url':
          normalizedInput = await articleInputHandler.normalize({
            mode: 'site_url',
            url: input.siteUrl || '',
            targetKeyword: input.targetKeyword,
            language: input.language,
          });
          break;

        case 'hybrid':
          normalizedInput = await articleInputHandler.normalize({
            mode: 'hybrid',
            siteUrl: input.siteUrl,
            productName: input.productName,
            productDescription: input.productDescription,
            targetKeyword: input.targetKeyword,
            additionalContext: input.additionalContext,
            language: input.language,
          });
          break;

        default:
          throw new Error(`Unknown input mode: ${input.inputMode}`);
      }
    } catch (inputError) {
      logger.error('InputHandler', '入力正規化失敗', { error: String(inputError) });
      throw inputError;
    }

    const inputDuration = stopInputTimer();
    logger.success('InputHandler', '入力の正規化完了', {
      productName: normalizedInput.productName,
      targetKeyword: normalizedInput.targetKeyword,
      sourceUrls: normalizedInput.sourceUrls,
      hasSiteContent: !!normalizedInput.siteContent,
      durationMs: inputDuration,
    });

    // Validate normalized input
    const validation = articleInputHandler.validateInput(normalizedInput);
    if (!validation.valid) {
      logger.error('InputHandler', '入力バリデーション失敗', { errors: validation.errors });
      return {
        success: false,
        error: validation.errors.join(', '),
        logs: logger.logs,
      };
    }

    // Step 2: Generate article using ArticleGenerator
    logger.info('ArticleGenerator', '記事生成を開始', {
      hasSiteContent: !!normalizedInput.siteContent,
      hasAdditionalContext: !!normalizedInput.additionalContext,
    });

    const articleGenerator = new ArticleGenerator();
    const result = await articleGenerator.generate({
      targetKeyword: normalizedInput.targetKeyword,
      productName: normalizedInput.productName,
      productDescription: normalizedInput.productDescription,
      articleType: input.articleType,
      language: normalizedInput.language,
      includeImages: input.includeImages,
      logger,
      // Pass enrichment data from InputHandler
      siteContent: normalizedInput.siteContent,
      additionalContext: normalizedInput.additionalContext,
      // Pass LLM client based on model selection
      llmClient,
      claudeProvider,
    });

    // Extract logs from result
    const { logs: generatorLogs, ...article } = result;

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
      inputMode: input.inputMode,
      sourceUrls: normalizedInput.sourceUrls,
      // Model info
      llmModel: modelConfig.modelId,
      llmProvider: modelConfig.provider,
      llmApiMode: modelConfig.apiMode,
    };

    // Convert thumbnail Buffer to Base64 for UI display
    let thumbnailBase64: string | undefined;
    if (article.thumbnail?.imageData && article.thumbnail.imageData.length > 0) {
      thumbnailBase64 = `data:image/png;base64,${article.thumbnail.imageData.toString('base64')}`;
      logger.info('Action', 'サムネイル画像をBase64変換', {
        originalSize: article.thumbnail.imageData.length,
        base64Length: thumbnailBase64.length,
      });
    }

    logger.success('Action', '記事生成アクション完了', {
      title: article.title,
      wordCount,
      timeMs: generationTimeMs,
      logCount: logger.logs.length,
      hasThumbnail: !!thumbnailBase64,
    });

    return {
      success: true,
      article,
      metadata,
      logs: logger.logs,
      thumbnailBase64,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Action', '記事生成アクション失敗', { error: errorMessage });

    return {
      success: false,
      error: errorMessage,
      logs: logger.logs,
    };
  }
}
