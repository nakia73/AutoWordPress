// Argo Note - Stream 02 Site Manager
// サイト作成のビジネスロジック
//
// Stream02の責務: サブサイト作成・認証情報発行

import { WPCLIClient } from '@/lib/vps/wp-cli';

export type SiteManagerErrorCode = 'SITE_EXISTS' | 'WP_CLI_ERROR' | 'SSH_ERROR' | 'UNKNOWN';

export interface SiteCreateResult {
  success: boolean;
  data?: {
    siteId: number;
    url: string;
    credentials: {
      username: string;
      applicationPassword: string;  // Stream04での記事投稿に使用
    };
  };
  error?: {
    code: SiteManagerErrorCode;
    message: string;
  };
}

export class SiteManager {
  private wpcli: WPCLIClient;

  constructor(wpcli?: WPCLIClient) {
    this.wpcli = wpcli || new WPCLIClient();
  }

  /**
   * 新規サイトを作成
   */
  async create(slug: string, title: string, email: string): Promise<SiteCreateResult> {
    try {
      await this.wpcli.connect();

      // サイトの重複チェック
      const exists = await this.wpcli.siteExists(slug);
      if (exists) {
        return {
          success: false,
          error: {
            code: 'SITE_EXISTS',
            message: `Site with slug "${slug}" already exists`,
          },
        };
      }

      // サイト作成
      const createResult = await this.wpcli.createSite({ slug, title, email });
      if (!createResult.success || !createResult.blogId || !createResult.url) {
        return {
          success: false,
          error: {
            code: 'WP_CLI_ERROR',
            message: createResult.error || 'Failed to create site',
          },
        };
      }

      // Application Password作成（REST API認証用）
      const appPassword = await this.wpcli.createApplicationPassword(
        'admin',
        `argo-note-${slug}`,
        createResult.url
      );

      if (!appPassword) {
        return {
          success: false,
          error: {
            code: 'WP_CLI_ERROR',
            message: 'Failed to create application password',
          },
        };
      }

      return {
        success: true,
        data: {
          siteId: createResult.blogId,
          url: createResult.url,
          credentials: {
            username: 'admin',
            applicationPassword: appPassword.password,
          },
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const code: SiteManagerErrorCode = message.includes('SSH') ? 'SSH_ERROR' : 'UNKNOWN';

      return {
        success: false,
        error: {
          code,
          message,
        },
      };
    } finally {
      this.wpcli.disconnect();
    }
  }
}
