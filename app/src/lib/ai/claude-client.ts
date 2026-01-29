/**
 * Claude Sync API Client
 * =======================
 * Anthropic Messages APIの同期クライアントモジュール
 *
 * 責務:
 * - 同期的なメッセージAPI呼び出し
 * - リアルタイム応答が必要なユースケース対応
 *
 * 特徴:
 * - 即座にレスポンスを取得
 * - Web UIからの直接リクエストに最適
 * - ストリーミング対応可能
 *
 * 依存:
 * - @anthropic-ai/sdk のみ（外部依存最小）
 *
 * 使用例:
 * ```typescript
 * const client = new ClaudeSyncClient();
 * const response = await client.complete({
 *   system: 'You are a helpful assistant.',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * console.log(response.content);
 * ```
 *
 * Batch APIとの切り替え:
 * ```typescript
 * // 共通インターフェースを使用
 * const provider: ClaudeProvider = useBatch
 *   ? new ClaudeBatchProvider()
 *   : new ClaudeSyncProvider();
 *
 * const result = await provider.complete(request);
 * ```
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================
// 共通インターフェース（Batch/Sync切り替え用）
// ============================================

/**
 * Claude APIへのリクエスト（共通形式）
 */
export interface ClaudeRequest {
  model?: string;
  maxTokens?: number;
  system?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
}

/**
 * Claude APIからのレスポンス（共通形式）
 */
export interface ClaudeResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason?: string;
}

/**
 * Claude APIプロバイダーの共通インターフェース
 * Batch APIとSync APIで同じインターフェースを実装
 */
export interface ClaudeProvider {
  /**
   * メッセージを送信してレスポンスを取得
   */
  complete(request: ClaudeRequest): Promise<ClaudeResponse>;

  /**
   * プロバイダーの種類を取得
   */
  getProviderType(): 'sync' | 'batch';
}

// ============================================
// 設定（環境変数から読み込み）
// ============================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_MAX_TOKENS = 4096;

// 同期API用タイムアウト（デフォルト60秒）
const SYNC_TIMEOUT_MS =
  parseInt(process.env.CLAUDE_SYNC_TIMEOUT_SECONDS || '60', 10) * 1000;

// Batch API用設定
const BATCH_POLL_INTERVAL_MS =
  parseInt(process.env.CLAUDE_BATCH_POLL_INTERVAL_SECONDS || '60', 10) * 1000;
const BATCH_MAX_WAIT_MS =
  parseInt(process.env.CLAUDE_BATCH_MAX_WAIT_SECONDS || '3600', 10) * 1000;

// ============================================
// Claude Sync Client
// ============================================

export interface ClaudeSyncClientOptions {
  apiKey?: string;
  defaultModel?: string;
  timeoutMs?: number;
}

export class ClaudeSyncClient implements ClaudeProvider {
  private client: Anthropic;
  private defaultModel: string;
  private timeoutMs: number;

  constructor(options?: ClaudeSyncClientOptions) {
    const apiKey = options?.apiKey || ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for Claude Sync API');
    }

    this.client = new Anthropic({ apiKey });
    this.defaultModel = options?.defaultModel || DEFAULT_MODEL;
    this.timeoutMs = options?.timeoutMs || SYNC_TIMEOUT_MS;
  }

  getProviderType(): 'sync' | 'batch' {
    return 'sync';
  }

  /**
   * メッセージを送信してレスポンスを取得（同期）
   */
  async complete(request: ClaudeRequest): Promise<ClaudeResponse> {
    const response = await this.client.messages.create({
      model: request.model || this.defaultModel,
      max_tokens: request.maxTokens || DEFAULT_MAX_TOKENS,
      system: request.system,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
    });

    // テキストコンテンツを抽出
    const textContent = response.content.find((c) => c.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      stopReason: response.stop_reason || undefined,
    };
  }

  /**
   * ストリーミングでメッセージを送信
   * 部分的なレスポンスをコールバックで受け取る
   */
  async *stream(
    request: ClaudeRequest
  ): AsyncGenerator<{ type: 'text' | 'done'; text?: string; response?: ClaudeResponse }> {
    const stream = await this.client.messages.stream({
      model: request.model || this.defaultModel,
      max_tokens: request.maxTokens || DEFAULT_MAX_TOKENS,
      system: request.system,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta;
        if ('text' in delta) {
          yield { type: 'text', text: delta.text };
        }
      }
    }

    // 最終レスポンスを取得
    const finalMessage = await stream.finalMessage();
    const textContent = finalMessage.content.find((c) => c.type === 'text');
    const content = textContent?.type === 'text' ? textContent.text : '';

    yield {
      type: 'done',
      response: {
        content,
        usage: {
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
        },
        stopReason: finalMessage.stop_reason || undefined,
      },
    };
  }
}

