// Argo Note - External API Type Definitions
// Based on: docs/architecture/08_Integration_Risk_Report.md IR-003

// ============================================
// Tavily API Types
// ============================================

export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};

export type TavilySearchResponse = {
  results: TavilySearchResult[];
  query: string;
  response_time: number;
};

// Mapped input for LLM - IR-003
export type TavilyToLLMInput = {
  search_query: string;
  top_results: Array<{
    title: string;
    url: string;
    summary: string; // content summarized
  }>;
  analysis_prompt: string;
};

// ============================================
// WordPress REST API Types
// ============================================

export type WPPostStatus = 'publish' | 'draft' | 'pending' | 'private' | 'trash';

export type WPPostRequest = {
  title: string;
  content: string;
  status: WPPostStatus;
  slug?: string;
  excerpt?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
};

export type WPPostResponse = {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: WPPostStatus;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
};

// WordPress Error Handling - IR-007
export type WPErrorHandler = {
  action: 'notify_user' | 'retry_with_backoff';
  message?: string;
  retry?: boolean;
  maxRetries?: number;
  backoffMs?: number[];
  finalAction?: 'notify_user';
  updateSiteStatus?: string;
};

export const WP_ERROR_HANDLERS: Record<number, WPErrorHandler> = {
  401: {
    action: 'notify_user',
    message: 'WordPress認証が無効です。再接続してください。',
    retry: false,
    updateSiteStatus: 'auth_required',
  },
  403: {
    action: 'notify_user',
    message: 'WordPress権限が不足しています。',
    retry: false,
    updateSiteStatus: 'permission_error',
  },
  500: {
    action: 'retry_with_backoff',
    maxRetries: 3,
    backoffMs: [60000, 300000, 900000], // 1min, 5min, 15min
    finalAction: 'notify_user',
  },
  502: {
    action: 'retry_with_backoff',
    maxRetries: 5,
    backoffMs: [30000, 60000, 120000, 300000, 600000],
    finalAction: 'notify_user',
  },
};

// ============================================
// LLM API Types (Gemini via LiteLLM)
// ============================================

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMCompletionRequest = {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
};

export type LLMCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

// LLM Configuration - IR-019
export const LLM_CONFIG = {
  TIMEOUT_SECONDS: 30, // Single LLM call
  ARTICLE_TIMEOUT_MINUTES: 20, // Full article generation
  MAX_LLM_CALLS_PER_ARTICLE: 20,
} as const;

// ============================================
// Stripe API Types
// ============================================

export type StripeSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
};

// ============================================
// Nanobana Pro API Types (Image Generation)
// ============================================

export type NanobanaImageStyle =
  | 'illustration'
  | 'photography'
  | 'digital_art'
  | 'minimalist';

export type NanobanaRequest = {
  prompt: string;
  style?: NanobanaImageStyle;
  width?: number;
  height?: number;
  quality?: 'standard' | 'high';
};

export type NanobanaResponse = {
  image_url: string;
  generation_time_ms: number;
};
