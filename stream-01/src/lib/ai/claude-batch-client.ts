/**
 * Claude Batch API Client
 * ========================
 * Anthropic Message Batches APIの独立したクライアントモジュール
 *
 * 責務:
 * - Batch APIのライフサイクル管理（作成、監視、結果取得、キャンセル）
 * - 汎用的なバッチ処理インターフェースの提供
 *
 * 特徴:
 * - 50%コスト削減（Batch API利用による）
 * - 最大100,000リクエスト/バッチ
 * - 24時間以内に処理完了
 *
 * 依存:
 * - @anthropic-ai/sdk のみ（外部依存最小）
 *
 * 使用例:
 * ```typescript
 * const client = new ClaudeBatchClient();
 * const batch = await client.createBatch([{ customId: 'req-1', messages: [...] }]);
 * await client.waitForCompletion(batch.batchId);
 * const results = await client.getAllResults(batch.batchId);
 * ```
 *
 * 仕様: docs/architecture/05_Claude_Batch_API.md
 */

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
      const errorObj = result.result.error as unknown as { type: string; message: string };
      return {
        ...baseResult,
        error: {
          type: errorObj.type,
          message: errorObj.message || 'Unknown error',
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
// 便利メソッド（単一リクエスト用）
// ============================================

export interface SingleRequestOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  pollIntervalMs?: number;
  maxWaitMs?: number;
  onProgress?: (status: BatchStatus) => void;
}

/**
 * 単一リクエストをバッチ経由で実行し、結果を返す
 * LLMClientからの呼び出しを簡略化するヘルパー
 */
export async function executeSingleRequest(
  client: ClaudeBatchClient,
  systemPrompt: string | undefined,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: SingleRequestOptions
): Promise<{ content: string; usage?: { inputTokens: number; outputTokens: number } }> {
  const customId = `single-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const batchRequest: BatchRequest = {
    customId,
    model: options?.model,
    maxTokens: options?.maxTokens ?? 4096,
    system: systemPrompt,
    messages,
    temperature: options?.temperature ?? 0.7,
  };

  // バッチを作成
  const batch = await client.createBatch([batchRequest]);

  // 完了まで待機
  await client.waitForCompletion(batch.batchId, {
    pollIntervalMs: options?.pollIntervalMs ?? 5000,
    maxWaitMs: options?.maxWaitMs ?? 10 * 60 * 1000,
    onProgress: options?.onProgress,
  });

  // 結果を取得
  const results = await client.getAllResults(batch.batchId);
  const result = results.find((r) => r.customId === customId);

  if (!result) {
    throw new Error(`Batch result not found for request ${customId}`);
  }

  if (result.type !== 'succeeded') {
    throw new Error(`Batch request failed: ${result.error?.message || result.type}`);
  }

  if (!result.content) {
    throw new Error('Batch result has no content');
  }

  return {
    content: result.content,
    usage: result.usage,
  };
}

// ============================================
// デフォルトインスタンス
// ============================================

// デフォルトインスタンス（API キーが設定されている場合）
let defaultClient: ClaudeBatchClient | null = null;

export function getClaudeBatchClient(): ClaudeBatchClient {
  if (!defaultClient) {
    defaultClient = new ClaudeBatchClient();
  }
  return defaultClient;
}
