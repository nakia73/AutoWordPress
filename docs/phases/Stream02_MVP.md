# Stream W: WordPress Setup - MVP Specification

> **サービス名:** Argo Note
> **スコープ:** MVP（Minimum Viable Product）
> **最終更新:** 2026-01-30
>
> **関連ドキュメント:**
> - [Integration_MVP.md](./Integration_MVP.md) - 統合仕様
> - [StreamW_WordPress.md](./StreamW_WordPress.md) - Full版仕様（将来拡張用）
> - [StreamW_MVP_Tasks.md](./StreamW_MVP_Tasks.md) - タスク管理表

---

## 1. MVPスコープ

### 1.1 実装するもの

| 機能 | 説明 |
|------|------|
| サイト作成 | WP-CLI経由で新規サブサイト作成 |
| 記事投稿 | REST API経由で記事投稿 |
| Stub UI | 単体テスト・動作確認用の簡易画面（独立アプリ） |

### 1.2 実装しないもの（MVP後）

| 機能 | 理由 |
|------|------|
| VPS自動プロビジョニング | 手動で1台セットアップ済み |
| Hetzner Cloud API連携 | MVP後 |
| 複数VPS対応 | MVP後 |
| サイト削除 | MVP後 |
| 記事更新・削除 | MVP後 |

### 1.3 前提条件

以下は**MVP開始前に手動セットアップ完了**していること：

- VPS（Hetzner CX21、Ubuntu 24.04）
- WordPress Multisite
- Nginx + SSL（Cloudflare）
- WP-CLI

---

## 2. コンポーネント設計

### 2.1 コンポーネント一覧

```
┌─────────────────────────────────────────────────────────────────┐
│                     WordPress Manager MVP                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Public Interface]                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  WordPressManager                                       │   │
│  │  - createSite(input): CreateSiteResult                  │   │
│  │  - postArticle(input): PostArticleResult                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  [Internal Services]                                            │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  SiteManager     │  │  ArticlePublisher│                    │
│  │  - create()      │  │  - publish()     │                    │
│  └──────────────────┘  └──────────────────┘                    │
│           │                     │                               │
│           ▼                     ▼                               │
│  [Existing Modules - 既存モジュールを直接使用]                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  WPCLIClient     │  │  WordPressClient │                    │
│  │  (SSH経由)       │  │  (HTTP経由)      │                    │
│  │  vps/wp-cli.ts   │  │  wordpress/      │                    │
│  │                  │  │  client.ts       │                    │
│  └──────────────────┘  └──────────────────┘                    │
│           │                     │                               │
│           ▼                     ▼                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              WordPress Multisite (VPS)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 責務定義

| コンポーネント | 責務 | 依存先 |
|---------------|------|--------|
| **WordPressManager** | 外部公開API。Integration Phaseからの唯一のエントリーポイント | SiteManager, ArticlePublisher |
| **SiteManager** | サイト作成のビジネスロジック | WPCLIClient（既存） |
| **ArticlePublisher** | 記事投稿のビジネスロジック | WordPressClient（既存） |
| **WPCLIClient** | SSH経由でWP-CLIコマンドを実行（既存） | SSHClient（既存） |
| **WordPressClient** | WordPress REST APIを呼び出し（既存） | - |

### 2.3 依存関係ルール

```
依存の方向: 上 → 下（上位は下位に依存、下位は上位を知らない）

WordPressManager
    ↓ depends on
SiteManager / ArticlePublisher
    ↓ depends on
既存モジュール（WPCLIClient, WordPressClient）
    ↓ depends on
インフラ（SSH, HTTP）

