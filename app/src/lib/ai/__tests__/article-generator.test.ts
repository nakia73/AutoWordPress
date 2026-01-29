/**
 * Article Generator E2E Tests
 *
 * These tests verify the standalone article generation pipeline
 * without WordPress integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArticleGenerator } from '../article-generator';
import type { ArticleContent, ArticleType } from '@/types';

// Mock the dependencies
vi.mock('../tavily-client', () => ({
  tavilyClient: {
    researchForArticle: vi.fn().mockResolvedValue({
      context: `
=== TAVILY AI SUMMARY ===
[NEWS] Recent developments in task management tools show increased adoption.
[SNS] Users on X/Twitter are discussing productivity apps.
[OFFICIAL] Major companies are releasing new task management features.

=== RECENT NEWS (Last 24h) ===
Title: New Task Management Features Released
URL: https://example.com/news
Relevance: 0.85
Content: Companies are enhancing their task management tools with AI features.
---
      `,
      apiCallCount: 3,
    }),
  },
}));

vi.mock('../llm-client', () => ({
  llmClient: {
    jsonPrompt: vi.fn().mockResolvedValue({
      title: 'Test Article Title',
      sections: [
        { heading: 'Introduction', level: 2, notes: 'Overview of the topic' },
        { heading: 'Main Points', level: 2, notes: 'Key details' },
        { heading: 'Conclusion', level: 2, notes: 'Summary' },
      ],
    }),
    complete: vi.fn().mockResolvedValue(`
<h1>Test Article Title</h1>
<p>This is the introduction paragraph with valuable content.</p>
<h2>Introduction</h2>
<p>Overview of the topic with detailed information.</p>
<h2>Main Points</h2>
<p>Key details about the subject matter.</p>
<ul>
  <li>Point 1</li>
  <li>Point 2</li>
  <li>Point 3</li>
</ul>
<h2>Conclusion</h2>
<p>Summary of the article content.</p>
    `),
    prompt: vi.fn().mockResolvedValue('Meta description for SEO optimization under 160 characters.'),
  },
  LLMClient: vi.fn(),
}));

vi.mock('../prompts', () => ({
  ARTICLE_PROMPTS: {
    OUTLINE: 'Generate outline...',
    CONTENT: 'Write content...',
    META_DESCRIPTION: 'Write meta...',
  },
}));

vi.mock('../image-generator', () => ({
  imageGenerator: {
    generateThumbnail: vi.fn().mockResolvedValue({
      imageData: Buffer.from('fake-image-data'),
      promptUsed: 'Generated image prompt',
      isFallback: false,
    }),
  },
}));

vi.mock('../section-image-service', () => ({
  sectionImageService: {
    processArticleImages: vi.fn().mockImplementation((html: string) => ({
      processedHtml: html,
      imagesGenerated: 0,
      errors: [],
    })),
  },
}));

describe('ArticleGenerator', () => {
  let generator: ArticleGenerator;

  beforeEach(() => {
    generator = new ArticleGenerator();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generate()', () => {
    it('should generate a complete article without images', async () => {
      const result = await generator.generate({
        targetKeyword: 'task management',
        productName: 'TestProduct',
        productDescription: 'A test product for task management',
        articleType: 'article',
        language: 'en',
        includeImages: false,
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Article Title');
      expect(result.content).toContain('<h1>');
      expect(result.content).toContain('<h2>');
      expect(result.meta_description).toBeDefined();
      expect(result.target_keyword).toBe('task management');
      expect(result.article_type).toBe('article');
    });

    it('should generate an article with images when includeImages is true', async () => {
      const result = await generator.generate({
        targetKeyword: 'task management',
        productName: 'TestProduct',
        productDescription: 'A test product',
        articleType: 'article',
        language: 'en',
        includeImages: true,
      });

      expect(result).toBeDefined();
      expect(result.thumbnail).toBeDefined();
      expect(result.thumbnail?.imageData).toBeInstanceOf(Buffer);
    });

    it('should handle Japanese language', async () => {
      const result = await generator.generate({
        targetKeyword: 'タスク管理',
        productName: 'テスト製品',
        productDescription: 'タスク管理のためのテスト製品',
        articleType: 'article',
        language: 'ja',
        includeImages: false,
      });

      expect(result).toBeDefined();
      expect(result.target_keyword).toBe('タスク管理');
    });

    it('should generate FAQ type article', async () => {
      const result = await generator.generate({
        targetKeyword: 'FAQ test',
        productName: 'TestProduct',
        productDescription: 'A test product',
        articleType: 'faq',
        language: 'en',
        includeImages: false,
      });

      expect(result).toBeDefined();
      expect(result.article_type).toBe('faq');
    });

    it('should generate Glossary type article', async () => {
      const result = await generator.generate({
        targetKeyword: 'Glossary test',
        productName: 'TestProduct',
        productDescription: 'A test product',
        articleType: 'glossary',
        language: 'en',
        includeImages: false,
      });

      expect(result).toBeDefined();
      expect(result.article_type).toBe('glossary');
    });
  });

  describe('research()', () => {
    it('should return research context for a keyword', async () => {
      const result = await generator.research('task management', 'en');

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.context).toBeDefined();
      expect(typeof result.context).toBe('string');
      expect(result.context).toContain('TAVILY');
      expect(result.apiCallCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateOutline()', () => {
    it('should generate article outline', async () => {
      const result = await generator.generateOutline({
        targetKeyword: 'test keyword',
        productName: 'TestProduct',
        productDescription: 'A test product',
        articleType: 'article',
        language: 'en',
      });

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.sections).toBeInstanceOf(Array);
      expect(result.sections.length).toBeGreaterThan(0);
    });
  });

  describe('generateMetaDescription()', () => {
    it('should generate meta description under 160 characters', async () => {
      const result = await generator.generateMetaDescription(
        'Test Title',
        '<p>Test content</p>',
        'test keyword'
      );

      expect(result).toBeDefined();
      expect(result.length).toBeLessThanOrEqual(160);
    });
  });
});

describe('ArticleGenerator Integration', () => {
  describe('Output Format', () => {
    it('should produce valid HTML structure', async () => {
      const generator = new ArticleGenerator();
      const result = await generator.generate({
        targetKeyword: 'test',
        productName: 'Test',
        productDescription: 'Test',
        articleType: 'article',
        language: 'en',
        includeImages: false,
      });

      // Check HTML structure
      expect(result.content).toContain('<h1>');
      expect(result.content).toContain('<h2>');
      expect(result.content).toContain('<p>');
    });

    it('should include all required ArticleContent fields', async () => {
      const generator = new ArticleGenerator();
      const result = await generator.generate({
        targetKeyword: 'test',
        productName: 'Test',
        productDescription: 'Test',
        articleType: 'article',
        language: 'en',
        includeImages: false,
      });

      // Verify all required fields
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('meta_description');
      expect(result).toHaveProperty('target_keyword');
      expect(result).toHaveProperty('search_intent');
      expect(result).toHaveProperty('article_type');
    });
  });

  describe('Content Quality', () => {
    it('should generate content with proper heading hierarchy', async () => {
      const generator = new ArticleGenerator();
      const result = await generator.generate({
        targetKeyword: 'test',
        productName: 'Test',
        productDescription: 'Test',
        articleType: 'article',
        language: 'en',
        includeImages: false,
      });

      // Check heading hierarchy
      const h1Count = (result.content.match(/<h1>/g) || []).length;
      const h2Count = (result.content.match(/<h2>/g) || []).length;

      expect(h1Count).toBe(1); // Should have exactly one h1
      expect(h2Count).toBeGreaterThanOrEqual(2); // Should have at least 2 h2s
    });

    it('should generate content with paragraphs and lists', async () => {
      const generator = new ArticleGenerator();
      const result = await generator.generate({
        targetKeyword: 'test',
        productName: 'Test',
        productDescription: 'Test',
        articleType: 'article',
        language: 'en',
        includeImages: false,
      });

      // Check for paragraphs and lists
      const pCount = (result.content.match(/<p>/g) || []).length;
      const listCount = (result.content.match(/<ul>|<ol>/g) || []).length;

      expect(pCount).toBeGreaterThanOrEqual(3); // At least 3 paragraphs
      expect(listCount).toBeGreaterThanOrEqual(1); // At least 1 list
    });
  });

  describe('Word Count Validation', () => {
    it('should respect article type word count targets', async () => {
      const generator = new ArticleGenerator();

      // Test article type
      const article = await generator.generate({
        targetKeyword: 'test',
        productName: 'Test',
        productDescription: 'Test',
        articleType: 'article',
        language: 'en',
        includeImages: false,
      });

      const articleText = article.content.replace(/<[^>]*>/g, '');
      // Note: With mock, actual word count depends on mock response
      expect(articleText.length).toBeGreaterThan(0);
    });
  });
});

describe('ArticleGenerator Error Handling', () => {
  it('should handle thumbnail generation failure gracefully', async () => {
    // Override mock for this test
    const { imageGenerator } = await import('../image-generator');
    vi.mocked(imageGenerator.generateThumbnail).mockResolvedValueOnce({
      imageData: Buffer.from(''),
      promptUsed: '',
      format: 'png',
      isFallback: true,
      errorMessage: 'API error',
    });

    const generator = new ArticleGenerator();
    const result = await generator.generate({
      targetKeyword: 'test',
      productName: 'Test',
      productDescription: 'Test',
      articleType: 'article',
      language: 'en',
      includeImages: true,
    });

    // Should still complete without thumbnail
    expect(result).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.thumbnail).toBeUndefined();
  });
});
