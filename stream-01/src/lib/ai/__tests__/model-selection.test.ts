/**
 * Model Selection E2E Tests
 * ==========================
 * モデル選択フロー（Gemini/Claude Batch/Sync）のE2Eテスト
 *
 * テスト対象:
 * 1. ModelSelector.parseModelId() の正確性
 * 2. actions.ts でのLLMクライアント生成
 * 3. ArticleGenerator へのLLMプロバイダー注入
 * 4. 各プロバイダーでの実際のAPI呼び出し
 *
 * 実行方法:
 * - Unit tests: npm test
 * - Integration tests: INTEGRATION=true npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================
// Unit Tests - モデル選択ロジック
// ============================================

describe('ModelSelector - parseModelId', () => {
  it('should parse Gemini Flash model correctly', async () => {
    const { parseModelId } = await import('@/components/article-gen/ModelSelector');

    const result = parseModelId('gemini-3-flash');

    expect(result).toEqual({
      model: 'gemini-3-flash',
      provider: 'google',
      apiMode: undefined,
    });
  });

  it('should parse Gemini Pro model correctly', async () => {
    const { parseModelId } = await import('@/components/article-gen/ModelSelector');

    const result = parseModelId('gemini-3-pro');

    expect(result).toEqual({
      model: 'gemini-3-pro',
      provider: 'google',
      apiMode: undefined,
    });
  });

  it('should parse Claude Haiku Batch model correctly', async () => {
    const { parseModelId } = await import('@/components/article-gen/ModelSelector');

    const result = parseModelId('claude-haiku-4.5-batch');

    expect(result).toEqual({
      model: 'claude-haiku-4.5',
      provider: 'anthropic',
      apiMode: 'batch',
    });
  });

  it('should parse Claude Sonnet Batch model correctly', async () => {
    const { parseModelId } = await import('@/components/article-gen/ModelSelector');

    const result = parseModelId('claude-sonnet-4.5-batch');

    expect(result).toEqual({
      model: 'claude-sonnet-4.5',
      provider: 'anthropic',
      apiMode: 'batch',
    });
  });

  it('should parse Claude Haiku Sync model correctly', async () => {
    const { parseModelId } = await import('@/components/article-gen/ModelSelector');

    const result = parseModelId('claude-haiku-4.5-sync');

    expect(result).toEqual({
      model: 'claude-haiku-4.5',
      provider: 'anthropic',
      apiMode: 'sync',
    });
  });

  it('should parse Claude Sonnet Sync model correctly', async () => {
    const { parseModelId } = await import('@/components/article-gen/ModelSelector');

    const result = parseModelId('claude-sonnet-4.5-sync');

    expect(result).toEqual({
      model: 'claude-sonnet-4.5',
      provider: 'anthropic',
      apiMode: 'sync',
    });
  });

  it('should fallback to Gemini Flash for unknown model', async () => {
    const { parseModelId } = await import('@/components/article-gen/ModelSelector');

    const result = parseModelId('unknown-model');

    expect(result).toEqual({
      model: 'gemini-3-flash',
      provider: 'google',
      apiMode: undefined,
    });
  });
});

describe('LLM_MODEL_OPTIONS', () => {
  it('should have all 6 model options', async () => {
    const { LLM_MODEL_OPTIONS } = await import('@/components/article-gen/ModelSelector');

    expect(LLM_MODEL_OPTIONS).toHaveLength(6);
  });

  it('should have correct providers assigned', async () => {
    const { LLM_MODEL_OPTIONS } = await import('@/components/article-gen/ModelSelector');

    const googleModels = LLM_MODEL_OPTIONS.filter(m => m.provider === 'google');
    const anthropicModels = LLM_MODEL_OPTIONS.filter(m => m.provider === 'anthropic');

    expect(googleModels).toHaveLength(2);
    expect(anthropicModels).toHaveLength(4);
  });

  it('should have batch/sync modes for Claude models', async () => {
    const { LLM_MODEL_OPTIONS } = await import('@/components/article-gen/ModelSelector');

    const batchModels = LLM_MODEL_OPTIONS.filter(m => m.apiMode === 'batch');
    const syncModels = LLM_MODEL_OPTIONS.filter(m => m.apiMode === 'sync');

    expect(batchModels).toHaveLength(2);
    expect(syncModels).toHaveLength(2);
  });
});

// ============================================
// Unit Tests - Claude Provider Factory
// ============================================

describe('createClaudeProvider', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should create sync provider when type is sync', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');

    const { createClaudeProvider } = await import('../claude-client');

    const provider = createClaudeProvider({ type: 'sync', apiKey: 'test-key' });

    expect(provider.getProviderType()).toBe('sync');
  });

  it('should create batch provider when type is batch', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');

    const { createClaudeProvider } = await import('../claude-client');

    const provider = createClaudeProvider({ type: 'batch', apiKey: 'test-key' });

    expect(provider.getProviderType()).toBe('batch');
  });

  it('should default to batch when type is auto and no env var', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
    vi.stubEnv('CLAUDE_API_MODE', '');

    const { createClaudeProvider } = await import('../claude-client');

    const provider = createClaudeProvider({ type: 'auto', apiKey: 'test-key' });

    expect(provider.getProviderType()).toBe('batch');
  });
});

// ============================================
// Unit Tests - ArticleGenerator LLM Provider
// ============================================

describe('ArticleGenerator - LLM Provider Injection', () => {
  it('should use injected LLMClient when provided', async () => {
    const mockComplete = vi.fn().mockResolvedValue('{"title":"Test","sections":[]}');
    const mockLlmClient = {
      complete: mockComplete,
      prompt: vi.fn().mockResolvedValue('test'),
      jsonPrompt: vi.fn().mockResolvedValue({ title: 'Test', sections: [] }),
    };

    const { ArticleGenerator } = await import('../article-generator');
    const generator = new ArticleGenerator();

    // Access private method via reflection for testing
    const getLLMProvider = (generator as any).getLLMProvider.bind(generator);
    const provider = getLLMProvider({ llmClient: mockLlmClient } as any);

    expect(provider).toBe(mockLlmClient);
  });

  it('should use ClaudeProviderAdapter when claudeProvider is provided', async () => {
    const mockClaudeProvider = {
      complete: vi.fn().mockResolvedValue({ content: 'test', usage: { inputTokens: 0, outputTokens: 0 } }),
      getProviderType: vi.fn().mockReturnValue('sync'),
    };

    const { ArticleGenerator } = await import('../article-generator');
    const generator = new ArticleGenerator();

    const getLLMProvider = (generator as any).getLLMProvider.bind(generator);
    const provider = getLLMProvider({ claudeProvider: mockClaudeProvider } as any);

    // Should return an adapter, not the mock directly
    expect(provider).not.toBe(mockClaudeProvider);
    expect(typeof provider.complete).toBe('function');
    expect(typeof provider.prompt).toBe('function');
    expect(typeof provider.jsonPrompt).toBe('function');
  });
});

// ============================================
// Integration Tests - Real API Calls
// ============================================

const shouldRunIntegration = process.env.INTEGRATION === 'true';
const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
const hasGoogleKey = !!process.env.GOOGLE_API_KEY;

const describeIntegration = shouldRunIntegration ? describe : describe.skip;

describeIntegration('Model Selection Integration Tests', () => {
  describe('Gemini Model', () => {
    it.skipIf(!hasGoogleKey)('should complete with Gemini Flash', async () => {
      const { LLMClient } = await import('../llm-client');
      const client = new LLMClient({ model: 'gemini-3-flash' });

      const result = await client.complete([
        { role: 'user', content: 'Say "Hello" and nothing else.' },
      ]);

      expect(result).toBeDefined();
      expect(result.toLowerCase()).toContain('hello');
    }, 30000);
  });

  describe('Claude Sync API', () => {
    it.skipIf(!hasAnthropicKey)('should complete with Claude Sync', async () => {
      const { createClaudeProvider } = await import('../claude-client');
      const provider = createClaudeProvider({ type: 'sync' });

      expect(provider.getProviderType()).toBe('sync');

      const response = await provider.complete({
        messages: [{ role: 'user', content: 'Say "Hello" and nothing else.' }],
        maxTokens: 50,
      });

      expect(response).toBeDefined();
      expect(response.content.toLowerCase()).toContain('hello');
    }, 30000);
  });

  describe('Claude Batch API', () => {
    it.skipIf(!hasAnthropicKey)('should complete with Claude Batch', async () => {
      const { createClaudeProvider } = await import('../claude-client');
      const provider = createClaudeProvider({ type: 'batch' });

      expect(provider.getProviderType()).toBe('batch');

      // Batch API takes longer
      const response = await provider.complete({
        messages: [{ role: 'user', content: 'Say "Hello" and nothing else.' }],
        maxTokens: 50,
      });

      expect(response).toBeDefined();
      expect(response.content.toLowerCase()).toContain('hello');
    }, 120000); // 2 minutes for batch processing
  });
});
