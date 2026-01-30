# Stream W: WordPress Setup - Full Specification

> **上位ドキュメント:** [開発哲学](../DEVELOPMENT_PHILOSOPHY.md) - 本モジュールはこの思想に従う
>
> **サービス名:** Argo Note
> **スコープ:** Full版（将来拡張用）
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [インフラ仕様](../architecture/03_Infrastructure_Ops.md) | [VPSプロバイダー選定](../architecture/11_VPS_Provider_Selection.md) | [Multisiteガイド](../architecture/07_WordPress_Multisite_Guide.md)
>
> **依存関係:** なし（スタンドアローン）
> **統合先:** `/app/src/lib/wordpress/`
> **コードベース:** `/stream-w/`
> **最終更新:** 2026-01-30

---

## ⚠️ 注意: このドキュメントはFull版仕様です

**MVP実装には [StreamW_MVP.md](./StreamW_MVP.md) を参照してください。**

このドキュメントはMVP後の拡張機能（VPS自動プロビジョニング、Hetzner API連携等）を含むFull版仕様です。

---

**テーマ:** Infrastructure Automation
**目的:** VPS・WordPress環境の自動構築をスタンドアローンで構築・検証

---

## 設計方針

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stream W: スタンドアローン構成                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  入力                     処理                      出力         │
│  ──────                 ──────                   ──────         │
│  - ユーザー情報     →   VPS/WP自動構築       →   - サブドメインURL │
│  - サイト名                                      - WP REST API    │
│  - テーマ設定                                    - 管理者認証情報  │
│                                                                 │
│  ──────────────────────────────────────────────────────────────  │
│                                                                 │
│  検証方法                                                        │
│  - CLIツールで手動実行                                           │
│  - curlでREST API動作確認                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**重要:** このストリームはNext.jsアプリなしで動作確認できる状態を目指す

---

## モジュール構成

```
stream-w/
├── packages/
│   ├── hetzner-client/        # Hetzner Cloud API クライアント
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── api.ts         # API呼び出し基盤
│   │   │   ├── servers.ts     # サーバー管理
│   │   │   ├── ssh-keys.ts    # SSH鍵管理
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── vps-provisioner/       # VPS初期セットアップ
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── cloud-init.ts  # cloud-init設定生成
│   │   │   ├── provision.ts   # プロビジョニング実行
│   │   │   └── types.ts
│   │   ├── templates/
│   │   │   └── cloud-init.yaml
│   │   └── package.json
│   │
│   ├── wp-multisite/          # WordPress Multisite管理
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── installer.ts   # WP自動インストール
│   │   │   ├── site-manager.ts # サイト作成・管理
│   │   │   ├── user-manager.ts # ユーザー・認証管理
│   │   │   └── types.ts
│   │   ├── templates/
│   │   │   ├── nginx/
│   │   │   │   └── multisite.conf
│   │   │   ├── php-fpm/
│   │   │   │   └── www.conf
│   │   │   └── wp-config/
│   │   │       └── wp-config.php.template
│   │   └── package.json
│   │
│   ├── ssh-client/            # SSH接続クライアント（既存拡張）
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── sftp.ts        # ファイル転送
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   └── wp-cli/                # WP-CLIラッパー（既存拡張）
│       ├── src/
│       │   ├── index.ts
│       │   ├── client.ts
│       │   ├── commands/
│       │   │   ├── site.ts
│       │   │   ├── user.ts
│       │   │   ├── plugin.ts
│       │   │   └── theme.ts
│       │   └── types.ts
│       └── package.json
│
├── scripts/
│   ├── create-vps.ts          # VPS作成スクリプト
│   ├── setup-multisite.ts     # Multisite初期セットアップ
│   ├── create-site.ts         # 新規サイト作成
│   └── test-api.ts            # REST API動作確認
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## フェーズ一覧

### W-1: VPSプロビジョニング

**ゴール:** Hetzner Cloud APIでサーバー自動作成

| タスク | 成果物 | 状態 |
|--------|--------|------|
| Hetzner Cloud API統合 | `hetzner-client` パッケージ | ⬜ 未完了 |
| VPS自動作成スクリプト | `scripts/create-vps.ts` | ⬜ 未完了 |
| cloud-init設定生成 | `vps-provisioner` パッケージ | ⬜ 未完了 |
| SSH接続クライアント | `ssh-client.ts` | ✅ 完了 |
| SFTP転送機能 | `sftp.ts` | ⬜ 未完了 |

**MVP構成:**
- 単一VPS（CX21: €4.49/mo）に全ユーザーを収容
- WordPress Multisite でサブドメイン分離

**Hetzner Cloud API仕様:**
- エンドポイント: `https://api.hetzner.cloud/v1`
- 認証: Bearer Token（Read & Write権限）
- サーバー作成: `POST /servers`
- 公式ドキュメント: https://docs.hetzner.cloud/

