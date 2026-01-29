/**
 * LLM Client Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMClient, ARTICLE_PROMPTS } from '../llm-client';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LLMClient', () => {
  let client: LLMClient;

  beforeEach(() => {
    client = new LLMClient({
      model: 'test-model',
      apiKey: 'test-api-key',
      baseUrl: 'https://test-api.com/v1',
    });
    mockFetch.mockReset();
  });

  describe('constructor', () => {
    it('should use provided options', () => {
      const customClient = new LLMClient({
        model: 'custom-model',
        apiKey: 'custom-key',
        baseUrl: 'https://custom-api.com',
      });
      expect(customClient).toBeDefined();
    });

    it('should use default values when options not provided', () => {
      const defaultClient = new LLMClient();
      expect(defaultClient).toBeDefined();
    });
  });

  describe('complete()', () => {
    it('should make a completion request with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test response' } }],
        }),
      });

      const result = await client.complete([
        { role: 'user', content: 'Hello' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
      expect(result).toBe('Test response');
    });

    it('should use custom temperature and maxTokens', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
        }),
      });

      await client.complete(
        [{ role: 'user', content: 'Test' }],
        { temperature: 0.5, maxTokens: 2048 }
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.temperature).toBe(0.5);
      expect(callBody.max_tokens).toBe(2048);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(client.complete([{ role: 'user', content: 'Test' }]))
        .rejects.toThrow('LLM API error: 500');
    });

    it('should return empty string when no content in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: {} }],
        }),
      });

      const result = await client.complete([{ role: 'user', content: 'Test' }]);
      expect(result).toBe('');
    });
  });

  describe('prompt()', () => {
    it('should format messages correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
        }),
      });

      await client.prompt('System prompt', 'User prompt');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.messages).toEqual([
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'User prompt' },
      ]);
    });
  });

  describe('jsonPrompt()', () => {
    it('should parse valid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"key": "value"}' } }],
        }),
      });

      const result = await client.jsonPrompt<{ key: string }>('System', 'User');
      expect(result).toEqual({ key: 'value' });
    });

    it('should strip markdown code blocks from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '```json\n{"key": "value"}\n```' } }],
        }),
      });

      const result = await client.jsonPrompt<{ key: string }>('System', 'User');
      expect(result).toEqual({ key: 'value' });
    });

    it('should strip generic code blocks', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '```\n{"key": "value"}\n```' } }],
        }),
      });

      const result = await client.jsonPrompt<{ key: string }>('System', 'User');
      expect(result).toEqual({ key: 'value' });
    });

    it('should throw error on invalid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'not valid json' } }],
        }),
      });

      await expect(client.jsonPrompt('System', 'User'))
        .rejects.toThrow('Failed to parse LLM JSON response');
    });

    it('should include JSON instruction in system prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{}' } }],
        }),
      });

      await client.jsonPrompt('Test system prompt', 'User');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.messages[0].content).toContain('Test system prompt');
      expect(callBody.messages[0].content).toContain('valid JSON only');
    });
  });
});

describe('ARTICLE_PROMPTS', () => {
  it('should have OUTLINE prompt', () => {
    expect(ARTICLE_PROMPTS.OUTLINE).toBeDefined();
    expect(ARTICLE_PROMPTS.OUTLINE).toContain('SEO');
    expect(ARTICLE_PROMPTS.OUTLINE).toContain('JSON');
  });

  it('should have CONTENT prompt', () => {
    expect(ARTICLE_PROMPTS.CONTENT).toBeDefined();
    expect(ARTICLE_PROMPTS.CONTENT).toContain('SEO');
    expect(ARTICLE_PROMPTS.CONTENT).toContain('HTML');
  });

  it('should have META_DESCRIPTION prompt', () => {
    expect(ARTICLE_PROMPTS.META_DESCRIPTION).toBeDefined();
    expect(ARTICLE_PROMPTS.META_DESCRIPTION).toContain('160 characters');
    expect(ARTICLE_PROMPTS.META_DESCRIPTION).toContain('keyword');
  });
});
