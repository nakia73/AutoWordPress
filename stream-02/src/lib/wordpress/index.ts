// Argo Note - Stream 02 WordPress Module
// Public exports
//
// Stream02の責務:
// 1. WordPressセットアップ（VPSプロビジョニング〜サブサイト作成）
// 2. 記事投稿機能の動作検証（Mockデータを使用）

// セットアップ関連
export { WordPressSetupManager } from './wordpress-setup-manager';
export type {
  SetupSiteInput,
  SetupSiteResult,
} from './wordpress-setup-manager';

export { SiteManager } from './site-manager';
export type { SiteCreateResult, SiteManagerErrorCode } from './site-manager';

// 記事投稿関連
export { ArticlePublisher } from './article-publisher';
export type {
  ArticlePublishInput,
  ArticlePublishResult,
  ArticlePublisherErrorCode,
  ImageUploadResult,
} from './article-publisher';

// Mockデータ（テスト用）
export {
  MOCK_ARTICLE,
  MOCK_ARTICLE_PUBLISHED,
  createMockImageBuffer,
  createMockArticleWithImage,
  createMockArticles,
} from './mock-data';

// WordPress REST APIクライアント
export { WordPressClient, WordPressAPIError, createWordPressClient } from './client';
export type {
  WPPostRequest,
  WPPostResponse,
  WPPostStatus,
  WPMediaUploadResponse,
  WPClientOptions,
} from './types';
