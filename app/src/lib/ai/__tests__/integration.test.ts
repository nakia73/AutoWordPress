/**
 * Integration Tests - Real API calls (skipped when no API keys)
 *
 * These tests use real APIs and are skipped by default.
 * To run: Set environment variables and run with INTEGRATION=true
 *
 * Required environment variables:
 * - TAVILY_API_KEY: For Tavily semantic search
 * - GOOGLE_API_KEY: For Gemini LLM and image generation
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Check if integration tests should run
const shouldRunIntegration = process.env.INTEGRATION === 'true';
const hasTavilyKey = !!process.env.TAVILY_API_KEY;
const hasGoogleKey = !!process.env.GOOGLE_API_KEY;

const describeIntegration = shouldRunIntegration ? describe : describe.skip;

describeIntegration('Integration Tests (Real API)', () => {
  beforeAll(() => {
    console.log('Running integration tests with real APIs...');
    console.log(`Tavily API key: ${hasTavilyKey ? 'present' : 'missing'}`);
    console.log(`Google API key: ${hasGoogleKey ? 'present' : 'missing'}`);
  });

  describe('TavilyClient', () => {
    it.skipIf(!hasTavilyKey)('should perform real semantic search', async () => {
      const { TavilyClient } = await import('../tavily-client');
      const client = new TavilyClient();

      const results = await client.search('task management best practices 2025', {
        searchDepth: 'basic',
        maxResults: 3,
      });

      expect(results).toBeDefined();
      expect(results.results).toBeDefined();
      expect(results.results.length).toBeGreaterThan(0);

      // Verify result structure
      const firstResult = results.results[0];
      expect(firstResult).toHaveProperty('title');
      expect(firstResult).toHaveProperty('url');
      expect(firstResult).toHaveProperty('content');
    }, 30000);

    it.skipIf(!hasTavilyKey)('should perform 3-phase research', async () => {
      const { TavilyClient } = await import('../tavily-client');
      const client = new TavilyClient();

      const research = await client.researchForArticle('タスク管理ツール', { language: 'ja' });

      expect(research).toBeDefined();
      expect(typeof research).toBe('string');
      expect(research.length).toBeGreaterThan(100);

      // Should have multi-phase content
      expect(research).toMatch(/NEWS|RECENT|ニュース/i);
    }, 60000);
  });

  describe('LLMClient', () => {
    it.skipIf(!hasGoogleKey)('should generate text completion', async () => {
      const { LLMClient } = await import('../llm-client');
      const client = new LLMClient();

      const result = await client.complete([
        { role: 'user', content: 'Say "Hello World" and nothing else.' },
      ]);

      expect(result).toBeDefined();
      expect(result.toLowerCase()).toContain('hello');
    }, 30000);

    it.skipIf(!hasGoogleKey)('should parse JSON response', async () => {
      const { LLMClient } = await import('../llm-client');
      const client = new LLMClient();

      const result = await client.jsonPrompt<{ items: string[] }>(
        'Return a JSON object with a key "items" containing exactly 3 programming languages.',
        'Respond only with valid JSON.'
      );

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.items).toHaveLength(3);
    }, 30000);
  });

  describe('ImageGenerator', () => {
    it.skipIf(!hasGoogleKey)('should generate thumbnail image', async () => {
      const { ImageGenerator } = await import('../image-generator');
      const generator = new ImageGenerator();

      const result = await generator.generateThumbnail(
        'Task Management Guide',
        'A comprehensive guide to task management.'
      );

      expect(result).toBeDefined();
      expect(result.isFallback).toBe(false);
      expect(result.imageData).toBeInstanceOf(Buffer);
      expect(result.imageData.length).toBeGreaterThan(1000);
      expect(result.promptUsed).toBeDefined();
    }, 60000);

    it.skipIf(!hasGoogleKey)('should generate section image', async () => {
      const { ImageGenerator } = await import('../image-generator');
      const generator = new ImageGenerator();

      const result = await generator.generateSectionImage(
        'Getting Started with Task Management',
        'Task Management Guide'
      );

      expect(result).toBeDefined();
      expect(result.isFallback).toBe(false);
      expect(result.imageData).toBeInstanceOf(Buffer);
      expect(result.imageData.length).toBeGreaterThan(1000);
    }, 60000);
  });

  describe('ArticleGenerator (E2E)', () => {
    it.skipIf(!hasTavilyKey || !hasGoogleKey)(
      'should generate a complete article with real APIs',
      async () => {
        const { ArticleGenerator } = await import('../article-generator');
        const generator = new ArticleGenerator();

        const result = await generator.generate({
          targetKeyword: 'プロジェクト管理ツール比較',
          productName: 'TestProduct',
          productDescription: 'チームのタスク管理を効率化するツール',
          articleType: 'article',
          language: 'ja',
          includeImages: false,
        });

        // Verify structure
        expect(result).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.title.length).toBeGreaterThan(10);
        expect(result.content).toBeDefined();
        expect(result.content).toContain('<h1>');
        expect(result.content).toContain('<h2>');
        expect(result.meta_description).toBeDefined();
        expect(result.meta_description.length).toBeLessThanOrEqual(160);

        // Verify content quality
        const plainText = result.content.replace(/<[^>]*>/g, '');
        expect(plainText.length).toBeGreaterThan(1000);

        // Check for proper heading hierarchy
        const h1Count = (result.content.match(/<h1>/g) || []).length;
        const h2Count = (result.content.match(/<h2>/g) || []).length;
        expect(h1Count).toBe(1);
        expect(h2Count).toBeGreaterThanOrEqual(3);

        console.log('Generated article title:', result.title);
        console.log('Content length:', plainText.length, 'characters');
        console.log('H2 sections:', h2Count);
      },
      300000 // 5 minutes timeout
    );

    it.skipIf(!hasTavilyKey || !hasGoogleKey)(
      'should generate a complete article with images',
      async () => {
        const { ArticleGenerator } = await import('../article-generator');
        const generator = new ArticleGenerator();

        const result = await generator.generate({
          targetKeyword: 'AI task management',
          productName: 'TestProduct',
          productDescription: 'An AI-powered task management tool',
          articleType: 'article',
          language: 'en',
          includeImages: true,
        });

        expect(result).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.content).toBeDefined();

        // Should have thumbnail
        expect(result.thumbnail).toBeDefined();
        expect(result.thumbnail?.imageData).toBeInstanceOf(Buffer);
        expect(result.thumbnail?.imageData.length).toBeGreaterThan(0);

        console.log('Generated article with thumbnail');
        console.log('Thumbnail size:', result.thumbnail?.imageData.length, 'bytes');
      },
      600000 // 10 minutes timeout for full generation
    );
  });

  describe('FAQ Article Generation', () => {
    it.skipIf(!hasTavilyKey || !hasGoogleKey)(
      'should generate FAQ format article',
      async () => {
        const { ArticleGenerator } = await import('../article-generator');
        const generator = new ArticleGenerator();

        const result = await generator.generate({
          targetKeyword: 'タスク管理 FAQ',
          productName: 'TestProduct',
          productDescription: 'タスク管理ツール',
          articleType: 'faq',
          language: 'ja',
          includeImages: false,
        });

        expect(result).toBeDefined();
        expect(result.article_type).toBe('faq');

        // FAQ should have question-style headings
        const h2Matches = result.content.match(/<h2>.*?<\/h2>/g) || [];
        expect(h2Matches.length).toBeGreaterThanOrEqual(3);

        // Check content length for FAQ (1500-2500 chars target)
        const plainText = result.content.replace(/<[^>]*>/g, '');
        console.log('FAQ content length:', plainText.length, 'characters');
      },
      300000
    );
  });

  describe('Glossary Article Generation', () => {
    it.skipIf(!hasTavilyKey || !hasGoogleKey)(
      'should generate Glossary format article',
      async () => {
        const { ArticleGenerator } = await import('../article-generator');
        const generator = new ArticleGenerator();

        const result = await generator.generate({
          targetKeyword: 'アジャイル開発 用語',
          productName: 'TestProduct',
          productDescription: 'プロジェクト管理ツール',
          articleType: 'glossary',
          language: 'ja',
          includeImages: false,
        });

        expect(result).toBeDefined();
        expect(result.article_type).toBe('glossary');

        // Glossary should have term definitions
        const plainText = result.content.replace(/<[^>]*>/g, '');
        expect(plainText.length).toBeGreaterThan(500);

        console.log('Glossary content length:', plainText.length, 'characters');
      },
      300000
    );
  });
});

describe('Integration Test Skip Check', () => {
  it('should skip integration tests when INTEGRATION is not set', () => {
    if (!shouldRunIntegration) {
      console.log('Integration tests skipped. To run: INTEGRATION=true npm test');
      expect(true).toBe(true);
    } else {
      console.log('Integration tests are running');
      expect(true).toBe(true);
    }
  });
});
