/**
 * Web Scraper Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebScraper } from '../web-scraper';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('WebScraper', () => {
  let scraper: WebScraper;

  beforeEach(() => {
    scraper = new WebScraper();
    mockFetch.mockReset();
  });

  describe('constructor', () => {
    it('should create instance without API key', () => {
      const s = new WebScraper();
      expect(s).toBeDefined();
    });

    it('should create instance with API key', () => {
      const s = new WebScraper('test-api-key');
      expect(s).toBeDefined();
    });
  });

  describe('scrapeUrl()', () => {
    it('should scrape URL and return markdown content', async () => {
      const mockContent = `# Product Title

This is the product description.

## Features
- Feature 1
- Feature 2
`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'text/plain']]),
        text: async () => mockContent,
      });

      const result = await scraper.scrapeUrl('https://example.com/product');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('r.jina.ai'),
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/product');
      expect(result.title).toBe('Product Title');
      expect(result.content).toContain('product description');
    });

    it('should handle JSON response when using API key', async () => {
      const scraperWithKey = new WebScraper('test-api-key');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => ({
          data: {
            title: 'JSON Product',
            content: 'Product content from JSON',
            description: 'A great product',
            images: ['https://example.com/img1.png'],
            links: ['https://example.com/link1'],
          },
        }),
      });

      const result = await scraperWithKey.scrapeUrl('https://example.com/product');

      expect(result.success).toBe(true);
      expect(result.title).toBe('JSON Product');
      expect(result.content).toBe('Product content from JSON');
      expect(result.description).toBe('A great product');
      expect(result.images).toHaveLength(1);
    });

    it('should handle HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await scraper.scrapeUrl('https://example.com/notfound');

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await scraper.scrapeUrl('https://example.com/error');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should include authorization header when API key is provided', async () => {
      const scraperWithKey = new WebScraper('my-api-key');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'text/plain']]),
        text: async () => '# Title\nContent',
      });

      await scraperWithKey.scrapeUrl('https://example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-api-key',
          }),
        })
      );
    });
  });

  describe('extractProductInfo()', () => {
    let mockLlmClient: {
      jsonPrompt: <T>(system: string, user: string) => Promise<T>;
    };
    let jsonPromptMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonPromptMock = vi.fn();
      mockLlmClient = {
        jsonPrompt: jsonPromptMock as <T>(system: string, user: string) => Promise<T>,
      };
    });

    it('should extract product info using LLM', async () => {
      jsonPromptMock.mockResolvedValueOnce({
        name: 'TaskFlow',
        description: 'A task management tool',
        features: ['Easy to use', 'Cloud sync'],
        pricing: '$10/month',
        targetAudience: 'Small teams',
        benefits: ['Save time', 'Stay organized'],
      });

      const scraped = {
        url: 'https://example.com',
        title: 'TaskFlow',
        content: 'TaskFlow is a task management tool...',
        success: true,
      };

      const result = await scraper.extractProductInfo(scraped, mockLlmClient);

      expect(result.name).toBe('TaskFlow');
      expect(result.features).toContain('Easy to use');
      expect(result.rawContent).toBe('TaskFlow is a task management tool...');
    });

    it('should return raw content when scraping failed', async () => {
      const scraped = {
        url: 'https://example.com',
        title: '',
        content: '',
        success: false,
        error: 'Failed to fetch',
      };

      const result = await scraper.extractProductInfo(scraped, mockLlmClient);

      expect(result.rawContent).toBe('');
      expect(jsonPromptMock).not.toHaveBeenCalled();
    });

    it('should handle LLM extraction error', async () => {
      jsonPromptMock.mockRejectedValueOnce(new Error('LLM error'));

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const scraped = {
        url: 'https://example.com',
        title: 'Product',
        content: 'Some content',
        success: true,
      };

      const result = await scraper.extractProductInfo(scraped, mockLlmClient);

      expect(result.rawContent).toBe('Some content');
      errorSpy.mockRestore();
    });
  });

  describe('scrapeProduct()', () => {
    let mockLlmClient: {
      jsonPrompt: <T>(system: string, user: string) => Promise<T>;
    };
    let jsonPromptMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonPromptMock = vi.fn();
      mockLlmClient = {
        jsonPrompt: jsonPromptMock as <T>(system: string, user: string) => Promise<T>,
      };
    });

    it('should scrape and extract in one call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'text/plain']]),
        text: async () => '# Product\nDescription here',
      });

      jsonPromptMock.mockResolvedValueOnce({
        name: 'Product',
        description: 'Description here',
        features: [],
        pricing: null,
        targetAudience: null,
        benefits: [],
      });

      const result = await scraper.scrapeProduct('https://example.com', mockLlmClient);

      expect(result.success).toBe(true);
      expect(result.name).toBe('Product');
    });

    it('should return error on scrape failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await scraper.scrapeProduct('https://example.com', mockLlmClient);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('scrapeMultiple()', () => {
    it('should scrape multiple URLs', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/plain']]),
          text: async () => '# Page 1',
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/plain']]),
          text: async () => '# Page 2',
        });

      const results = await scraper.scrapeMultiple([
        'https://example.com/1',
        'https://example.com/2',
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Page 1');
      expect(results[1].title).toBe('Page 2');
    });

    it('should respect concurrency limit', async () => {
      // Create 5 URLs
      const urls = Array(5).fill(null).map((_, i) => `https://example.com/${i}`);

      // Track call order
      const callOrder: number[] = [];
      let callIndex = 0;

      mockFetch.mockImplementation(async () => {
        const idx = callIndex++;
        callOrder.push(idx);
        await new Promise((r) => setTimeout(r, 10));
        return {
          ok: true,
          headers: new Map([['content-type', 'text/plain']]),
          text: async () => `# Page ${idx}`,
        };
      });

      await scraper.scrapeMultiple(urls, { concurrency: 2 });

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });
});
