/**
 * Input Modes E2E Tests
 * ======================
 * 3入力モード（text, site_url, hybrid）のE2Eテスト
 *
 * Note: Trace機能（Writing Style Trace）は Phase 10 で実装予定
 *       アセット管理パターン: /settings/style-traces で事前登録 → 選択
 *
 * テスト対象:
 * 1. ArticleInputHandler の各モード正規化
 * 2. actions.ts での入力処理フロー
 * 3. バリデーションロジック
 *
 * 実行方法:
 * - Unit tests: npm test
 * - Integration tests: INTEGRATION=true npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================
// Unit Tests - Text Input Mode
// ============================================

describe('ArticleInputHandler - Text Mode', () => {
  it('should normalize text input correctly', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const result = await handler.normalize({
      mode: 'text',
      productName: 'TestProduct',
      productDescription: 'A test product description',
      targetKeyword: 'test keyword',
      language: 'ja',
    });

    expect(result.productName).toBe('TestProduct');
    expect(result.productDescription).toBe('A test product description');
    expect(result.targetKeyword).toBe('test keyword');
    expect(result.language).toBe('ja');
    expect(result.inputMode).toBe('text');
    expect(result.sourceUrls).toEqual([]);
  });

  it('should include additional context when provided', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const result = await handler.normalize({
      mode: 'text',
      productName: 'TestProduct',
      productDescription: 'Description',
      targetKeyword: 'keyword',
      additionalContext: 'Additional context here',
      language: 'en',
    });

    expect(result.additionalContext).toBe('Additional context here');
  });

  it('should default language to ja', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const result = await handler.normalize({
      mode: 'text',
      productName: 'TestProduct',
      productDescription: 'Description',
      targetKeyword: 'keyword',
    });

    expect(result.language).toBe('ja');
  });
});

// ============================================
// Unit Tests - Validation
// ============================================

describe('ArticleInputHandler - Validation', () => {
  it('should validate valid input', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const validation = handler.validateInput({
      productName: 'TestProduct',
      productDescription: 'Description',
      targetKeyword: 'keyword',
      language: 'ja',
      inputMode: 'text',
      sourceUrls: [],
    });

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject empty product name', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const validation = handler.validateInput({
      productName: '',
      productDescription: 'Description',
      targetKeyword: 'keyword',
      language: 'ja',
      inputMode: 'text',
      sourceUrls: [],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Product name is required');
  });

  it('should reject empty target keyword', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const validation = handler.validateInput({
      productName: 'TestProduct',
      productDescription: 'Description',
      targetKeyword: '',
      language: 'ja',
      inputMode: 'text',
      sourceUrls: [],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Target keyword is required');
  });

  it('should reject invalid language', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const validation = handler.validateInput({
      productName: 'TestProduct',
      productDescription: 'Description',
      targetKeyword: 'keyword',
      language: 'fr' as any,
      inputMode: 'text',
      sourceUrls: [],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Language must be "ja" or "en"');
  });
});

// ============================================
// Integration Tests - Site URL Mode
// ============================================

const shouldRunIntegration = process.env.INTEGRATION === 'true';
const hasGoogleKey = !!process.env.GOOGLE_API_KEY;

const describeIntegration = shouldRunIntegration ? describe : describe.skip;

describeIntegration('ArticleInputHandler - Site URL Mode (Integration)', () => {
  it.skipIf(!hasGoogleKey)('should extract product info from URL', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    // Use a well-known product page
    const result = await handler.normalize({
      mode: 'site_url',
      url: 'https://github.com',
      language: 'en',
    });

    expect(result.inputMode).toBe('site_url');
    expect(result.productName).toBeDefined();
    expect(result.productName.length).toBeGreaterThan(0);
    expect(result.targetKeyword).toBeDefined();
    expect(result.sourceUrls).toContain('https://github.com');
  }, 60000);
});

describeIntegration('ArticleInputHandler - Hybrid Mode (Integration)', () => {
  it.skipIf(!hasGoogleKey)('should combine multiple sources', async () => {
    const { ArticleInputHandler } = await import('../article-input-handler');
    const handler = new ArticleInputHandler();

    const result = await handler.normalize({
      mode: 'hybrid',
      siteUrl: 'https://github.com',
      productName: 'Override Product',
      targetKeyword: 'override keyword',
      language: 'en',
    });

    expect(result.inputMode).toBe('hybrid');
    // User-provided values take precedence
    expect(result.productName).toBe('Override Product');
    expect(result.targetKeyword).toBe('override keyword');
    // Site content should be extracted
    expect(result.siteContent).toBeDefined();
    expect(result.sourceUrls).toContain('https://github.com');
  }, 60000);
});

// ============================================
// Full Pipeline Tests
// ============================================

describeIntegration('Full Article Generation Pipeline (Integration)', () => {
  it.skipIf(!hasGoogleKey)('should generate article from text input', async () => {
    const { ArticleGenerator } = await import('../article-generator');
    const { ArticleInputHandler } = await import('../article-input-handler');

    const inputHandler = new ArticleInputHandler();
    const generator = new ArticleGenerator();

    // Step 1: Normalize input
    const normalizedInput = await inputHandler.normalize({
      mode: 'text',
      productName: 'TestProduct',
      productDescription: 'A test product for integration testing',
      targetKeyword: 'integration test product',
      language: 'en',
    });

    // Step 2: Validate
    const validation = inputHandler.validateInput(normalizedInput);
    expect(validation.valid).toBe(true);

    // Step 3: Generate article
    const result = await generator.generate({
      targetKeyword: normalizedInput.targetKeyword,
      productName: normalizedInput.productName,
      productDescription: normalizedInput.productDescription,
      articleType: 'article',
      language: normalizedInput.language,
      includeImages: false,
    });

    expect(result).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.content).toContain('<h1>');
    expect(result.meta_description).toBeDefined();
  }, 300000);
});
