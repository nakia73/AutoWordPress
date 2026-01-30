// Argo Note - Stream 02 WordPress Module
// Public exports

export { WordPressManager } from './wordpress-manager';
export type {
  CreateSiteInput,
  CreateSiteResult,
  PostArticleInput,
  PostArticleResult,
} from './wordpress-manager';

export { SiteManager } from './site-manager';
export type { SiteCreateResult, SiteManagerErrorCode } from './site-manager';

export { ArticlePublisher } from './article-publisher';
export type {
  ArticlePublishInput,
  ArticlePublishResult,
  ArticlePublisherErrorCode,
  ImageUploadResult,
} from './article-publisher';

export { WordPressClient, WordPressAPIError, createWordPressClient } from './client';
export type {
  WPPostRequest,
  WPPostResponse,
  WPPostStatus,
  WPMediaUploadResponse,
  WPClientOptions,
} from './types';
