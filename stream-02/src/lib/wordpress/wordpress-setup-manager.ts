// Argo Note - Stream 02 WordPress Setup Manager
// 公開API：WordPressセットアップ機能のエントリーポイント
//
// Stream02の責務: WordPressがセットアップできるか
// - VPSプロビジョニング
// - WordPress Multisite構築
// - サブサイト作成
// - 認証情報発行
//
// 記事投稿はStream04（結合フェーズ）の責務

import { SiteManager, SiteCreateResult } from './site-manager';
import { WPCLIClient } from '@/lib/vps/wp-cli';

// 公開する型定義
export interface SetupSiteInput {
  slug: string;      // サブドメイン（例: "user-123"）
  title: string;     // サイトタイトル
  email: string;     // 管理者メールアドレス
}

export interface SetupSiteResult {
  success: boolean;
  data?: {
    siteId: number;
    url: string;                    // https://user-123.example.com
    adminUrl: string;               // https://user-123.example.com/wp-admin
    restApiUrl: string;             // https://user-123.example.com/wp-json/wp/v2
    credentials: {
      username: string;
      applicationPassword: string;  // Stream04での記事投稿に使用
    };
    createdAt: string;
  };
  error?: {
    code: 'SITE_EXISTS' | 'WP_CLI_ERROR' | 'SSH_ERROR' | 'UNKNOWN';
    message: string;
  };
}

/**
 * WordPress セットアップマネージャー
 *
 * Stream02の公開API。WordPressセットアップ機能を提供する。
 *
 * 使用例:
 * ```typescript
 * const manager = new WordPressSetupManager();
 * const result = await manager.setupSite({
 *   slug: 'my-blog',
 *   title: 'My Blog',
 *   email: 'admin@example.com',
 * });
 *
 * if (result.success) {
 *   console.log('Site URL:', result.data.url);
 *   // credentials は Stream04 で記事投稿に使用
 * }
 * ```
 */
export class WordPressSetupManager {
  /**
   * 新規サイトをセットアップ
   *
   * 以下のステップを実行:
   * 1. サブサイト作成（WP-CLI経由）
   * 2. 管理者ユーザー作成
   * 3. Application Password発行
   */
  async setupSite(input: SetupSiteInput): Promise<SetupSiteResult> {
    const wpcli = new WPCLIClient();
    const siteManager = new SiteManager(wpcli);

    const result = await siteManager.create(input.slug, input.title, input.email);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // SiteCreateResult を SetupSiteResult に変換
    return {
      success: true,
      data: {
        siteId: result.data!.siteId,
        url: result.data!.url,
        adminUrl: `${result.data!.url}/wp-admin`,
        restApiUrl: `${result.data!.url}/wp-json/wp/v2`,
        credentials: result.data!.credentials,
        createdAt: new Date().toISOString(),
      },
    };
  }
}
