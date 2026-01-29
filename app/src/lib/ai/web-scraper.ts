// Argo Note - Web Scraper Service
// Uses Jina Reader API for URL content extraction
// Free tier: No API key required for basic usage
// Reference: https://jina.ai/reader/

const JINA_READER_BASE = 'https://r.jina.ai';
const JINA_API_KEY = process.env.JINA_API_KEY || ''; // Optional for enhanced features

export type ScrapedContent = {
  url: string;
  title: string;
  content: string;
  description?: string;
  images?: string[];
  links?: string[];
  success: boolean;
  error?: string;
};

export type ProductInfo = {
  name?: string;
  description?: string;
  features?: string[];
  pricing?: string;
  targetAudience?: string;
  benefits?: string[];
  rawContent: string;
};

export class WebScraper {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || JINA_API_KEY;
  }

  /**
   * Scrape content from a URL using Jina Reader
   */
  async scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
      const jinaUrl = `${JINA_READER_BASE}/${encodeURIComponent(url)}`;

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      // Add API key if available (enables enhanced features)
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      console.log(`[WebScraper] Fetching: ${url}`);

      const response = await fetch(jinaUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        throw new Error(`Jina Reader error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');

      // Handle JSON response (when using API key)
      if (contentType?.includes('application/json')) {
        const json = await response.json();
        return {
          url,
          title: json.data?.title || '',
          content: json.data?.content || json.data?.text || '',
          description: json.data?.description || '',
          images: json.data?.images || [],
          links: json.data?.links || [],
          success: true,
        };
      }

      // Handle text/markdown response (default)
      const text = await response.text();

      // Extract title from first line (usually # Title)
      const titleMatch = text.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : '';

      return {
        url,
        title,
        content: text,
        success: true,
      };
    } catch (error) {
      console.error(`[WebScraper] Failed to scrape ${url}:`, error);
      return {
        url,
        title: '',
        content: '',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Extract product information from scraped content using LLM
   */
  async extractProductInfo(
    scrapedContent: ScrapedContent,
    llmClient: { jsonPrompt: <T>(system: string, user: string) => Promise<T> }
  ): Promise<ProductInfo> {
    if (!scrapedContent.success || !scrapedContent.content) {
      return {
        rawContent: scrapedContent.content || '',
      };
    }

    const systemPrompt = `You are a product information extractor.
Analyze the given webpage content and extract structured product information.
If certain information is not available, set the field to null or empty array.

Return as JSON:
{
  "name": "Product name (string or null)",
  "description": "Product description (string or null)",
  "features": ["feature 1", "feature 2", ...],
  "pricing": "Pricing information if available (string or null)",
  "targetAudience": "Who this product is for (string or null)",
  "benefits": ["benefit 1", "benefit 2", ...]
}`;

    const userPrompt = `
Extract product information from this webpage:

URL: ${scrapedContent.url}
Title: ${scrapedContent.title}

Content:
${scrapedContent.content.slice(0, 5000)}
`;

    try {
      const extracted = await llmClient.jsonPrompt<Omit<ProductInfo, 'rawContent'>>(
        systemPrompt,
        userPrompt
      );

      return {
        ...extracted,
        rawContent: scrapedContent.content,
      };
    } catch (error) {
      console.error('[WebScraper] Failed to extract product info:', error);
      return {
        rawContent: scrapedContent.content,
      };
    }
  }

  /**
   * Scrape and extract product info in one call
   */
  async scrapeProduct(
    url: string,
    llmClient: { jsonPrompt: <T>(system: string, user: string) => Promise<T> }
  ): Promise<ProductInfo & { url: string; success: boolean; error?: string }> {
    const scraped = await this.scrapeUrl(url);

    if (!scraped.success) {
      return {
        url,
        success: false,
        error: scraped.error,
        rawContent: '',
      };
    }

    const productInfo = await this.extractProductInfo(scraped, llmClient);

    return {
      url,
      success: true,
      ...productInfo,
    };
  }

  /**
   * Scrape multiple URLs in parallel
   */
  async scrapeMultiple(
    urls: string[],
    options?: { concurrency?: number }
  ): Promise<ScrapedContent[]> {
    const concurrency = options?.concurrency || 3;
    const results: ScrapedContent[] = [];

    // Process in batches
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((url) => this.scrapeUrl(url))
      );
      results.push(...batchResults);
    }

    return results;
  }
}

// Default instance
export const webScraper = new WebScraper();
