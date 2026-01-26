// Argo Note - Article Type Definitions
// Based on: docs/architecture/02_Backend_Database.md
// Integration fixes from: docs/architecture/08_Integration_Risk_Report.md IR-011, IR-023

// Article Status - IR-023: Added generating, review, failed
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  REVIEW: 'review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  FAILED: 'failed',
} as const;

export type ArticleStatus = (typeof ARTICLE_STATUS)[keyof typeof ARTICLE_STATUS];

// Article Type
export const ARTICLE_TYPE = {
  ARTICLE: 'article',
  FAQ: 'faq',
  GLOSSARY: 'glossary',
} as const;

export type ArticleType = (typeof ARTICLE_TYPE)[keyof typeof ARTICLE_TYPE];

// Article content structure
export type ArticleContent = {
  title: string;
  content: string; // HTML - IR-008
  meta_description: string;
  target_keyword: string;
  search_intent: string;
  article_type: ArticleType;
};

// Article generation config
export type ArticleGenerationConfig = {
  target_word_count: number;
  include_faq: boolean;
  include_images: boolean;
  tone: 'professional' | 'casual' | 'technical';
  language: 'en' | 'ja';
};

// Default word counts by article type
export const ARTICLE_WORD_COUNTS: Record<ArticleType, { min: number; max: number }> = {
  article: { min: 3000, max: 4000 },
  faq: { min: 1500, max: 2500 },
  glossary: { min: 1000, max: 2000 },
};

// Search Intent Types - IR-016
export const SEARCH_INTENT = {
  INFORMATIONAL: 'informational',
  TRANSACTIONAL: 'transactional',
  NAVIGATIONAL: 'navigational',
} as const;

export type SearchIntent = (typeof SEARCH_INTENT)[keyof typeof SEARCH_INTENT];
