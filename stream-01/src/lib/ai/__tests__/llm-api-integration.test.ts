/**
 * LLM API Integration Tests
 *
 * 実際のAPIを呼び出してLLMクライアントの動作を確認するテスト
 *
 * 実行方法:
 *   GEMINI_API_KEY=xxx npm test -- llm-api-integration.test.ts
 *   ANTHROPIC_API_KEY=xxx npm test -- llm-api-integration.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { LLMClient, LLM_MODELS, type LLMModelKey } from '../llm-client';

// テスト実行条件
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const hasGeminiKey = GEMINI_API_KEY.length > 0;
const hasAnthropicKey = ANTHROPIC_API_KEY.length > 0;

// 簡単なテストプロンプト
const TEST_PROMPT = 'Say "Hello, World!" and nothing else.';

describe('LLM API Integration Tests', () => {
  describe('Model Configuration', () => {
    it('should have all expected models defined', () => {
      const expectedModels: LLMModelKey[] = [
        'gemini-3-pro',
        'gemini-3-flash',
        'claude-sonnet-4.5',
        'claude-opus-4.5',
        'claude-haiku-4.5',
      ];

      expectedModels.forEach((model) => {
        expect(LLM_MODELS[model]).toBeDefined();
        expect(LLM_MODELS[model].id).toBeDefined();
        expect(LLM_MODELS[model].provider).toBeDefined();
        expect(LLM_MODELS[model].name).toBeDefined();
      });
    });

    it('should return correct model info', () => {
      const client = new LLMClient({ model: 'gemini-3-flash' });
      const info = client.getModelInfo();

      expect(info.provider).toBe('google');
      expect(info.name).toBe('Gemini 3 Flash');
    });
  });

  describe('Google Gemini 3 API', () => {
    beforeAll(() => {
      if (!hasGeminiKey) {
        console.log('⚠️ GEMINI_API_KEY not set, skipping Gemini tests');
      }
    });

    it.skipIf(!hasGeminiKey)('gemini-3-flash: should respond to a simple prompt', async () => {
      const client = new LLMClient({
        model: 'gemini-3-flash',
        apiKey: GEMINI_API_KEY,
      });

      console.log('Testing gemini-3-flash...');
      const response = await client.prompt('You are a helpful assistant.', TEST_PROMPT);

      console.log(`Response: ${response}`);
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
      expect(response.toLowerCase()).toContain('hello');
    }, 30000);

    it.skipIf(!hasGeminiKey)('gemini-3-pro: should respond to a simple prompt', async () => {
      const client = new LLMClient({
        model: 'gemini-3-pro',
        apiKey: GEMINI_API_KEY,
      });

      console.log('Testing gemini-3-pro...');
      const response = await client.prompt('You are a helpful assistant.', TEST_PROMPT);

      console.log(`Response: ${response}`);
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    }, 60000);

    it.skipIf(!hasGeminiKey)('should return JSON response correctly', async () => {
      const client = new LLMClient({
        model: 'gemini-3-flash',
        apiKey: GEMINI_API_KEY,
      });

      console.log('Testing JSON response...');
      const response = await client.jsonPrompt<{ greeting: string }>(
        'You are a helpful assistant.',
        'Return a JSON object with a "greeting" field containing "Hello".'
      );

      console.log(`JSON Response: ${JSON.stringify(response)}`);
      expect(response).toBeDefined();
      expect(response.greeting).toBeDefined();
    }, 30000);
  });

  describe('Anthropic Claude 4.5 API', () => {
    beforeAll(() => {
      if (!hasAnthropicKey) {
        console.log('⚠️ ANTHROPIC_API_KEY not set, skipping Claude tests');
      }
    });

    it.skipIf(!hasAnthropicKey)('claude-haiku-4.5: should respond to a simple prompt', async () => {
      const client = new LLMClient({
        model: 'claude-haiku-4.5',
        apiKey: ANTHROPIC_API_KEY,
      });

      console.log('Testing claude-haiku-4.5...');
      const response = await client.prompt('You are a helpful assistant.', TEST_PROMPT);

      console.log(`Response: ${response}`);
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
      expect(response.toLowerCase()).toContain('hello');
    }, 30000);

    it.skipIf(!hasAnthropicKey)('claude-sonnet-4.5: should respond to a simple prompt', async () => {
      const client = new LLMClient({
        model: 'claude-sonnet-4.5',
        apiKey: ANTHROPIC_API_KEY,
      });

      console.log('Testing claude-sonnet-4.5...');
      const response = await client.prompt('You are a helpful assistant.', TEST_PROMPT);

      console.log(`Response: ${response}`);
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    }, 60000);

    it.skipIf(!hasAnthropicKey)('claude-opus-4.5: should respond to a simple prompt', async () => {
      const client = new LLMClient({
        model: 'claude-opus-4.5',
        apiKey: ANTHROPIC_API_KEY,
      });

      console.log('Testing claude-opus-4.5...');
      const response = await client.prompt('You are a helpful assistant.', TEST_PROMPT);

      console.log(`Response: ${response}`);
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    }, 90000);

    it.skipIf(!hasAnthropicKey)('should return JSON response correctly', async () => {
      const client = new LLMClient({
        model: 'claude-haiku-4.5',
        apiKey: ANTHROPIC_API_KEY,
      });

      console.log('Testing JSON response...');
      const response = await client.jsonPrompt<{ greeting: string }>(
        'You are a helpful assistant.',
        'Return a JSON object with a "greeting" field containing "Hello".'
      );

      console.log(`JSON Response: ${JSON.stringify(response)}`);
      expect(response).toBeDefined();
      expect(response.greeting).toBeDefined();
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid API key gracefully', async () => {
      const client = new LLMClient({
        model: 'gemini-3-flash',
        apiKey: 'invalid-key-12345',
      });

      await expect(client.prompt('System', 'Test')).rejects.toThrow();
    }, 30000);

    it('should fallback to default model for unknown model key', () => {
      const client = new LLMClient({
        model: 'unknown-model-xyz',
        apiKey: 'test-key',
      });

      const info = client.getModelInfo();
      expect(info.name).toBe('Gemini 3 Flash'); // デフォルトにフォールバック
    });
  });
});
