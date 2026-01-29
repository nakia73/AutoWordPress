// Argo Note - LLM Client
// Multi-provider support: Gemini, Claude (Anthropic)
// ソフトコーディング: 環境変数でモデルを切り替え可能

import type { LLMCompletionResponse, LLMMessage } from '@/types';

// ============================================
// サポートするLLMモデル定義
// ============================================
export const LLM_MODELS = {
  // Google Gemini 3 (最新世代 - 2026年1月リリース)
  'gemini-3-pro': {
    id: 'gemini-3-pro-preview',
    provider: 'google',
    name: 'Gemini 3 Pro',
    apiKeyEnv: 'GEMINI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    litellmId: 'gemini/gemini-3-pro-preview',
    pricing: { input: 2.0, output: 12.0 }, // $/M tokens (<200k)
  },
  'gemini-3-flash': {
    id: 'gemini-3-flash-preview',
    provider: 'google',
    name: 'Gemini 3 Flash',
    apiKeyEnv: 'GEMINI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    litellmId: 'gemini/gemini-3-flash-preview',
    pricing: { input: 0.5, output: 3.0 }, // $/M tokens
  },
  // Anthropic Claude 4.5 (最新世代)
  'claude-haiku-4.5': {
    id: 'claude-haiku-4-5',
    provider: 'anthropic',
    name: 'Claude Haiku 4.5',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com/v1',
    litellmId: 'anthropic/claude-haiku-4-5',
    pricing: { input: 0.8, output: 4.0 }, // $/M tokens
  },
  'claude-sonnet-4.5': {
    id: 'claude-sonnet-4-5',
    provider: 'anthropic',
    name: 'Claude Sonnet 4.5',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com/v1',
    litellmId: 'anthropic/claude-sonnet-4-5',
    pricing: { input: 3.0, output: 15.0 }, // $/M tokens
  },
  'claude-opus-4.5': {
    id: 'claude-opus-4-5',
    provider: 'anthropic',
    name: 'Claude Opus 4.5',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    baseUrl: 'https://api.anthropic.com/v1',
    litellmId: 'anthropic/claude-opus-4-5',
    pricing: { input: 15.0, output: 75.0 }, // $/M tokens
  },
} as const;

export type LLMModelKey = keyof typeof LLM_MODELS;
export type LLMProvider = 'google' | 'anthropic' | 'litellm';

// 環境変数から設定を読み込み
const LLM_MODEL = process.env.LLM_MODEL || 'gemini-3-flash';
const LLM_TIMEOUT = parseInt(process.env.LLM_TIMEOUT_SECONDS || '30') * 1000;
const USE_LITELLM = process.env.USE_LITELLM === 'true';

// APIキー取得（プロバイダー別）
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.LITELLM_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const LITELLM_API_KEY = process.env.LITELLM_API_KEY || '';

/**
 * モデル設定を取得
 */
function getModelConfig(modelKey: string) {
  // 直接モデルIDが指定された場合（後方互換性）
  if (modelKey.includes('/')) {
    // LiteLLM形式 (例: gemini/gemini-3-flash-preview)
    const provider = modelKey.split('/')[0];
    return {
      id: modelKey,
      provider: provider as LLMProvider,
      name: modelKey,
      apiKeyEnv: provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY',
      baseUrl: provider === 'anthropic' ? 'https://api.anthropic.com/v1' : 'https://generativelanguage.googleapis.com/v1beta',
      litellmId: modelKey,
    };
  }

  // 定義済みモデルキーから取得
  const config = LLM_MODELS[modelKey as LLMModelKey];
  if (!config) {
    console.warn(`Unknown model: ${modelKey}, falling back to gemini-3-flash`);
    return LLM_MODELS['gemini-3-flash'];
  }
  return config;
}

/**
 * プロバイダー別のAPIキーを取得
 */
function getApiKey(provider: string): string {
  switch (provider) {
    case 'anthropic':
      return ANTHROPIC_API_KEY;
    case 'google':
    case 'gemini':
      return GEMINI_API_KEY;
    default:
      return LITELLM_API_KEY;
  }
}

export class LLMClient {
  private model: string;
  private modelConfig: ReturnType<typeof getModelConfig>;
  private apiKey: string;
  private baseUrl: string;
  private useLiteLLM: boolean;

  constructor(options?: { model?: string; apiKey?: string; baseUrl?: string; useLiteLLM?: boolean }) {
    const modelKey = options?.model || LLM_MODEL;
    this.modelConfig = getModelConfig(modelKey);
    this.model = this.modelConfig.id;
    this.useLiteLLM = options?.useLiteLLM ?? USE_LITELLM;

    // LiteLLM経由の場合はLiteLLMのエンドポイントを使用
    if (this.useLiteLLM) {
      this.apiKey = options?.apiKey || LITELLM_API_KEY;
      this.baseUrl = options?.baseUrl || 'https://api.litellm.ai/v1';
      this.model = this.modelConfig.litellmId;
    } else {
      this.apiKey = options?.apiKey || getApiKey(this.modelConfig.provider);
      this.baseUrl = options?.baseUrl || this.modelConfig.baseUrl;
    }
  }

  /**
   * 現在のモデル情報を取得
   */
  getModelInfo() {
    return {
      model: this.model,
      provider: this.modelConfig.provider,
      name: this.modelConfig.name,
      useLiteLLM: this.useLiteLLM,
    };
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
      let response: Response;

      // プロバイダー別のAPI呼び出し
      if (this.useLiteLLM || this.modelConfig.provider === 'google') {
        // LiteLLM または Google (OpenAI互換API)
        response = await this.callOpenAICompatible(messages, options, controller.signal);
      } else if (this.modelConfig.provider === 'anthropic') {
        // Anthropic Messages API
        response = await this.callAnthropic(messages, options, controller.signal);
      } else {
        // デフォルト: OpenAI互換
        response = await this.callOpenAICompatible(messages, options, controller.signal);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${error}`);
      }

      // レスポンスのパース（プロバイダー別）
      const data = await response.json();

      if (this.modelConfig.provider === 'anthropic' && !this.useLiteLLM) {
        // Anthropic形式のレスポンス
        return data.content?.[0]?.text || '';
      } else if (this.modelConfig.provider === 'google' && !this.useLiteLLM) {
        // Google AI Studio直接呼び出しのレスポンス形式
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // OpenAI互換形式 (LiteLLM含む)
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('LLM request timed out');
      }
      throw error;
    }
  }

  /**
   * OpenAI互換API呼び出し (Gemini, LiteLLM)
   */
  private async callOpenAICompatible(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number },
    signal?: AbortSignal
  ): Promise<Response> {
    // Google AI Studio直接呼び出しの場合
    if (this.modelConfig.provider === 'google' && !this.useLiteLLM) {
      return fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : m.role === 'system' ? 'user' : m.role,
              parts: [{ text: m.content }],
            })),
            generationConfig: {
              temperature: options?.temperature ?? 0.7,
              maxOutputTokens: options?.maxTokens ?? 4096,
            },
          }),
          signal,
        }
      );
    }

    // LiteLLM / OpenAI互換
    return fetch(`${this.baseUrl}/chat/completions`, {
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
      signal,
    });
  }

  /**
   * Anthropic Messages API呼び出し
   */
  private async callAnthropic(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number },
    signal?: AbortSignal
  ): Promise<Response> {
    // systemメッセージを分離
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    return fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.7,
        system: systemMessage?.content || '',
        messages: nonSystemMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal,
    });
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