禁止:
- 下位から上位への依存
- 同一レイヤー間の直接依存（Serviceレイヤー同士など）
```

---

## 3. ディレクトリ構成

[開発哲学](../DEVELOPMENT_PHILOSOPHY.md) に従い、`stream-02/` 内でスタンドアローン開発を行う。

```
stream-02/                          # スタンドアローン開発ディレクトリ
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── src/
│   ├── app/                        # Stub UI（単体テスト用・統合しない）
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── connection/             # 接続テスト
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── site/                   # サイト作成テスト
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── article/                # 記事投稿テスト
│   │       ├── page.tsx
│   │       └── actions.ts
│   │
│   └── lib/                        # ★コアロジック（統合対象）
│       ├── wordpress/              # WordPressモジュール
│       │   ├── wordpress-manager.ts    # 公開API
│       │   ├── site-manager.ts         # サイト作成ロジック
│       │   ├── article-publisher.ts    # 記事投稿ロジック
│       │   ├── client.ts               # REST APIクライアント
│       │   └── __tests__/
│       │       ├── wordpress-manager.test.ts
│       │       ├── site-manager.test.ts
│       │       └── article-publisher.test.ts
│       │
│       └── vps/                    # VPS接続モジュール
│           ├── ssh-client.ts           # SSH接続
│           ├── wp-cli.ts               # WP-CLI実行
│           └── index.ts
│
└── vitest.config.ts                # テスト設定

# 統合後（参考）
app/src/lib/wordpress/              # ← stream-02/src/lib/wordpress/ を統合
app/src/lib/vps/                    # ← stream-02/src/lib/vps/ を統合
```

**配置ルール:**
- **コアロジック** → `stream-02/src/lib/` に配置（統合対象）
- **Stub UI** → `stream-02/src/app/` に配置（統合しない）
- **統合時** → `src/lib/` 配下のみを `app/src/lib/` にコピー

---

## 4. インターフェース定義

### 4.1 Public Interface（WordPressManager）

```typescript
// stream-02/src/lib/wordpress/wordpress-manager.ts

export interface CreateSiteInput {
  slug: string;      // サブドメイン（例: "user-123"）
  title: string;     // サイトタイトル
  email: string;     // 管理者メールアドレス
}