**サーバー作成リクエスト例:**
```typescript
const response = await fetch('https://api.hetzner.cloud/v1/servers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${HETZNER_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'argonote-wp-01',
    server_type: 'cx21',
    location: 'fsn1',  // Falkenstein
    image: 'ubuntu-24.04',
    ssh_keys: ['my-ssh-key'],
    user_data: cloudInitYaml  // cloud-init設定
  })
});
```

---

### W-2: WordPress Multisite

**ゴール:** WordPress Multisiteの自動インストール

| タスク | 成果物 | 状態 |
|--------|--------|------|
| Nginx設定テンプレート | `templates/nginx/multisite.conf` | ⬜ 未完了 |
| PHP-FPM設定 | `templates/php-fpm/www.conf` | ⬜ 未完了 |
| MariaDB初期設定 | セットアップスクリプト | ⬜ 未完了 |
| WordPress自動インストール | WP-CLI + installer.ts | ⬜ 未完了 |
| Multisite有効化 | WP-CLI | ⬜ 未完了 |
| wp-config.php生成 | テンプレート | ⬜ 未完了 |

**構成:**
```
*.argonote.app
   ├── user1.argonote.app (Site 1)
   ├── user2.argonote.app (Site 2)
   └── user3.argonote.app (Site 3)
```

**技術スタック（2026年最新）:**
- OS: **Ubuntu 24.04 LTS** (Noble Numbat)
- Web Server: **Nginx 1.24+**
- PHP: **PHP 8.3** (PHP-FPM)
- Database: **MariaDB 10.11+**
- WordPress: **6.7+** with Multisite
- SSL: Cloudflare (ワイルドカード証明書)

**Nginx Multisite設定ポイント:**
```nginx
# サブドメイン型Multisite用設定
map $http_host $blogid {
    default 0;
    # サブドメインからblog_idへのマッピング（動的）
}

server {
    listen 443 ssl http2;
    server_name *.argonote.app argonote.app;

    # Cloudflare Origin Certificates
    ssl_certificate /etc/ssl/argonote.app.pem;
    ssl_certificate_key /etc/ssl/argonote.app.key;

    root /var/www/argonote;
    index index.php;

    # WordPress Multisite rewrite rules
    if (!-e $request_filename) {
        rewrite /wp-admin$ $scheme://$host$uri/ permanent;
        rewrite ^(/[^/]+)?(/wp-.*) $2 last;
        rewrite ^(/[^/]+)?(/.*\.php) $2 last;
    }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

**wp-config.php Multisite設定:**
```php
/* Multisite */
define('WP_ALLOW_MULTISITE', true);
define('MULTISITE', true);
define('SUBDOMAIN_INSTALL', true);
define('DOMAIN_CURRENT_SITE', 'argonote.app');
define('PATH_CURRENT_SITE', '/');
define('SITE_ID_CURRENT_SITE', 1);
define('BLOG_ID_CURRENT_SITE', 1);

