// Argo Note - Job Type Definitions
// Based on: docs/architecture/08_Integration_Risk_Report.md IR-002

// Job Types (SCREAMING_SNAKE_CASE for DB, kebab-case for Inngest events)
export const JOB_TYPES = {
  ANALYZE_PRODUCT: 'ANALYZE_PRODUCT',
  GENERATE_ARTICLE: 'GENERATE_ARTICLE',
  SYNC_WP: 'SYNC_WP',
  PROVISION_BLOG: 'PROVISION_BLOG',
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

// Job Status
export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

// Job Payloads - IR-002
export type AnalyzeProductPayload = {
  product_id: string;
  mode: 'url' | 'interactive' | 'research';
  url?: string;
  answers?: Record<string, string>;
  keywords?: string[];
};

export type GenerateArticlePayload = {
  article_id: string;
  product_id: string;
  target_keyword: string;
  cluster_id?: string;
};

export type SyncWordPressPayload = {
  article_id: string;
  site_id: string;
  action: 'create' | 'update' | 'delete';
};

export type ProvisionBlogPayload = {
  site_id: string;
  user_id: string;
  subdomain: string;
  theme: string;
};

export type JobPayload =
  | { type: 'ANALYZE_PRODUCT'; data: AnalyzeProductPayload }
  | { type: 'GENERATE_ARTICLE'; data: GenerateArticlePayload }
  | { type: 'SYNC_WP'; data: SyncWordPressPayload }
  | { type: 'PROVISION_BLOG'; data: ProvisionBlogPayload };

// Inngest Event Names (kebab-case) - IR-021
export const INNGEST_EVENTS = {
  ANALYZE_PRODUCT: 'product/analyze',
  GENERATE_ARTICLE: 'article/generate',
  SYNC_WP: 'wordpress/sync',
  PROVISION_BLOG: 'blog/provision',
} as const;

// Retry Configuration - IR-018
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BACKOFF_MS: [60000, 300000, 900000], // 1min, 5min, 15min
} as const;
