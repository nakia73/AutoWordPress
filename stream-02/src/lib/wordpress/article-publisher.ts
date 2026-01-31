// Argo Note - Stream 02 Article Publisher
// 記事投稿のビジネスロジック
//
// Stream02の責務: WordPressへの記事投稿機能が動作することを検証
// ※ 記事の内容はMockデータを使用（Stream01の出力は使用しない）

import { WordPressClient, WordPressAPIError } from './client';

export type ArticlePublisherErrorCode = 'AUTH_ERROR' | 'API_ERROR' | 'UPLOAD_ERROR' | 'UNKNOWN';

export interface ArticlePublishInput {
  title: string;
  content: string;
  status: 'publish' | 'draft';
  featuredImage?: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  };
}

export interface ArticlePublishResult {
  success: boolean;
  data?: {
    postId: number;
    postUrl: string;
  };
  error?: {
    code: ArticlePublisherErrorCode;
    message: string;
  };
}

export interface ImageUploadResult {
  success: boolean;
  data?: {
    mediaId: number;
    url: string;
  };
  error?: {
    code: ArticlePublisherErrorCode;
    message: string;
  };
}

export class ArticlePublisher {
  private client: WordPressClient;

  constructor(client: WordPressClient) {
    this.client = client;
  }

  /**
   * 画像をアップロード
   */
  async uploadImage(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<ImageUploadResult> {
    try {
      const result = await this.client.uploadMedia(buffer, filename, mimeType);

      return {
        success: true,
        data: {
          mediaId: result.id,
          url: result.source_url,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.mapError(error, 'UPLOAD_ERROR'),
      };
    }
  }

  /**
   * 記事を投稿
   */
  async publish(article: ArticlePublishInput): Promise<ArticlePublishResult> {
    try {
      let featuredMediaId: number | undefined;

      // サムネイル画像がある場合は先にアップロード
      if (article.featuredImage) {
        const uploadResult = await this.uploadImage(
          article.featuredImage.buffer,
          article.featuredImage.filename,
          article.featuredImage.mimeType
        );

        if (!uploadResult.success) {
          return {
            success: false,
            error: uploadResult.error,
          };
        }

        featuredMediaId = uploadResult.data?.mediaId;
      }

      // 記事を投稿
      const post = await this.client.createPost({
        title: article.title,
        content: article.content,
        status: article.status,
        featured_media: featuredMediaId,
      });

      return {
        success: true,
        data: {
          postId: post.id,
          postUrl: post.link,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.mapError(error, 'API_ERROR'),
      };
    }
  }

  /**
   * エラーをマッピング
   */
  private mapError(
    error: unknown,
    defaultCode: ArticlePublisherErrorCode
  ): { code: ArticlePublisherErrorCode; message: string } {
    if (error instanceof WordPressAPIError) {
      const code: ArticlePublisherErrorCode =
        error.statusCode === 401 || error.statusCode === 403
          ? 'AUTH_ERROR'
          : defaultCode;

      return {
        code,
        message: error.message,
      };
    }

    return {
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
