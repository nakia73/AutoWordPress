// Argo Note - Claude Batch API Client
// Message Batches APIを使用した非同期バッチ処理
//
// 重要: Claude APIは常にBatch APIを使用（ストリーミング/同期API不使用）
// - 1記事の生成でもBatch APIを使用し、50%のコスト削減を実現
// - リアルタイム応答は不要なため、処理時間より価格を優先
//
// 仕様: docs/architecture/05_Claude_Batch_API.md

import Anthropic from '@anthropic-ai/sdk';
import type {
  MessageBatch,
  MessageBatchIndividualResponse,
} from '@anthropic-ai/sdk/resources/messages/batches';

// ============================================
// 型定義
// ============================================

export interface BatchRequest {
  customId: string;
  model?: string;
  maxTokens?: number;
  system?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
}

export interface BatchCreateResult {
  batchId: string;
  status: string;
  requestCounts: {
    processing: number;
    succeeded: number;
    errored: number;
    canceled: number;
    expired: number;
  };
  createdAt: string;
  expiresAt: string;
}

export interface BatchResultItem {
  customId: string;
  type: 'succeeded' | 'errored' | 'canceled' | 'expired';
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: {
    type: string;
    message: string;
  };
}

export interface BatchStatus {
  batchId: string;
  processingStatus: 'in_progress' | 'canceling' | 'ended';
  requestCounts: {
    processing: number;
    succeeded: number;
    errored: number;
    canceled: number;
    expired: number;
  };
  resultsUrl: string | null;
  createdAt: string;
  endedAt: string | null;
}

// ============================================
// 設定
// ============================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_MAX_TOKENS = 4096;
const POLL_INTERVAL_MS = 60000; // 60秒

// ============================================
// Claude Batch Client
// ============================================

export class ClaudeBatchClient {
  private client: Anthropic;
  private defaultModel: string;

  constructor(options?: { apiKey?: string; defaultModel?: string }) {
    const apiKey = options?.apiKey || ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for Claude Batch API');
    }

