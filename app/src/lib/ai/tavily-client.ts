// Argo Note - Tavily Search Client
// For real-time web research
// Enhanced with 3-phase search (NEWS, SNS, OFFICIAL) based on Rapid-Note2

import type { TavilySearchResponse, TavilySearchResult, TavilyToLLMInput } from '@/types';
import type { PipelineLogger } from './pipeline-logger';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_BASE_URL = 'https://api.tavily.com';

// Extended search options
export type TavilySearchOptions = {
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  includeAnswer?: boolean | 'basic' | 'advanced';
  includeRawContent?: boolean;
  topic?: 'general' | 'news' | 'finance';
  timeRange?: 'day' | 'week' | 'month' | 'year';
  includeDomains?: string[];
  excludeDomains?: string[];
  country?: string;
  includeImages?: boolean;
  logger?: PipelineLogger;
};

// Multi-phase research result
export type MultiPhaseResearchResult = {
  summaries: string[];
  news: TavilySearchResult[];
  sns: TavilySearchResult[];
  official: TavilySearchResult[];
  formattedContext: string;
  apiCallCount: number;
};

export class TavilyClient {
  private apiKey: string;
  private minRelevanceScore: number;

  constructor(apiKey?: string, minRelevanceScore = 0.6) {
    this.apiKey = apiKey || TAVILY_API_KEY || '';
    this.minRelevanceScore = minRelevanceScore;
    if (!this.apiKey) {
      console.warn('Tavily API key not configured');
    }
  }

