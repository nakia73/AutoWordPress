// Argo Note - Article Input Handler
// Unified handler for multiple input patterns
// Supports: Site URL, Text input, Hybrid
//
// Note: Trace機能（Writing Style Trace）は Phase 10 で正式実装予定
// 専用管理画面（/settings/style-traces）でスタイルプロファイルを事前登録する方式

import { webScraper, type ScrapedContent } from './web-scraper';
import { llmClient } from './llm-client';

// ============================================
// Input Types
// ============================================

export type InputMode = 'site_url' | 'text' | 'hybrid';

export type SiteUrlInput = {
  mode: 'site_url';
  url: string;
  targetKeyword?: string;
  language?: 'ja' | 'en';
};

export type TextInput = {
  mode: 'text';
  productName: string;
  productDescription: string;
  targetKeyword: string;
  additionalContext?: string;
  language?: 'ja' | 'en';
};

export type HybridInput = {
  mode: 'hybrid';
  siteUrl?: string;
  productName?: string;
  productDescription?: string;
  targetKeyword?: string;
  additionalContext?: string;
  language?: 'ja' | 'en';
};

export type ArticleInput = SiteUrlInput | TextInput | HybridInput;

// ============================================
// Normalized Output
// ============================================

export type NormalizedInput = {
  // Required for article generation
  productName: string;
  productDescription: string;
  targetKeyword: string;
  language: 'ja' | 'en';

  // Optional enrichment
  siteContent?: string;
  additionalContext?: string;

  // Metadata
  inputMode: InputMode;
  sourceUrls: string[];
};

// ============================================
// Article Input Handler
// ============================================

export class ArticleInputHandler {
  /**
   * Normalize any input type into a consistent format for article generation
   */
  async normalize(input: ArticleInput): Promise<NormalizedInput> {
    switch (input.mode) {
      case 'site_url':
        return this.normalizeSiteUrl(input);
      case 'text':
        return this.normalizeText(input);
      case 'hybrid':
        return this.normalizeHybrid(input);
      default:
        throw new Error(`Unknown input mode: ${(input as any).mode}`);
    }
  }

  /**
   * Mode 1: Site URL - Extract product info from landing page
   */
  private async normalizeSiteUrl(input: SiteUrlInput): Promise<NormalizedInput> {
    console.log(`[InputHandler] Processing site URL: ${input.url}`);

    // Scrape the site
    const scraped = await webScraper.scrapeUrl(input.url);

    if (!scraped.success) {
      throw new Error(`Failed to scrape site: ${scraped.error}`);
    }

    // Extract product information using LLM
    const extracted = await this.extractProductInfo(scraped);

    // Generate target keyword if not provided
    const targetKeyword = input.targetKeyword || await this.generateKeyword(
      extracted.name,
      extracted.description,
      input.language || 'ja'
    );

    return {
      productName: extracted.name,
      productDescription: extracted.description,
      targetKeyword,
      language: input.language || 'ja',
      siteContent: scraped.content.slice(0, 5000),
      inputMode: 'site_url',
      sourceUrls: [input.url],
    };
  }

  /**
   * Mode 2: Text Input - Direct user-provided information
   */
  private async normalizeText(input: TextInput): Promise<NormalizedInput> {
    console.log(`[InputHandler] Processing text input for: ${input.productName}`);

    return {
      productName: input.productName,
      productDescription: input.productDescription,
      targetKeyword: input.targetKeyword,
      language: input.language || 'ja',
      additionalContext: input.additionalContext,
      inputMode: 'text',
      sourceUrls: [],
    };
  }

  /**
   * Mode 3: Hybrid - Combine site URL with text input
   */
  private async normalizeHybrid(input: HybridInput): Promise<NormalizedInput> {
    console.log('[InputHandler] Processing hybrid input');

    const sourceUrls: string[] = [];
    let siteContent: string | undefined;
    let extractedProduct: { name: string; description: string } | undefined;

    // Process site URL if provided
    if (input.siteUrl) {
      const scraped = await webScraper.scrapeUrl(input.siteUrl);
      if (scraped.success) {
        siteContent = scraped.content.slice(0, 5000);
        extractedProduct = await this.extractProductInfo(scraped);
        sourceUrls.push(input.siteUrl);
      }
    }

    // Determine final values (user input takes precedence)
    const productName = input.productName || extractedProduct?.name || 'Product';
    const productDescription = input.productDescription || extractedProduct?.description || '';

    // Generate target keyword if not provided
    const targetKeyword = input.targetKeyword || await this.generateKeyword(
      productName,
      productDescription,
      input.language || 'ja'
    );

    return {
      productName,
      productDescription,
      targetKeyword,
      language: input.language || 'ja',
      siteContent,
      additionalContext: input.additionalContext,
      inputMode: 'hybrid',
      sourceUrls,
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Extract product information from scraped content
   */
  private async extractProductInfo(scraped: ScrapedContent): Promise<{
    name: string;
    description: string;
  }> {
    const systemPrompt = `You are a product information extractor.
Extract the product/service name and a concise description from the webpage content.

Return as JSON:
{
  "name": "Product/Service name",
  "description": "2-3 sentence description of what it does and who it's for"
}`;

    const userPrompt = `
Extract product information from this webpage:

Title: ${scraped.title}
Content:
${scraped.content.slice(0, 3000)}
`;

    try {
      return await llmClient.jsonPrompt<{ name: string; description: string }>(
        systemPrompt,
        userPrompt
      );
    } catch (error) {
      console.warn('[InputHandler] Failed to extract product info:', error);
      return {
        name: scraped.title || 'Unknown Product',
        description: scraped.content.slice(0, 200),
      };
    }
  }

  /**
   * Generate a target keyword based on product information
   */
  private async generateKeyword(
    productName: string,
    context: string,
    language: 'ja' | 'en'
  ): Promise<string> {
    const systemPrompt = `You are an SEO keyword expert.
Generate a single, effective target keyword for an article about the product.
The keyword should be:
- Searchable (something users would actually search for)
- Relevant to the product
- Appropriate for the language

Return ONLY the keyword, nothing else.`;

    const userPrompt = `
Product: ${productName}
Context: ${context}
Language: ${language}

Generate the best target keyword:`;

    try {
      const keyword = await llmClient.prompt(systemPrompt, userPrompt);
      return keyword.trim();
    } catch (error) {
      console.warn('[InputHandler] Failed to generate keyword:', error);
      return language === 'ja' ? `${productName} 使い方` : `${productName} guide`;
    }
  }

  /**
   * Validate that all required fields are present
   */
  validateInput(normalized: NormalizedInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!normalized.productName || normalized.productName.trim() === '') {
      errors.push('Product name is required');
    }

    if (!normalized.targetKeyword || normalized.targetKeyword.trim() === '') {
      errors.push('Target keyword is required');
    }

    if (!['ja', 'en'].includes(normalized.language)) {
      errors.push('Language must be "ja" or "en"');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Default instance
export const articleInputHandler = new ArticleInputHandler();
