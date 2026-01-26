// Argo Note - Tavily Search Client
// For real-time web research

import type { TavilySearchResponse, TavilyToLLMInput } from '@/types';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_BASE_URL = 'https://api.tavily.com';

export class TavilyClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || TAVILY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Tavily API key not configured');
    }
  }

  async search(
    query: string,
    options?: {
      searchDepth?: 'basic' | 'advanced';
      maxResults?: number;
      includeAnswer?: boolean;
      includeRawContent?: boolean;
    }
  ): Promise<TavilySearchResponse> {
    const response = await fetch(`${TAVILY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: options?.searchDepth || 'basic',
        max_results: options?.maxResults || 5,
        include_answer: options?.includeAnswer || false,
        include_raw_content: options?.includeRawContent || false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavily API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Search and format for LLM consumption
  async searchForLLM(
    query: string,
    analysisPrompt: string
  ): Promise<TavilyToLLMInput> {
    const results = await this.search(query, {
      searchDepth: 'basic',
      maxResults: 5,
    });

    return {
      search_query: query,
      top_results: results.results.map((r) => ({
        title: r.title,
        url: r.url,
        summary: r.content.slice(0, 500), // Truncate for token efficiency
      })),
      analysis_prompt: analysisPrompt,
    };
  }

  // Research a topic with multiple queries
  async researchTopic(
    topic: string,
    subQueries: string[]
  ): Promise<Map<string, TavilySearchResponse>> {
    const results = new Map<string, TavilySearchResponse>();

    // Run searches in parallel (with rate limiting)
    const searchPromises = subQueries.map(async (query, index) => {
      // Simple rate limiting: stagger requests
      await new Promise((resolve) => setTimeout(resolve, index * 200));

      const result = await this.search(`${topic} ${query}`, {
        searchDepth: 'basic',
        maxResults: 3,
      });

      results.set(query, result);
    });

    await Promise.all(searchPromises);
    return results;
  }
}

// Default client instance
export const tavilyClient = new TavilyClient();

// Common research queries for article generation
export const RESEARCH_QUERIES = {
  forKeyword: (keyword: string) => [
    keyword,
    `${keyword} best practices`,
    `${keyword} common mistakes`,
    `${keyword} examples`,
    `${keyword} tips`,
  ],

  forProduct: (productName: string) => [
    `${productName} review`,
    `${productName} alternatives`,
    `${productName} features`,
    `${productName} pricing`,
    `${productName} use cases`,
  ],

  forCompetitorAnalysis: (productName: string) => [
    `${productName} competitors`,
    `${productName} vs`,
    `best ${productName} alternatives`,
  ],
};
