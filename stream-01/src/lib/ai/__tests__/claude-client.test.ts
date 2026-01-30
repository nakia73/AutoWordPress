import { describe, it, expect, vi, beforeEach } from 'vitest';

// モック設定
vi.mock('@anthropic-ai/sdk', () => {
  // クラスとしてモック
  class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Mocked response' }],
        usage: { input_tokens: 10, output_tokens: 20 },
        stop_reason: 'end_turn',
      }),
      stream: vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'content_block_delta', delta: { text: 'Hello' } };
          yield { type: 'content_block_delta', delta: { text: ' World' } };
        },
        finalMessage: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Hello World' }],
          usage: { input_tokens: 5, output_tokens: 10 },
          stop_reason: 'end_turn',
        }),
      }),
    };
  }
  return { default: MockAnthropic };
});

// Batch clientのモック
vi.mock('../claude-batch-client', () => {
  class MockClaudeBatchClient {}
  return {
    ClaudeBatchClient: MockClaudeBatchClient,
    executeSingleRequest: vi.fn().mockResolvedValue({
      content: 'Batch response',
      usage: { inputTokens: 15, outputTokens: 25 },
    }),
  };
});

import {
  ClaudeSyncClient,
  ClaudeBatchProvider,
  createClaudeProvider,
  type ClaudeRequest,
  type ClaudeProvider,
} from '../claude-client';

// テスト用のAPIキー（モックなので実際には使われない）
const TEST_API_KEY = 'test-api-key';

describe('ClaudeSyncClient', () => {
  describe('constructor', () => {
    it('should throw error when API key is not provided', () => {
      // 環境変数もオプションもない場合
      const originalEnv = process.env.ANTHROPIC_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      expect(() => new ClaudeSyncClient()).toThrow('ANTHROPIC_API_KEY is required');

      process.env.ANTHROPIC_API_KEY = originalEnv;
    });

    it('should create client with API key option', () => {
      const client = new ClaudeSyncClient({ apiKey: TEST_API_KEY });
      expect(client.getProviderType()).toBe('sync');
    });

    it('should accept custom options', () => {
      const client = new ClaudeSyncClient({
        apiKey: TEST_API_KEY,
        defaultModel: 'claude-sonnet-4-5',
        timeoutMs: 30000,
      });
      expect(client.getProviderType()).toBe('sync');
    });
  });

  describe('complete()', () => {
    it('should return response with content and usage', async () => {
      const client = new ClaudeSyncClient({ apiKey: TEST_API_KEY });
      const request: ClaudeRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const response = await client.complete(request);

      expect(response.content).toBe('Mocked response');
      expect(response.usage.inputTokens).toBe(10);
      expect(response.usage.outputTokens).toBe(20);
      expect(response.stopReason).toBe('end_turn');
    });

    it('should pass model and temperature options', async () => {
      const client = new ClaudeSyncClient({ apiKey: TEST_API_KEY });
      const request: ClaudeRequest = {
        model: 'claude-sonnet-4-5',
        maxTokens: 2000,
        system: 'You are helpful',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.5,
      };

      const response = await client.complete(request);
      expect(response.content).toBeTruthy();
    });
  });

  describe('stream()', () => {
    it('should yield text chunks and final response', async () => {
      const client = new ClaudeSyncClient({ apiKey: TEST_API_KEY });
      const request: ClaudeRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const chunks: string[] = [];
      let finalResponse;

      for await (const event of client.stream(request)) {
        if (event.type === 'text' && event.text) {
          chunks.push(event.text);
        } else if (event.type === 'done') {
          finalResponse = event.response;
        }
      }

      expect(chunks).toEqual(['Hello', ' World']);
      expect(finalResponse?.content).toBe('Hello World');
      expect(finalResponse?.usage.inputTokens).toBe(5);
    });
  });
});

describe('ClaudeBatchProvider', () => {
  describe('constructor', () => {
    it('should create provider with batch type', () => {
      const provider = new ClaudeBatchProvider({ apiKey: TEST_API_KEY });
      expect(provider.getProviderType()).toBe('batch');
    });
  });

  describe('complete()', () => {
    it('should return response from batch client', async () => {
      const provider = new ClaudeBatchProvider({ apiKey: TEST_API_KEY });
      const request: ClaudeRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const response = await provider.complete(request);

      expect(response.content).toBe('Batch response');
      expect(response.usage.inputTokens).toBe(15);
      expect(response.usage.outputTokens).toBe(25);
    });
  });
});

describe('createClaudeProvider', () => {
  it('should create sync provider when type is sync', () => {
    const provider = createClaudeProvider({ type: 'sync', apiKey: TEST_API_KEY });
    expect(provider.getProviderType()).toBe('sync');
  });

  it('should create batch provider when type is batch', () => {
    const provider = createClaudeProvider({ type: 'batch', apiKey: TEST_API_KEY });
    expect(provider.getProviderType()).toBe('batch');
  });

  it('should create batch provider by default (auto mode with no env)', () => {
    const originalMode = process.env.CLAUDE_API_MODE;
    delete process.env.CLAUDE_API_MODE;

    const provider = createClaudeProvider({ type: 'auto', apiKey: TEST_API_KEY });
    expect(provider.getProviderType()).toBe('batch');

    process.env.CLAUDE_API_MODE = originalMode;
  });

  it('should create sync provider when CLAUDE_API_MODE=sync (auto mode)', () => {
    const originalMode = process.env.CLAUDE_API_MODE;
    process.env.CLAUDE_API_MODE = 'sync';

    const provider = createClaudeProvider({ type: 'auto', apiKey: TEST_API_KEY });
    expect(provider.getProviderType()).toBe('sync');

    process.env.CLAUDE_API_MODE = originalMode;
  });
});

describe('ClaudeProvider interface', () => {
  it('should allow switching between sync and batch providers', async () => {
    const request: ClaudeRequest = {
      system: 'You are helpful',
      messages: [{ role: 'user', content: 'Hello' }],
    };

    // 同じリクエストを両方のプロバイダーで実行可能
    const syncProvider: ClaudeProvider = new ClaudeSyncClient({ apiKey: TEST_API_KEY });
    const batchProvider: ClaudeProvider = new ClaudeBatchProvider({ apiKey: TEST_API_KEY });

    const syncResponse = await syncProvider.complete(request);
    const batchResponse = await batchProvider.complete(request);

    // 両方とも同じインターフェースでレスポンスを返す
    expect(syncResponse.content).toBeTruthy();
    expect(syncResponse.usage).toBeDefined();

    expect(batchResponse.content).toBeTruthy();
    expect(batchResponse.usage).toBeDefined();
  });

  it('should use same request format for both providers', async () => {
    const request: ClaudeRequest = {
      model: 'claude-haiku-4-5',
      maxTokens: 1000,
      system: 'You are a helpful assistant.',
      messages: [
        { role: 'user', content: 'What is 2+2?' },
        { role: 'assistant', content: 'That equals 4.' },
        { role: 'user', content: 'And 3+3?' },
      ],
      temperature: 0.5,
    };

    // リクエストフォーマットが共通であることを確認
    const syncProvider = new ClaudeSyncClient({ apiKey: TEST_API_KEY });
    const batchProvider = new ClaudeBatchProvider({ apiKey: TEST_API_KEY });

    // エラーなく両方で実行できることを確認
    await expect(syncProvider.complete(request)).resolves.toBeDefined();
    await expect(batchProvider.complete(request)).resolves.toBeDefined();
  });
});
