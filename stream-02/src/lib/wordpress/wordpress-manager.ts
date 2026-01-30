// Argo Note - Stream 02 WordPress Manager
// 公開API：Integration Phaseからの唯一のエントリーポイント

import { SiteManager, SiteCreateResult } from './site-manager';
import { ArticlePublisher, ArticlePublishResult } from './article-publisher';
import { WordPressClient } from './client';
import { WPCLIClient } from '@/lib/vps/wp-cli';

// 公開する型定義
export interface CreateSiteInput {
  slug: string;
  title: string;
  email: string;
}

export interface CreateSiteResult {
  success: boolean;
  data?: {
    siteId: number;
    url: string;
    credentials: {
      username: string;
      password: string;
    };
  };
  error?: {
    code: 'SITE_EXISTS' | 'WP_CLI_ERROR' | 'SSH_ERROR' | 'UNKNOWN';
    message: string;
  };
}

export interface PostArticleInput {
  siteUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  article: {
    title: string;
    content: string;
    status: 'publish' | 'draft';
    featuredImage?: {
      buffer: Buffer;
      filename: string;
      mimeType: string;
    };
  };
}

export interface PostArticleResult {
  success: boolean;
  data?: {
    postId: number;
    postUrl: string;
  };
  error?: {
    code: 'AUTH_ERROR' | 'API_ERROR' | 'UPLOAD_ERROR' | 'UNKNOWN';
    message: string;
  };
}

/**
 * WordPress管理クライアント
 * Integration Phaseからはこのクラスのみを使用する
 */
export class WordPressManager {
  /**
   * 新規サイトを作成
   */
  async createSite(input: CreateSiteInput): Promise<CreateSiteResult> {
    const wpcli = new WPCLIClient();
    const siteManager = new SiteManager(wpcli);

    return siteManager.create(input.slug, input.title, input.email);
  }

  /**
   * 記事を投稿
   */
  async postArticle(input: PostArticleInput): Promise<PostArticleResult> {
    const client = new WordPressClient({
      baseUrl: input.siteUrl,
      username: input.credentials.username,
      applicationPassword: input.credentials.password,
    });

    const publisher = new ArticlePublisher(client);

    return publisher.publish({
      title: input.article.title,
      content: input.article.content,
      status: input.article.status,
      featuredImage: input.article.featuredImage,
    });
  }
}
