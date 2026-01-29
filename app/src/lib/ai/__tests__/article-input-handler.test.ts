/**
 * Article Input Handler Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticleInputHandler, type ArticleInput } from '../article-input-handler';

// Mock dependencies
vi.mock('../web-scraper', () => ({
  webScraper: {
    scrapeUrl: vi.fn(),
  },
}));

vi.mock('../llm-client', () => ({
  llmClient: {
    jsonPrompt: vi.fn(),
    prompt: vi.fn(),
  },
}));

describe('ArticleInputHandler', () => {
  let handler: ArticleInputHandler;

  beforeEach(() => {
    handler = new ArticleInputHandler();
    vi.clearAllMocks();
  });

  describe('normalize() - text mode', () => {
    it('should normalize text input directly', async () => {
      const input: ArticleInput = {
        mode: 'text',
        productName: 'TaskFlow',
        productDescription: 'A task management tool',
        targetKeyword: 'タスク管理ツール',
        language: 'ja',
      };

      const result = await handler.normalize(input);

      expect(result.productName).toBe('TaskFlow');
      expect(result.productDescription).toBe('A task management tool');
      expect(result.targetKeyword).toBe('タスク管理ツール');
      expect(result.language).toBe('ja');
      expect(result.inputMode).toBe('text');
      expect(result.sourceUrls).toHaveLength(0);
    });

    it('should include additional context when provided', async () => {
      const input: ArticleInput = {
        mode: 'text',
        productName: 'Product',
        productDescription: 'Description',
        targetKeyword: 'keyword',
        additionalContext: 'Extra info about the product',
      };

      const result = await handler.normalize(input);

      expect(result.additionalContext).toBe('Extra info about the product');
    });

    it('should default language to ja', async () => {
      const input: ArticleInput = {
        mode: 'text',
        productName: 'Product',
        productDescription: 'Description',
        targetKeyword: 'keyword',
      };

      const result = await handler.normalize(input);

      expect(result.language).toBe('ja');
    });
  });

  describe('normalize() - site_url mode', () => {
    it('should scrape and extract product info', async () => {
      const { webScraper } = await import('../web-scraper');
      const { llmClient } = await import('../llm-client');

      vi.mocked(webScraper.scrapeUrl).mockResolvedValueOnce({
        url: 'https://example.com',
        title: 'TaskFlow - Task Management',
        content: 'TaskFlow helps teams manage tasks efficiently...',
        success: true,
      });

      vi.mocked(llmClient.jsonPrompt).mockResolvedValueOnce({
        name: 'TaskFlow',
        description: 'A task management tool for teams',
      });

      vi.mocked(llmClient.prompt).mockResolvedValueOnce('タスク管理ツール');

      const input: ArticleInput = {
        mode: 'site_url',
        url: 'https://example.com',
        language: 'ja',
      };

      const result = await handler.normalize(input);

      expect(result.productName).toBe('TaskFlow');
      expect(result.productDescription).toBe('A task management tool for teams');
      expect(result.targetKeyword).toBe('タスク管理ツール');
      expect(result.inputMode).toBe('site_url');
      expect(result.sourceUrls).toContain('https://example.com');
      expect(result.siteContent).toBeDefined();
    });

    it('should use provided keyword when specified', async () => {
      const { webScraper } = await import('../web-scraper');
      const { llmClient } = await import('../llm-client');

      vi.mocked(webScraper.scrapeUrl).mockResolvedValueOnce({
        url: 'https://example.com',
        title: 'Product',
        content: 'Content...',
        success: true,
      });

      vi.mocked(llmClient.jsonPrompt).mockResolvedValueOnce({
        name: 'Product',
        description: 'Description',
      });

      const input: ArticleInput = {
        mode: 'site_url',
        url: 'https://example.com',
        targetKeyword: 'custom keyword',
      };

      const result = await handler.normalize(input);

      expect(result.targetKeyword).toBe('custom keyword');
      // prompt should not be called for keyword generation
      expect(llmClient.prompt).not.toHaveBeenCalled();
    });

    it('should throw error when scraping fails', async () => {
      const { webScraper } = await import('../web-scraper');

      vi.mocked(webScraper.scrapeUrl).mockResolvedValueOnce({
        url: 'https://example.com',
        title: '',
        content: '',
        success: false,
        error: 'Network error',
      });

      const input: ArticleInput = {
        mode: 'site_url',
        url: 'https://example.com',
      };

      await expect(handler.normalize(input)).rejects.toThrow('Failed to scrape site');
    });
  });

  describe('normalize() - article_url mode', () => {
    it('should analyze reference article structure', async () => {
      const { webScraper } = await import('../web-scraper');
      const { llmClient } = await import('../llm-client');

      vi.mocked(webScraper.scrapeUrl).mockResolvedValueOnce({
        url: 'https://blog.example.com/article',
        title: 'How to Manage Tasks Effectively',
        content: '# How to Manage Tasks\n\n## Introduction\n\nContent here...\n\n## Method 1\n\nMore content...',
        success: true,
      });

      vi.mocked(llmClient.jsonPrompt).mockResolvedValueOnce({
        topic: 'Task management',
        style: 'informative, professional',
        inferredProduct: 'TaskFlow',
        inferredDescription: 'A task management solution',
      });

      vi.mocked(llmClient.prompt).mockResolvedValueOnce('task management tips');

      const input: ArticleInput = {
        mode: 'article_url',
        url: 'https://blog.example.com/article',
        language: 'en',
      };

      const result = await handler.normalize(input);

      expect(result.referenceArticle).toBeDefined();
      expect(result.referenceArticle?.title).toBe('How to Manage Tasks Effectively');
      expect(result.referenceArticle?.structure).toContain('How to Manage Tasks');
      expect(result.inputMode).toBe('article_url');
    });

    it('should use provided product info over inferred', async () => {
      const { webScraper } = await import('../web-scraper');
      const { llmClient } = await import('../llm-client');

      vi.mocked(webScraper.scrapeUrl).mockResolvedValueOnce({
        url: 'https://blog.example.com',
        title: 'Article',
        content: '# Title\n\nContent',
        success: true,
      });

      vi.mocked(llmClient.jsonPrompt).mockResolvedValueOnce({
        topic: 'Topic',
        style: 'casual',
        inferredProduct: 'InferredProduct',
        inferredDescription: 'Inferred description',
      });

      vi.mocked(llmClient.prompt).mockResolvedValueOnce('keyword');

      const input: ArticleInput = {
        mode: 'article_url',
        url: 'https://blog.example.com',
        productName: 'MyProduct',
        productDescription: 'My description',
      };

      const result = await handler.normalize(input);

      expect(result.productName).toBe('MyProduct');
      expect(result.productDescription).toBe('My description');
    });
  });

  describe('normalize() - hybrid mode', () => {
    it('should combine site and article data', async () => {
      const { webScraper } = await import('../web-scraper');
      const { llmClient } = await import('../llm-client');

      // First call for site URL
      vi.mocked(webScraper.scrapeUrl)
        .mockResolvedValueOnce({
          url: 'https://product.example.com',
          title: 'Product Page',
          content: 'Product content...',
          success: true,
        })
        // Second call for article URL
        .mockResolvedValueOnce({
          url: 'https://blog.example.com',
          title: 'Reference Article',
          content: '# Reference\n\n## Section 1\n\nContent',
          success: true,
        });

      // Extract product info
      vi.mocked(llmClient.jsonPrompt)
        .mockResolvedValueOnce({
          name: 'ExtractedProduct',
          description: 'Extracted description',
        })
        // Analyze article
        .mockResolvedValueOnce({
          topic: 'Topic',
          style: 'formal',
        });

      vi.mocked(llmClient.prompt).mockResolvedValueOnce('generated keyword');

      const input: ArticleInput = {
        mode: 'hybrid',
        siteUrl: 'https://product.example.com',
        articleUrl: 'https://blog.example.com',
      };

      const result = await handler.normalize(input);

      expect(result.siteContent).toBeDefined();
      expect(result.referenceArticle).toBeDefined();
      expect(result.sourceUrls).toHaveLength(2);
      expect(result.inputMode).toBe('hybrid');
    });

    it('should prioritize user input over extracted data', async () => {
      const { webScraper } = await import('../web-scraper');
      const { llmClient } = await import('../llm-client');

      vi.mocked(webScraper.scrapeUrl).mockResolvedValueOnce({
        url: 'https://example.com',
        title: 'Page',
        content: 'Content',
        success: true,
      });

      vi.mocked(llmClient.jsonPrompt).mockResolvedValueOnce({
        name: 'ExtractedName',
        description: 'Extracted description',
      });

      const input: ArticleInput = {
        mode: 'hybrid',
        siteUrl: 'https://example.com',
        productName: 'UserProvidedName',
        targetKeyword: 'user keyword',
      };

      const result = await handler.normalize(input);

      expect(result.productName).toBe('UserProvidedName');
      expect(result.targetKeyword).toBe('user keyword');
    });
  });

  describe('validateInput()', () => {
    it('should return valid for complete input', async () => {
      const normalized = {
        productName: 'Product',
        productDescription: 'Description',
        targetKeyword: 'keyword',
        language: 'ja' as const,
        inputMode: 'text' as const,
        sourceUrls: [],
      };

      const result = handler.validateInput(normalized);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing product name', async () => {
      const normalized = {
        productName: '',
        productDescription: 'Description',
        targetKeyword: 'keyword',
        language: 'ja' as const,
        inputMode: 'text' as const,
        sourceUrls: [],
      };

      const result = handler.validateInput(normalized);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
    });

    it('should return errors for missing keyword', async () => {
      const normalized = {
        productName: 'Product',
        productDescription: 'Description',
        targetKeyword: '',
        language: 'ja' as const,
        inputMode: 'text' as const,
        sourceUrls: [],
      };

      const result = handler.validateInput(normalized);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Target keyword is required');
    });
  });
});