/* Security Hardening */
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
```

---

### W-3: サイト作成API

**ゴール:** 新規ユーザー用サブサイトの自動作成

| タスク | 成果物 | 状態 |
|--------|--------|------|
| WP-CLI実行関数 | `wp-cli.ts` | ✅ 完了 |
| サイト作成関数 | `wp site create` | ✅ 完了 |
| テーマ設定関数 | `wp theme activate` | ✅ 完了 |
| 管理者ユーザー作成 | `wp user create` | ⬜ 未完了 |
| REST API Application Password発行 | `wp user application-password add` | ⬜ 未完了 |
| Cloudflare DNS自動登録 | Cloudflare API | ⬜ 未完了 |

**サイト作成フロー:**
```
1. WP-CLI: wp site create --slug=xxx --title="xxx"
2. WP-CLI: wp user create admin_xxx email --role=administrator --url=xxx.argonote.app
3. WP-CLI: wp user application-password create admin_xxx "argo-note-api"
4. Cloudflare API: DNS Aレコード追加（ワイルドカードで不要な場合はスキップ）
5. WP-CLI: wp theme activate theme-name --url=xxx.argonote.app
6. WP-CLI: wp option update (初期設定)
```

**CLIでの動作確認:**
```bash
# サイト作成
npx tsx scripts/create-site.ts --slug user1 --title "User1のブログ" --email user1@example.com

# 確認
curl https://user1.argonote.app/wp-json/wp/v2/posts
```

**サイト作成関数（TypeScript）:**
```typescript
interface CreateSiteResult {
  success: boolean;
  siteId: number;
  url: string;
  adminUrl: string;
  restApiUrl: string;
  credentials: {
    username: string;
    applicationPassword: string;
  };
  createdAt: string;
}

async function createWordPressSite(options: {
  slug: string;
  title: string;
  email: string;
  theme?: string;
}): Promise<CreateSiteResult>
```

---

### W-4: 記事投稿API

**ゴール:** 外部から記事を投稿する機能

| タスク | 成果物 | 状態 |
|--------|--------|------|
| REST API認証設定 | Application Password | ⬜ 未完了 |
| 記事投稿関数 | `WordPressClient.createPost()` | ✅ 完了 |
| 画像アップロード関数 | `WordPressClient.uploadMedia()` | ✅ 完了 |
| カテゴリ/タグ管理 | `WordPressClient` | ✅ 完了 |
| 投稿確認スクリプト | `scripts/test-api.ts` | ⬜ 未完了 |

**既存実装（app/src/lib/wordpress/client.ts）:**
- `WordPressClient` クラス実装済み
- 認証: Application Password（Base64エンコード）
- 投稿作成/更新/削除
- メディアアップロード
- カテゴリ/タグ管理
- エラーハンドリング（WordPressAPIError）

**REST API使用例:**
```typescript
import { WordPressClient } from '@/lib/wordpress/client';

const client = new WordPressClient({
  baseUrl: 'https://user1.argonote.app',
  username: 'admin_user1',
  applicationPassword: 'xxxx xxxx xxxx xxxx'
});

// 記事投稿
const post = await client.createPost({
  title: article.title,
  content: article.content,
  status: 'publish',
  featured_media: thumbnailId,
  meta: {
    _yoast_wpseo_metadesc: article.metaDescription
  }
});