  /**
   * Execute a single Tavily API search with full options
   */
  async search(
    query: string,
    options?: TavilySearchOptions
  ): Promise<TavilySearchResponse> {
    const payload: Record<string, unknown> = {
      api_key: this.apiKey,
      query,
      search_depth: options?.searchDepth || 'basic',
      max_results: options?.maxResults || 5,
      include_answer: options?.includeAnswer || false,
      include_raw_content: options?.includeRawContent || false,
    };

    // Add optional parameters
    if (options?.topic) {
      payload.topic = options.topic;
    }
    if (options?.timeRange) {
      payload.time_range = options.timeRange;
    }
    if (options?.includeDomains && options.includeDomains.length > 0) {
      payload.include_domains = options.includeDomains;
    }
    if (options?.excludeDomains && options.excludeDomains.length > 0) {
      payload.exclude_domains = options.excludeDomains;
    }
    if (options?.country) {
      payload.country = options.country;
    }
    if (options?.includeImages !== undefined) {
      payload.include_images = options.includeImages;
    }

    const response = await fetch(`${TAVILY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error('Tavily API: Invalid API key (401)');
      }
      if (response.status === 429) {
        throw new Error('Tavily API: Rate limit exceeded (429)');
      }
      if (response.status === 432) {
        throw new Error('Tavily API: Insufficient credits (432)');
      }
      throw new Error(`Tavily API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Filter results by relevance score
   */
  filterByScore(
    results: TavilySearchResult[],
    minScore?: number
  ): TavilySearchResult[] {
    const threshold = minScore ?? this.minRelevanceScore;
    return results.filter((r) => (r.score ?? 0) >= threshold);
  }

  /**
   * Format search results into a readable string
   */
  formatResults(results: TavilySearchResult[], sectionTitle: string): string {
    let formatted = `=== ${sectionTitle} ===\n`;
    for (const result of results.slice(0, 3)) {
      formatted += `Title: ${result.title || 'No Title'}\n`;
      formatted += `URL: ${result.url || ''}\n`;
      formatted += `Relevance: ${(result.score ?? 0).toFixed(2)}\n`;
      formatted += `Content: ${result.content || ''}\n`;
      formatted += '---\n';
    }
    return formatted;
  }

  /**
   * Execute a 3-phase multi-faceted search (NEWS, SNS, OFFICIAL)
   * Based on Rapid-Note2's research.py implementation
   */
  async multiPhaseSearch(
    keyword: string,
    options?: {
      maxResults?: number;
      searchDepth?: 'basic' | 'advanced';
      timeRange?: 'day' | 'week' | 'month' | 'year';
      country?: string;
      logger?: PipelineLogger;
    }
  ): Promise<MultiPhaseResearchResult> {
    const maxResults = options?.maxResults || 5;
    const searchDepth = options?.searchDepth || 'advanced';
    const timeRange = options?.timeRange || 'week';
    const country = options?.country || 'japan';
    const logger = options?.logger;

    const summaries: string[] = [];
    const contextParts: string[] = [];
    let apiCallCount = 0;

    logger?.info('Tavily', '3段階マルチフェーズ検索を開始', { keyword, searchDepth, country });

    // Phase 1: Recent News Search (Last 24 hours)
    let newsResults: TavilySearchResult[] = [];
    try {
      logger?.info('Tavily-Phase1', 'NEWS検索を実行中...', { query: keyword, topic: 'news', timeRange: 'day' });
      const stopTimer = logger?.startTimer('Tavily-Phase1');

      const newsData = await this.search(keyword, {
        topic: 'news',
        timeRange: 'day', // News always last 24h
        maxResults,
        searchDepth,
        includeAnswer: 'advanced',
        country,
      });
      apiCallCount++;

      const duration = stopTimer?.();

      if (newsData.answer) {
        summaries.push(`[NEWS] ${newsData.answer}`);
      }

      newsResults = this.filterByScore(newsData.results || []);
      logger?.success('Tavily-Phase1', 'NEWS検索完了', {
        totalResults: newsData.results?.length || 0,
        filteredResults: newsResults.length,
        hasAnswer: !!newsData.answer,
        durationMs: duration,
      });

      if (newsResults.length > 0) {
        contextParts.push(this.formatResults(newsResults, 'RECENT NEWS (Last 24h)'));
      }
    } catch (error) {
      logger?.error('Tavily-Phase1', 'NEWS検索失敗', { error: String(error) });
      console.warn('News search failed:', error);
    }

    // Phase 2: SNS/Realtime Reaction Search (X, Reddit)
    let snsResults: TavilySearchResult[] = [];
    try {
      const snsQuery = `${keyword} latest reaction`;
      logger?.info('Tavily-Phase2', 'SNS検索を実行中...', {
        query: snsQuery,
        domains: ['x.com', 'twitter.com', 'reddit.com']
      });
      const stopTimer = logger?.startTimer('Tavily-Phase2');

      const snsData = await this.search(snsQuery, {
        topic: 'general',
        timeRange,
        maxResults,
        searchDepth,
        includeAnswer: 'advanced',
        includeDomains: ['x.com', 'twitter.com', 'reddit.com'],
        country,
      });
      apiCallCount++;

      const duration = stopTimer?.();

      if (snsData.answer) {
        summaries.push(`[SNS] ${snsData.answer}`);
      }

      snsResults = this.filterByScore(snsData.results || []);
      logger?.success('Tavily-Phase2', 'SNS検索完了', {
        totalResults: snsData.results?.length || 0,
        filteredResults: snsResults.length,
        hasAnswer: !!snsData.answer,
        durationMs: duration,
      });

      if (snsResults.length > 0) {
        contextParts.push(this.formatResults(snsResults, 'SNS/COMMUNITY REACTIONS'));
      }
    } catch (error) {
      logger?.error('Tavily-Phase2', 'SNS検索失敗', { error: String(error) });
      console.warn('SNS search failed:', error);
    }

    // Phase 3: Official/Authoritative Sources
    let officialResults: TavilySearchResult[] = [];
    try {
      logger?.info('Tavily-Phase3', 'OFFICIAL検索を実行中...', {
        query: keyword,
        excludeDomains: ['x.com', 'twitter.com', 'reddit.com', 'facebook.com']
      });
      const stopTimer = logger?.startTimer('Tavily-Phase3');

      const officialData = await this.search(keyword, {
        topic: 'general',
        maxResults,
        searchDepth,
        includeAnswer: 'advanced',
        excludeDomains: ['x.com', 'twitter.com', 'reddit.com', 'facebook.com'],
        country,
      });
      apiCallCount++;

      const duration = stopTimer?.();

      if (officialData.answer) {
        summaries.push(`[OFFICIAL] ${officialData.answer}`);
      }

      officialResults = this.filterByScore(officialData.results || []);
      logger?.success('Tavily-Phase3', 'OFFICIAL検索完了', {
        totalResults: officialData.results?.length || 0,
        filteredResults: officialResults.length,
        hasAnswer: !!officialData.answer,
        durationMs: duration,
      });

      if (officialResults.length > 0) {
        contextParts.push(this.formatResults(officialResults, 'OFFICIAL/AUTHORITATIVE SOURCES'));
      }
    } catch (error) {
      logger?.error('Tavily-Phase3', 'OFFICIAL検索失敗', { error: String(error) });
      console.warn('Official sources search failed:', error);
    }

    // Combine results
    let formattedContext = '';

    if (summaries.length > 0) {
      formattedContext += '=== TAVILY AI SUMMARY ===\n';
      formattedContext += summaries.join('\n');
      formattedContext += '\n\n';
    }

    if (contextParts.length > 0) {
      formattedContext += contextParts.join('\n\n');
    }

    logger?.success('Tavily', 'マルチフェーズ検索完了', {
      totalApiCalls: apiCallCount,
      newsCount: newsResults.length,
      snsCount: snsResults.length,
      officialCount: officialResults.length,
      summaryCount: summaries.length,
    });

    return {
      summaries,
      news: newsResults,
      sns: snsResults,
      official: officialResults,
      formattedContext,
      apiCallCount,
    };
  }

  /**
   * Search and format for LLM consumption
   */
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

  /**
   * Research a topic with multiple queries (original method)
   */
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

  /**
   * Enhanced research for article generation using multi-phase search
   */
  async researchForArticle(
    keyword: string,
    options?: {
      language?: 'en' | 'ja';
      includeSubQueries?: boolean;
      logger?: PipelineLogger;
    }
  ): Promise<{ context: string; apiCallCount: number }> {
    const country = options?.language === 'ja' ? 'japan' : undefined;
    const logger = options?.logger;
    let totalApiCalls = 0;

    logger?.info('Research', 'リサーチを開始', { keyword, language: options?.language });

    // Use multi-phase search
    const multiPhaseResult = await this.multiPhaseSearch(keyword, {
      maxResults: 5,
      searchDepth: 'advanced',
      timeRange: 'week',
      country,
      logger,
    });
    totalApiCalls += multiPhaseResult.apiCallCount;

    let researchContext = multiPhaseResult.formattedContext;

    // Optionally add sub-query results
    if (options?.includeSubQueries) {
      const subQueries = RESEARCH_QUERIES.forKeyword(keyword);
      logger?.info('Research', 'サブクエリ検索を開始', { queries: subQueries });

      const subResults = await this.researchTopic(keyword, subQueries);
      totalApiCalls += subQueries.length;

      for (const [query, results] of subResults) {
        const filtered = this.filterByScore(results.results || []);
        if (filtered.length > 0) {
          researchContext += `\n## Research: ${query}\n`;
          for (const result of filtered.slice(0, 3)) {
            researchContext += `- ${result.title}: ${result.content.slice(0, 200)}...\n`;
            researchContext += `  Source: ${result.url}\n`;
          }
        }
      }
      logger?.success('Research', 'サブクエリ検索完了', { queriesProcessed: subQueries.length });
    }

    logger?.success('Research', 'リサーチ完了', {
      totalApiCalls,
      contextLength: researchContext.length,
    });

    return { context: researchContext, apiCallCount: totalApiCalls };
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