    this.client = new Anthropic({ apiKey });
    this.defaultModel = options?.defaultModel || DEFAULT_MODEL;
  }

  /**
   * バッチを作成
   */
  async createBatch(requests: BatchRequest[]): Promise<BatchCreateResult> {
    if (requests.length === 0) {
      throw new Error('At least one request is required');
    }

    if (requests.length > 100000) {
      throw new Error('Maximum 100,000 requests per batch');
    }

    const batchRequests = requests.map((req) => ({
      custom_id: req.customId,
      params: {
        model: req.model || this.defaultModel,
        max_tokens: req.maxTokens || DEFAULT_MAX_TOKENS,
        system: req.system,
        messages: req.messages,
        temperature: req.temperature,
      },
    }));

    const batch = await this.client.messages.batches.create({
      requests: batchRequests,
    });

    return this.mapBatchToResult(batch);
  }

  /**
   * バッチステータスを取得
   */
  async getBatchStatus(batchId: string): Promise<BatchStatus> {
    const batch = await this.client.messages.batches.retrieve(batchId);

    return {
      batchId: batch.id,
      processingStatus: batch.processing_status,
      requestCounts: {
        processing: batch.request_counts.processing,
        succeeded: batch.request_counts.succeeded,
        errored: batch.request_counts.errored,
        canceled: batch.request_counts.canceled,
        expired: batch.request_counts.expired,
      },
      resultsUrl: batch.results_url,
      createdAt: batch.created_at,
      endedAt: batch.ended_at,
    };
  }

  /**
   * バッチ完了まで待機（ポーリング）
   */
  async waitForCompletion(
    batchId: string,
    options?: {
      pollIntervalMs?: number;
      maxWaitMs?: number;
      onProgress?: (status: BatchStatus) => void;
    }
  ): Promise<BatchStatus> {
    const pollInterval = options?.pollIntervalMs || POLL_INTERVAL_MS;
    const maxWait = options?.maxWaitMs || 24 * 60 * 60 * 1000; // 24時間
    const startTime = Date.now();

    while (true) {
      const status = await this.getBatchStatus(batchId);

      if (options?.onProgress) {
        options.onProgress(status);
      }

      if (status.processingStatus === 'ended') {
        return status;
      }

      if (Date.now() - startTime > maxWait) {
        throw new Error(`Batch ${batchId} did not complete within ${maxWait}ms`);
      }

      await this.sleep(pollInterval);
    }
  }

  /**
   * バッチ結果を取得（ストリーミング）
   */
  async *getResults(batchId: string): AsyncGenerator<BatchResultItem> {
    const results = await this.client.messages.batches.results(batchId);

    for await (const result of results) {
      yield this.mapResultItem(result);
    }
  }

  /**
   * バッチ結果を配列として取得
   */
  async getAllResults(batchId: string): Promise<BatchResultItem[]> {
    const results: BatchResultItem[] = [];

    for await (const result of this.getResults(batchId)) {
      results.push(result);
    }

    return results;
  }

  /**
   * バッチをキャンセル
   */
  async cancelBatch(batchId: string): Promise<BatchStatus> {
    const batch = await this.client.messages.batches.cancel(batchId);

    return {
      batchId: batch.id,
      processingStatus: batch.processing_status,
      requestCounts: {
        processing: batch.request_counts.processing,
        succeeded: batch.request_counts.succeeded,
        errored: batch.request_counts.errored,
        canceled: batch.request_counts.canceled,
        expired: batch.request_counts.expired,
      },
      resultsUrl: batch.results_url,
      createdAt: batch.created_at,
      endedAt: batch.ended_at,
    };
  }

  /**
   * バッチ一覧を取得
   */
  async listBatches(limit: number = 20): Promise<BatchStatus[]> {
    const batches: BatchStatus[] = [];

    for await (const batch of this.client.messages.batches.list({ limit })) {
      batches.push({
        batchId: batch.id,
        processingStatus: batch.processing_status,
        requestCounts: {
          processing: batch.request_counts.processing,
          succeeded: batch.request_counts.succeeded,
          errored: batch.request_counts.errored,
          canceled: batch.request_counts.canceled,
          expired: batch.request_counts.expired,
        },
        resultsUrl: batch.results_url,
        createdAt: batch.created_at,
        endedAt: batch.ended_at,
      });
    }

    return batches;
  }

  // ============================================
  // ヘルパーメソッド
  // ============================================

  private mapBatchToResult(batch: MessageBatch): BatchCreateResult {
    return {
      batchId: batch.id,
      status: batch.processing_status,
      requestCounts: {
        processing: batch.request_counts.processing,
        succeeded: batch.request_counts.succeeded,
        errored: batch.request_counts.errored,
        canceled: batch.request_counts.canceled,
        expired: batch.request_counts.expired,
      },
      createdAt: batch.created_at,
      expiresAt: batch.expires_at,
    };
  }

  private mapResultItem(result: MessageBatchIndividualResponse): BatchResultItem {
    const baseResult: BatchResultItem = {
      customId: result.custom_id,
      type: result.result.type as BatchResultItem['type'],
    };

    if (result.result.type === 'succeeded' && result.result.message) {
      const message = result.result.message;
      const textContent = message.content.find((c) => c.type === 'text');

      return {
        ...baseResult,
        content: textContent?.type === 'text' ? textContent.text : undefined,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
      };
    }

    if (result.result.type === 'errored' && result.result.error) {
      return {
        ...baseResult,
        error: {
          type: result.result.error.type,
          message: result.result.error.message,
        },
      };
    }

    return baseResult;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// 記事生成用ヘルパー
// ============================================

export interface ArticleBatchRequest {
  articleId: string;
  keyword: string;
  productName?: string;
  productDescription?: string;
  language?: 'ja' | 'en';
}

export interface ArticleBatchResult {
  articleId: string;
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * 記事生成用のバッチリクエストを作成
 */
export function createArticleBatchRequests(
  articles: ArticleBatchRequest[],
  options?: { model?: string; maxTokens?: number }
): BatchRequest[] {
  const systemPrompt = `あなたはSEO最適化された高品質な記事を生成する専門家です。
以下の指示に従って記事を生成してください：
- 読者にとって価値のある情報を提供する
- 自然なキーワード配置（キーワードスタッフィングを避ける）
- 明確な見出し構造（H2, H3）を使用
- 具体例やデータを含める
- 読みやすい段落構成`;

  return articles.map((article) => ({
    customId: article.articleId,
    model: options?.model,
    maxTokens: options?.maxTokens || 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user' as const,
        content: `以下の条件で記事を生成してください：

キーワード: ${article.keyword}
${article.productName ? `商品名: ${article.productName}` : ''}
${article.productDescription ? `商品説明: ${article.productDescription}` : ''}
言語: ${article.language === 'en' ? '英語' : '日本語'}

記事を生成してください。HTMLフォーマットで出力し、<article>タグで囲んでください。`,
      },
    ],
  }));
}

/**
 * バッチ結果を記事結果に変換
 */
export function mapBatchResultsToArticles(
  results: BatchResultItem[]
): ArticleBatchResult[] {
  return results.map((result) => ({
    articleId: result.customId,
    success: result.type === 'succeeded',
    content: result.content,
    error:
      result.type === 'errored'
        ? result.error?.message
        : result.type === 'expired'
          ? 'Request expired (24h timeout)'
          : result.type === 'canceled'
            ? 'Request was canceled'
            : undefined,
    usage: result.usage,
  }));
}

// デフォルトインスタンス（API キーが設定されている場合）
let defaultClient: ClaudeBatchClient | null = null;

export function getClaudeBatchClient(): ClaudeBatchClient {
  if (!defaultClient) {
    defaultClient = new ClaudeBatchClient();
  }
  return defaultClient;
}