// 画像アップロード
const media = await client.uploadMedia(
  imageBuffer,
  'thumbnail.webp',
  'image/webp'
);
```

---

### W-5: 動作検証

**ゴール:** E2Eテスト、信頼性確認

| タスク | 成果物 | 状態 |
|--------|--------|------|
| サイト作成E2Eテスト | `tests/e2e/site-creation.test.ts` | ⬜ 未完了 |
| 記事投稿E2Eテスト | `tests/e2e/post-article.test.ts` | ⬜ 未完了 |
| エラーハンドリング検証 | `tests/integration/error-handling.test.ts` | ⬜ 未完了 |
| 同時作成テスト | `tests/e2e/concurrent.test.ts` | ⬜ 未完了 |
| ヘルスチェック | `scripts/health-check.ts` | ⬜ 未完了 |

**成功基準:**
| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| サイト作成時間 | < 60秒 | タイムスタンプ計測 |
| HTTPS有効化 | 即時 | curl -I |
| REST API応答 | < 500ms | 応答時間計測 |
| 連続成功率 | 10/10 | 連続テスト |

**テストシナリオ:**
```typescript
describe('WordPress Site Provisioning', () => {
  it('should create a new site within 60 seconds', async () => {
    const start = Date.now();
    const result = await createWordPressSite({
      slug: 'test-site',
      title: 'Test Site',
      email: 'test@example.com'
    });
    const elapsed = Date.now() - start;

    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(60000);
  });

  it('should access site via HTTPS', async () => {
    const response = await fetch('https://test-site.argonote.app');
    expect(response.status).toBe(200);
  });

  it('should post article via REST API', async () => {
    const client = new WordPressClient(credentials);
    const post = await client.createPost({
      title: 'Test Article',
      content: '<p>Test content</p>',
      status: 'publish'
    });
    expect(post.id).toBeDefined();
  });
});
```

---

## 技術スタック

| コンポーネント | 技術 | 状態 | 備考 |
|---------------|------|------|------|
| VPS | Hetzner Cloud CX21 | ⬜ | €4.49/月、2vCPU/4GB/40GB |
| OS | **Ubuntu 24.04 LTS** | ⬜ | Noble Numbat（2024年4月リリース、2029年までLTSサポート）|
| Web Server | Nginx 1.24+ | ⬜ | HTTP/2対応 |
| PHP | **PHP 8.3** + PHP-FPM | ⬜ | Ubuntu 24.04標準リポジトリ |
| Database | MariaDB 10.11+ | ⬜ | |
| WordPress | 6.7+ Multisite (サブドメイン) | ⬜ | |
| SSL | Cloudflare Origin Certificates | ⬜ | ワイルドカード *.argonote.app |
| DNS | Cloudflare | ⬜ | Proxy有効 |
| Automation | SSH + WP-CLI 2.10+ | ✅ | 既存実装あり |
| CDN/WAF | Cloudflare | ⬜ | DDoS対策、キャッシュ |

**Ubuntu 22.04 → 24.04への変更理由:**
- PHP 8.3が標準リポジトリで利用可能
- 2029年までのLTSサポート
- 最新セキュリティパッチ
- パフォーマンス向上

---

## 環境変数

```bash
# Hetzner Cloud API
HETZNER_API_TOKEN="your-hetzner-api-token"  # Read & Write権限

# VPS接続
VPS_HOST="xxx.xxx.xxx.xxx"
VPS_SSH_PRIVATE_KEY="base64-encoded-key"
VPS_SSH_USER="root"
VPS_SSH_PORT="22"

# WordPress
WP_DOMAIN="argonote.app"
WP_PATH="/var/www/argonote"
WP_DB_NAME="wordpress"
WP_DB_USER="wp_user"
WP_DB_PASSWORD="secure-password"

# 暗号化 (AES-256-GCM)
ENCRYPTION_KEY="64-char-hex-string"