export interface CreateSiteResult {
  success: boolean;
  data?: {
    siteId: number;
    url: string;           // https://user-123.argonote.app
    credentials: {
      username: string;
      password: string;    // Application Password（AES-256-GCM暗号化推奨）
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
    content: string;       // HTML
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
  async createSite(input: CreateSiteInput): Promise<CreateSiteResult>;
  async postArticle(input: PostArticleInput): Promise<PostArticleResult>;
}
```

### 4.2 Internal Service Interface

```typescript
// stream-02/src/lib/wordpress/site-manager.ts

import { WPCLIClient } from '@/lib/vps/wp-cli';

export class SiteManager {
  constructor(private wpcli: WPCLIClient) {}

  async create(slug: string, title: string, email: string): Promise<{
    siteId: number;
    url: string;
    credentials: { username: string; password: string };
  }>;
}
```

```typescript
// stream-02/src/lib/wordpress/article-publisher.ts

import { WordPressClient } from './client';

export class ArticlePublisher {
  constructor(private client: WordPressClient) {}

  async publish(article: {
    title: string;
    content: string;
    status: 'publish' | 'draft';
    featuredMediaId?: number;
  }): Promise<{ postId: number; postUrl: string }>;

  async uploadImage(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ mediaId: number; url: string }>;
}
```

---

## 5. セキュリティ

### 5.1 認証情報の保護

Application Password（REST API認証用）は以下の対策を行う：

| 対策 | 実装 |
|------|------|
| 暗号化保存 | 既存 `crypto.ts` の AES-256-GCM を使用 |
| 通信暗号化 | HTTPS必須（Cloudflare SSL） |
| 最小権限 | サイト単位でApplication Passwordを発行 |

### 5.2 既存暗号化モジュールの使用

```typescript
// 保存時
import { encrypt } from '@/lib/crypto';
const encryptedPassword = encrypt(appPassword);

// 使用時
import { safeDecrypt } from '@/lib/crypto';
const password = safeDecrypt(encryptedPassword);
```

---

## 6. Stub UI 仕様

### 6.1 目的

| 目的 | 説明 |
|------|------|
| 単体動作確認 | WordPressManagerの各メソッドを個別にテスト |
| Integration準備 | 本番統合前の動作検証 |
| デバッグ | エラー時の原因特定 |

### 6.2 配置

- **場所:** プロジェクトルートの `stub-ui/`
- **形式:** 独立したNext.jsアプリケーション
- **理由:** スタンドアローンでテストするため、本番環境（`app/`）には含めない

### 6.3 画面構成

| 画面 | URL | 機能 |
|------|-----|------|
| Dashboard | `/` | 各テスト画面へのナビゲーション、環境変数表示 |
| Connection | `/connection` | SSH/WP-CLI/REST API接続確認 |
| Site | `/site` | サイト作成テスト |
| Article | `/article` | 記事投稿テスト |

### 6.4 画面設計

#### Dashboard

```
┌─────────────────────────────────────────────────┐
│  WordPress Manager - Stub UI                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Environment:                                   │
│  ├── VPS_HOST: 192.168.1.100                   │
│  ├── WP_DOMAIN: argonote.app                   │
│  └── Status: ● Connected                        │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ Connection  │  │    Site     │              │
│  │    Test     │  │   Create    │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
│  ┌─────────────┐                               │
│  │   Article   │                               │
│  │    Post     │                               │
│  └─────────────┘                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Connection Test

```
┌─────────────────────────────────────────────────┐
│  Connection Test                      [← Back]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Test All]                                     │
│                                                 │
│  SSH Connection:                                │
│  ├── Status: ● Connected                        │
│  └── Latency: 45ms                              │
│                                                 │
│  WP-CLI:                                        │
│  ├── Status: ● Available                        │
│  └── Version: 2.10.0                            │
│                                                 │
│  REST API:                                      │
│  ├── Status: ● Available                        │
│  └── Endpoint: https://argonote.app/wp-json    │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Site Create

```
┌─────────────────────────────────────────────────┐
│  Site Create Test                     [← Back]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Input:                                         │
│  ├── Slug:  [ test-001          ]              │
│  ├── Title: [ Test Blog         ]              │
│  └── Email: [ test@example.com  ]              │
│                                                 │
│  [Create Site]                                  │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Result:                                        │
│  {                                              │
│    "success": true,                             │
│    "data": {                                    │
│      "siteId": 2,                               │
│      "url": "https://test-001.argonote.app",   │
│      "credentials": {                           │
│        "username": "admin",                     │
│        "password": "xxxx xxxx xxxx"            │
│      }                                          │
│    }                                            │
│  }                                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Article Post

```
┌─────────────────────────────────────────────────┐
│  Article Post Test                    [← Back]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Site:                                          │
│  ├── URL:      [ https://test-001.argonote.app ]│
│  ├── Username: [ admin                         ]│
│  └── Password: [ xxxx xxxx xxxx                ]│
│                                                 │
│  Article:                                       │
│  ├── Title:  [ Test Article               ]    │
│  ├── Status: (●) Publish  ( ) Draft            │
│  └── Content:                                   │
│      ┌────────────────────────────────────┐    │
│      │ <p>This is test content.</p>       │    │
│      │                                    │    │
│      └────────────────────────────────────┘    │
│                                                 │
│  [Post Article]                                 │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Result:                                        │
│  {                                              │
│    "success": true,                             │
│    "data": {                                    │
│      "postId": 123,                             │
│      "postUrl": "https://test-001.argonote..." │
│    }                                            │
│  }                                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 7. Integration Point

### 7.1 Stream Aとの接続

```typescript
// Integration Phase での使用例

import { WordPressManager } from '@/lib/wordpress/wordpress-manager';

// Stream Aの出力を受け取る
const streamAOutput = {
  title: '生成された記事タイトル',
  content: '<p>生成された記事本文...</p>',
  metaDescription: 'メタディスクリプション',
  thumbnail: {
    buffer: Buffer.from('...'),
    filename: 'thumbnail.webp',
    mimeType: 'image/webp',
  },
};

// WordPressManagerに渡す
const manager = new WordPressManager();
const result = await manager.postArticle({
  siteUrl: site.url,
  credentials: site.credentials,
  article: {
    title: streamAOutput.title,
    content: streamAOutput.content,
    status: 'publish',
    featuredImage: streamAOutput.thumbnail,
  },
});
```

### 7.2 データフロー

```
Stream A (記事生成)              WordPressManager
──────────────────              ────────────────────

GeneratedArticle                PostArticleInput.article
├── title            ────────▶  ├── title
├── content          ────────▶  ├── content
├── metaDescription  ────────▶  │   (meta plugin経由で設定)
└── thumbnail                   └── featuredImage
    ├── buffer       ────────▶      ├── buffer
    ├── filename     ────────▶      ├── filename
    └── mimeType     ────────▶      └── mimeType
```

---

## 8. エラーハンドリング

### 8.1 エラーコード

| コード | 意味 | 対処 |
|--------|------|------|
| `SITE_EXISTS` | 同名サイトが既に存在 | 別のslugを使用 |
| `SSH_ERROR` | SSH接続失敗 | VPS/認証情報を確認 |
| `WP_CLI_ERROR` | WP-CLI実行エラー | コマンド/WP状態を確認 |
| `AUTH_ERROR` | REST API認証失敗 | credentials確認 |
| `API_ERROR` | REST APIエラー | WP状態/権限を確認 |
| `UPLOAD_ERROR` | メディアアップロード失敗 | ファイル形式/サイズ確認 |
| `UNKNOWN` | 予期しないエラー | ログを確認 |

### 8.2 Result型の設計思想

```typescript
// 成功/失敗を明示的に分離（Union型ではなくフラグ方式）

interface Result<T, E> {
  success: boolean;
  data?: T;      // success=true の場合のみ
  error?: E;     // success=false の場合のみ
}

// 使用側
const result = await manager.createSite(input);
if (result.success) {
  console.log(result.data.url);  // 型安全
} else {
  console.error(result.error.code, result.error.message);
}
```

---

## 9. 環境変数

```bash
# .env.local

# VPS接続
VPS_HOST="xxx.xxx.xxx.xxx"
VPS_SSH_USER="root"
VPS_SSH_PRIVATE_KEY="base64-encoded-key"

# WordPress
WP_DOMAIN="argonote.app"
WP_PATH="/var/www/argonote"

# 暗号化
ENCRYPTION_KEY="64-char-hex-string"
```

---

## 10. 実装チェックリスト

### Phase 1: Services

- [ ] `SiteManager` - サイト作成ロジック（既存WPCLIClientを使用）
- [ ] `ArticlePublisher` - 記事投稿ロジック（既存WordPressClientを使用）
- [ ] 単体テスト

### Phase 2: Public API

- [ ] `WordPressManager` - 公開API
- [ ] 統合テスト

### Phase 3: Stub UI

- [ ] プロジェクト初期化（`stub-ui/`）
- [ ] Dashboard
- [ ] Connection Test
- [ ] Site Create
- [ ] Article Post

### Phase 4: Integration準備

- [ ] ドキュメント更新
- [ ] Integration Phaseへの引き渡し確認

---

## 11. 成功基準

| 項目 | 基準 |
|------|------|
| サイト作成 | 60秒以内に完了 |
| 記事投稿 | 10秒以内に完了 |
| Stub UI | 全画面で正常動作 |
| Integration | WordPressManagerがIntegration Phaseで呼び出し可能 |

---

*最終更新: 2026-01-29*
