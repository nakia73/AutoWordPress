// Argo Note - LLM Client
// Gemini via LiteLLM proxy

import type { LLMCompletionResponse, LLMMessage } from '@/types';

const LLM_MODEL = process.env.LLM_MODEL || 'gemini/gemini-2.0-flash-exp';
const LLM_TIMEOUT = parseInt(process.env.LLM_TIMEOUT_SECONDS || '30') * 1000;
const LITELLM_API_KEY = process.env.LITELLM_API_KEY;

export class LLMClient {
  private model: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(options?: { model?: string; apiKey?: string; baseUrl?: string }) {
    this.model = options?.model || LLM_MODEL;
    this.apiKey = options?.apiKey || LITELLM_API_KEY || '';
    this.baseUrl = options?.baseUrl || 'https://api.litellm.ai/v1';
  }

  async complete(
    messages: LLMMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    }
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout || LLM_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${error}`);
      }

      const data: LLMCompletionResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('LLM request timed out');
      }
      throw error;
    }
  }

  // Helper for simple prompts
  async prompt(systemPrompt: string, userPrompt: string): Promise<string> {
    return this.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  // JSON response helper
  async jsonPrompt<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const response = await this.complete([
      {
        role: 'system',
        content: `${systemPrompt}\n\nYou must respond with valid JSON only. No markdown, no code blocks, just pure JSON.`,
      },
      { role: 'user', content: userPrompt },
    ]);

    try {
      // Try to extract JSON from response
      let jsonStr = response.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }

      return JSON.parse(jsonStr.trim()) as T;
    } catch {
      throw new Error(`Failed to parse LLM JSON response: ${response}`);
    }
  }
}

// Default client instance
export const llmClient = new LLMClient();

// Article generation specific prompts
export const ARTICLE_PROMPTS = {
  OUTLINE: `You are an expert SEO content strategist. Generate a comprehensive article outline.
The outline should include:
- A compelling title optimized for the target keyword
- H2 and H3 headings that cover the topic thoroughly
- Brief notes on what each section should cover
Return as JSON with the structure:
{
  "title": "string",
  "sections": [
    { "heading": "string", "level": 2 | 3, "notes": "string" }
  ]
}`,

  CONTENT: `You are an expert content writer specializing in SEO-optimized articles.
Write engaging, informative content that:
- Is optimized for the target keyword naturally (no keyword stuffing)
- Provides genuine value to readers
- Uses clear, accessible language
- Includes specific examples and actionable advice
- Is formatted in valid HTML with proper heading hierarchy`,

  META_DESCRIPTION: `Write a compelling meta description (max 160 characters) that:
- Includes the target keyword naturally
- Encourages clicks from search results
- Accurately summarizes the content`,
};
