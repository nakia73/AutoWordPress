/**
 * Tavily Client Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TavilyClient, RESEARCH_QUERIES } from '../tavily-client';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TavilyClient', () => {
  let client: TavilyClient;

  beforeEach(() => {
    client = new TavilyClient('test-api-key');
    mockFetch.mockReset();
  });

  describe('search()', () => {
    it('should make a search request with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { title: 'Test Result', url: 'https://example.com', content: 'Test content', score: 0.9 }
          ]
        })
      });

      const result = await client.search('test query', {
        searchDepth: 'advanced',
        maxResults: 5
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.tavily.com/search',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe('Test Result');
    });

    it('should handle 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
      });

      await expect(client.search('test')).rejects.toThrow('Invalid API key (401)');
    });

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limited'
      });

      await expect(client.search('test')).rejects.toThrow('Rate limit exceeded (429)');
    });

    it('should handle 432 insufficient credits error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 432,
        text: async () => 'No credits'
      });

      await expect(client.search('test')).rejects.toThrow('Insufficient credits (432)');
    });
  });

  describe('filterByScore()', () => {
    it('should filter results by minimum score', () => {
      const results = [
        { title: 'High', url: 'a', content: 'a', score: 0.9 },
        { title: 'Low', url: 'b', content: 'b', score: 0.3 },
        { title: 'Medium', url: 'c', content: 'c', score: 0.7 }
      ];

      const filtered = client.filterByScore(results, 0.6);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].title).toBe('High');
      expect(filtered[1].title).toBe('Medium');
    });

    it('should use default minimum score if not provided', () => {
      const results = [
        { title: 'High', url: 'a', content: 'a', score: 0.9 },
        { title: 'Low', url: 'b', content: 'b', score: 0.3 }
      ];

      const filtered = client.filterByScore(results);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('High');
    });
  });

  describe('formatResults()', () => {
    it('should format results with section title', () => {
      const results = [
        { title: 'Test Title', url: 'https://example.com', content: 'Test content', score: 0.9 }
      ];

      const formatted = client.formatResults(results, 'TEST SECTION');

      expect(formatted).toContain('=== TEST SECTION ===');
      expect(formatted).toContain('Title: Test Title');
      expect(formatted).toContain('URL: https://example.com');
      expect(formatted).toContain('Relevance: 0.90');
    });

    it('should limit to 3 results', () => {
      const results = Array(5).fill(null).map((_, i) => ({
        title: `Result ${i}`,
        url: `https://example.com/${i}`,
        content: `Content ${i}`,
        score: 0.9
      }));

      const formatted = client.formatResults(results, 'TEST');
      const titleMatches = formatted.match(/Title:/g);

      expect(titleMatches).toHaveLength(3);
    });
  });

  describe('multiPhaseSearch()', () => {
    it('should execute 3-phase search', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          answer: 'Test answer',
          results: [
            { title: 'Result', url: 'https://example.com', content: 'Content', score: 0.9 }
          ]
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.multiPhaseSearch('test keyword');

      // Should make 3 API calls (NEWS, SNS, OFFICIAL)
      expect(mockFetch).toHaveBeenCalledTimes(3);

      expect(result.summaries).toBeDefined();
      expect(result.news).toBeDefined();
      expect(result.sns).toBeDefined();
      expect(result.official).toBeDefined();
      expect(result.formattedContext).toBeDefined();
    });

    it('should handle individual phase failures gracefully', async () => {
      // First call fails, rest succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            results: [{ title: 'Result', url: 'url', content: 'content', score: 0.9 }]
          })
        });

      const result = await client.multiPhaseSearch('test');

      // Should still return results from successful phases
      expect(result).toBeDefined();
      expect(result.formattedContext).toBeDefined();
    });
  });

  describe('researchForArticle()', () => {
    it('should use multi-phase search for article research', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: 'Research answer',
          results: [{ title: 'Result', url: 'url', content: 'content', score: 0.9 }]
        })
      });

      const result = await client.researchForArticle('test keyword', {
        language: 'ja'
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.context).toBeDefined();
      expect(typeof result.context).toBe('string');
      expect(result.apiCallCount).toBeGreaterThanOrEqual(1);
    });

    it('should include sub-queries when requested', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          answer: 'Research answer',
          results: [{ title: 'Result', url: 'https://example.com', content: 'content text here', score: 0.9 }]
        })
      });

      const result = await client.researchForArticle('test keyword', {
        language: 'en',
        includeSubQueries: true
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.context).toBeDefined();
      expect(typeof result.context).toBe('string');
      // Should have made more than 3 calls (3 for multi-phase + 5 for sub-queries)
      expect(mockFetch.mock.calls.length).toBeGreaterThan(3);
    });
  });

  describe('searchForLLM()', () => {
    it('should format search results for LLM consumption', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { title: 'Result 1', url: 'https://example.com/1', content: 'Long content that should be truncated to 500 characters for token efficiency...' },
            { title: 'Result 2', url: 'https://example.com/2', content: 'Another result content' }
          ]
        })
      });

      const result = await client.searchForLLM('test query', 'Analyze these results');

      expect(result.search_query).toBe('test query');
      expect(result.analysis_prompt).toBe('Analyze these results');
      expect(result.top_results).toHaveLength(2);
      expect(result.top_results[0].title).toBe('Result 1');
      expect(result.top_results[0].url).toBe('https://example.com/1');
      expect(result.top_results[0].summary).toBeDefined();
    });
  });

  describe('researchTopic()', () => {
    it('should research topic with multiple sub-queries', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [{ title: 'Result', url: 'url', content: 'content', score: 0.9 }]
        })
      });

      const subQueries = ['feature 1', 'feature 2'];
      const result = await client.researchTopic('main topic', subQueries);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(result.has('feature 1')).toBe(true);
      expect(result.has('feature 2')).toBe(true);
    });
  });

  describe('search() with all options', () => {
    it('should include optional parameters in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await client.search('test', {
        topic: 'news',
        timeRange: 'week',
        includeDomains: ['example.com'],
        excludeDomains: ['spam.com'],
        country: 'japan',
        includeImages: true
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.topic).toBe('news');
      expect(callBody.time_range).toBe('week');
      expect(callBody.include_domains).toEqual(['example.com']);
      expect(callBody.exclude_domains).toEqual(['spam.com']);
      expect(callBody.country).toBe('japan');
      expect(callBody.include_images).toBe(true);
    });

    it('should handle generic API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server Error'
      });

      await expect(client.search('test')).rejects.toThrow('Tavily API error: 500');
    });
  });
});

describe('RESEARCH_QUERIES', () => {
  it('should generate keyword queries', () => {
    const queries = RESEARCH_QUERIES.forKeyword('task management');

    expect(queries).toContain('task management');
    expect(queries).toContain('task management best practices');
    expect(queries.length).toBe(5);
  });

  it('should generate product queries', () => {
    const queries = RESEARCH_QUERIES.forProduct('TaskFlow');

    expect(queries).toContain('TaskFlow review');
    expect(queries).toContain('TaskFlow alternatives');
    expect(queries.length).toBe(5);
  });

  it('should generate competitor analysis queries', () => {
    const queries = RESEARCH_QUERIES.forCompetitorAnalysis('TaskFlow');

    expect(queries).toContain('TaskFlow competitors');
    expect(queries).toContain('TaskFlow vs');
    expect(queries.length).toBe(3);
  });
});