# Cloudflare
CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_ZONE_ID="..."
```

**シークレット管理:**
- 本番環境: Vercel Environment Variables（暗号化）
- 開発環境: `.env.local`（gitignore済み）
- Application Password: AES-256-GCMで暗号化してDB保存

---

## 成功基準

| カテゴリ | 基準 | 測定方法 |
|---------|------|----------|
| スタンドアローン動作 | Next.jsアプリなしでサイト作成が完了 | CLIスクリプト実行 |
| 速度 | サイト作成が60秒以内に完了 | タイムスタンプ計測 |
| 信頼性 | 10回連続でサイト作成が成功 | E2Eテスト |
| セキュリティ | HTTPS有効、WAF保護下で動作 | SSL Labs / Cloudflare |
| REST API | Application Password認証で記事投稿成功 | curl / テストスクリプト |
| 自動化 | VPS作成→WPインストール→サイト作成が全自動 | ワンコマンド実行 |

---

## 出力仕様

### サイト作成結果
```json
{
  "site_id": 2,
  "url": "https://user1.argonote.app",
  "admin_url": "https://user1.argonote.app/wp-admin",
  "rest_api": "https://user1.argonote.app/wp-json/wp/v2",
  "credentials": {
    "username": "admin_user1",
    "application_password": "xxxx xxxx xxxx xxxx"
  },
  "created_at": "2026-01-29T12:00:00Z"
}
```

---

---

## cloud-init設定テンプレート

VPS作成時に自動実行されるcloud-init設定:

```yaml
#cloud-config
package_update: true
package_upgrade: true

packages:
  - nginx
  - mariadb-server
  - mariadb-client
  - php8.3-fpm
  - php8.3-mysql
  - php8.3-curl
  - php8.3-gd
  - php8.3-intl
  - php8.3-mbstring
  - php8.3-xml
  - php8.3-zip
  - php8.3-imagick
  - php8.3-redis
  - unzip
  - curl

runcmd:
  # WP-CLI インストール
  - curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  - chmod +x wp-cli.phar
  - mv wp-cli.phar /usr/local/bin/wp

  # MariaDB セキュリティ設定
  - mysql -e "DELETE FROM mysql.user WHERE User='';"
  - mysql -e "DROP DATABASE IF EXISTS test;"
  - mysql -e "FLUSH PRIVILEGES;"

  # WordPress ディレクトリ作成
  - mkdir -p /var/www/argonote
  - chown -R www-data:www-data /var/www/argonote

  # PHP-FPM 設定調整
  - sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 64M/g' /etc/php/8.3/fpm/php.ini
  - sed -i 's/post_max_size = 8M/post_max_size = 64M/g' /etc/php/8.3/fpm/php.ini
  - sed -i 's/memory_limit = 128M/memory_limit = 256M/g' /etc/php/8.3/fpm/php.ini

  # サービス再起動
  - systemctl restart php8.3-fpm
  - systemctl restart nginx
  - systemctl enable nginx mariadb php8.3-fpm
```

---

## 実装優先順位

```
Phase 1: 基盤構築（必須）
├── W-1: VPSプロビジョニング
│   ├── hetzner-client パッケージ
│   ├── vps-provisioner パッケージ
│   └── cloud-init テンプレート
│
├── W-2: WordPress Multisite
│   ├── Nginx設定
│   ├── PHP-FPM設定
│   ├── WPインストーラー
│   └── Multisite有効化
│
└── W-3: サイト作成API
    ├── サイト作成関数
    ├── ユーザー・認証情報生成
    └── 動作確認スクリプト

Phase 2: 統合（W-4, W-5）
├── W-4: 記事投稿API（既存実装活用）
└── W-5: E2Eテスト・検証
```

---

## 参考リソース

- [Hetzner Cloud API Documentation](https://docs.hetzner.cloud/)
- [WordPress Multisite Network Administration](https://developer.wordpress.org/advanced-administration/multisite/)
- [SpinupWP WordPress-Nginx Configs](https://github.com/spinupwp/wordpress-nginx)
- [Ubuntu 24.04 WordPress Setup](https://www.linuxbabe.com/ubuntu/install-wordpress-ubuntu-24-04-nginx-mariadb-php8-3-lemp)

---

## 旧ドキュメントとの対応

| 旧Phase | 対応 |
|---------|------|
| [Phase 1: Infrastructure](./Phase1_Infrastructure.md) | W-1, W-2, W-3 |

---

*最終更新: 2026-01-29*
