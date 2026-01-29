// Argo Note - Article Input Handler
// Unified handler for multiple input patterns
// Supports: Site URL, Article URL to mimic, Text input, Hybrid

import { webScraper, type ScrapedContent } from './web-scraper';
import { llmClient } from './llm-client';
import { tavilyClient } from './tavily-client';

// ============================================
// Input Types
// ============================================

export type InputMode = 'site_url' | 'article_url' | 'text' | 'hybrid';

export type SiteUrlInput = {
  mode: 'site_url';
  url: string;
  targetKeyword?: string;
  language?: 'ja' | 'en';
};

export type ArticleUrlInput = {
  mode: 'article_url';
  url: string;
  productName?: string;
  productDescription?: string;
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
  articleUrl?: string;
  productName?: string;
  productDescription?: string;
  targetKeyword?: string;
  additionalContext?: string;
  language?: 'ja' | 'en';
};

export type ArticleInput = SiteUrlInput | ArticleUrlInput | TextInput | HybridInput;

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
  referenceArticle?: {
    title: string;
    structure: string[];
    style: string;
    wordCount: number;
  };
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
      case 'article_url':
        return this.normalizeArticleUrl(input);
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
   * Mode 2: Article URL - Analyze reference article for style/structure
   */
  private async normalizeArticleUrl(input: ArticleUrlInput): Promise<NormalizedInput> {
    console.log(`[InputHandler] Processing article URL: ${input.url}`);

    // Scrape the reference article
    const scraped = await webScraper.scrapeUrl(input.url);

    if (!scraped.success) {
      throw new Error(`Failed to scrape article: ${scraped.error}`);
    }

    // Analyze article structure
    const analysis = await this.analyzeArticle(scraped);

    // Use provided product info or extract from article
    const productName = input.productName || analysis.inferredProduct || 'Product';
    const productDescription = input.productDescription || analysis.inferredDescription || '';

    // Generate target keyword based on article topic
    const targetKeyword = await this.generateKeyword(
      productName,
      analysis.topic,
      input.language || 'ja'
    );

    return {
      productName,
      productDescription,
      targetKeyword,
      language: input.language || 'ja',
      referenceArticle: {
        title: scraped.title,
        structure: analysis.headings,
        style: analysis.style,
        wordCount: analysis.wordCount,
      },
      inputMode: 'article_url',
      sourceUrls: [input.url],
    };
  }

  /**
   * Mode 3: Text Input - Direct user-provided information
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
   * Mode 4: Hybrid - Combine multiple sources
   */
  private async normalizeHybrid(input: HybridInput): Promise<NormalizedInput> {
    console.log('[InputHandler] Processing hybrid input');

    const sourceUrls: string[] = [];
    let siteContent: string | undefined;
    let referenceArticle: NormalizedInput['referenceArticle'] | undefined;
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

    // Process article URL if provided
    if (input.articleUrl) {
      const scraped = await webScraper.scrapeUrl(input.articleUrl);
      if (scraped.success) {
        const analysis = await this.analyzeArticle(scraped);
        referenceArticle = {
          title: scraped.title,
          structure: analysis.headings,
          style: analysis.style,
          wordCount: analysis.wordCount,
        };
        sourceUrls.push(input.articleUrl);
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
      referenceArticle,
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
   * Analyze article structure and style
   */
  private async analyzeArticle(scraped: ScrapedContent): Promise<{
    topic: string;
    headings: string[];
    style: string;
    wordCount: number;
    inferredProduct?: string;
    inferredDescription?: string;
  }> {
    // Extract headings from markdown content
    const headingMatches = scraped.content.match(/^#{1,3}\s+.+$/gm) || [];
    const headings = headingMatches.map((h) => h.replace(/^#+\s+/, ''));

    // Calculate word count
    const wordCount = scraped.content.split(/\s+/).length;

    const systemPrompt = `You are a content analyst.
Analyze the article and extract:
1. Main topic
2. Writing style (formal/casual, technical/accessible, etc.)
3. If a product is mentioned, what is it?

Return as JSON:
{
  "topic": "Main topic of the article",
  "style": "Brief description of writing style",
  "inferredProduct": "Product name if mentioned, or null",
  "inferredDescription": "Product description if inferable, or null"
}`;

    const userPrompt = `
Analyze this article:

Title: ${scraped.title}
Content:
${scraped.content.slice(0, 3000)}
`;

    try {
      const analysis = await llmClient.jsonPrompt<{
        topic: string;
        style: string;
        inferredProduct?: string;
        inferredDescription?: string;
      }>(systemPrompt, userPrompt);

      return {
        ...analysis,
        headings,
        wordCount,
      };
    } catch (error) {
      console.warn('[InputHandler] Failed to analyze article:', error);
      return {
        topic: scraped.title || 'Unknown',
        headings,
        style: 'standard',
        wordCount,
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