// ============================================
// Batch API用プロバイダーアダプター
// ============================================

import { ClaudeBatchClient, executeSingleRequest } from './claude-batch-client';

export interface ClaudeBatchProviderOptions {
  apiKey?: string;
  defaultModel?: string;
  pollIntervalMs?: number;
  maxWaitMs?: number;
}

/**
 * Batch APIを共通インターフェースで使用するためのアダプター
 */
export class ClaudeBatchProvider implements ClaudeProvider {
  private batchClient: ClaudeBatchClient;
  private defaultModel: string;
  private pollIntervalMs: number;
  private maxWaitMs: number;

  constructor(options?: ClaudeBatchProviderOptions) {
    this.batchClient = new ClaudeBatchClient({
      apiKey: options?.apiKey,
      defaultModel: options?.defaultModel,
    });
    this.defaultModel = options?.defaultModel || DEFAULT_MODEL;
    this.pollIntervalMs = options?.pollIntervalMs || BATCH_POLL_INTERVAL_MS;
    this.maxWaitMs = options?.maxWaitMs || BATCH_MAX_WAIT_MS;
  }

  getProviderType(): 'sync' | 'batch' {
    return 'batch';
  }

  /**
   * Batch API経由でメッセージを送信
   * 内部でバッチ作成→待機→結果取得を行う
   */
  async complete(request: ClaudeRequest): Promise<ClaudeResponse> {
    const result = await executeSingleRequest(
      this.batchClient,
      request.system,
      request.messages,
      {
        model: request.model || this.defaultModel,
        maxTokens: request.maxTokens || DEFAULT_MAX_TOKENS,
        temperature: request.temperature ?? 0.7,
        pollIntervalMs: this.pollIntervalMs,
        maxWaitMs: this.maxWaitMs,
      }
    );

    return {
      content: result.content,
      usage: result.usage || { inputTokens: 0, outputTokens: 0 },
    };
  }
}

// ============================================
// ファクトリー関数
// ============================================

export type ClaudeProviderType = 'sync' | 'batch' | 'auto';

export interface CreateClaudeProviderOptions {
  type?: ClaudeProviderType;
  apiKey?: string;
  defaultModel?: string;
  // Sync固有
  timeoutMs?: number;
  // Batch固有
  pollIntervalMs?: number;
  maxWaitMs?: number;
}

/**
 * ユースケースに応じたClaudeプロバイダーを作成
 *
 * @param options.type - 'sync'（即座応答）, 'batch'（50%コスト削減）, 'auto'（環境変数で決定）
 *
 * 使用例:
 * ```typescript
 * // Web UIからのリアルタイムリクエスト
 * const syncProvider = createClaudeProvider({ type: 'sync' });
 *
 * // バックグラウンドジョブ（コスト優先）
 * const batchProvider = createClaudeProvider({ type: 'batch' });
 *
 * // 環境変数で切り替え
 * const autoProvider = createClaudeProvider({ type: 'auto' });
 * ```
 */
export function createClaudeProvider(options?: CreateClaudeProviderOptions): ClaudeProvider {
  const type = options?.type || 'auto';

  // 'auto'の場合は環境変数で決定
  const resolvedType: 'sync' | 'batch' =
    type === 'auto'
      ? process.env.CLAUDE_API_MODE === 'sync'
        ? 'sync'
        : 'batch' // デフォルトはbatch（コスト優先）
      : type;

  if (resolvedType === 'sync') {
    return new ClaudeSyncClient({
      apiKey: options?.apiKey,
      defaultModel: options?.defaultModel,
      timeoutMs: options?.timeoutMs,
    });
  }

  return new ClaudeBatchProvider({
    apiKey: options?.apiKey,
    defaultModel: options?.defaultModel,
    pollIntervalMs: options?.pollIntervalMs,
    maxWaitMs: options?.maxWaitMs,
  });
}

// ============================================
// デフォルトインスタンス
// ============================================

let defaultSyncClient: ClaudeSyncClient | null = null;

export function getClaudeSyncClient(): ClaudeSyncClient {
  if (!defaultSyncClient) {
    defaultSyncClient = new ClaudeSyncClient();
  }
  return defaultSyncClient;
}
