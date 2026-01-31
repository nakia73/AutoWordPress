# Stream 02: WordPress Setup

> **上位ドキュメント:** [開発哲学](../docs/DEVELOPMENT_PHILOSOPHY.md) | [Stream概要](../docs/STREAM_OVERVIEW.md)
>
> **本モジュールは統合を前提としたスタンドアローン開発です。**

## テスト目的

**WordPressがセットアップでき、記事投稿機能が動作するか** を検証する。

詳細は [開発哲学 - 用語定義](../docs/DEVELOPMENT_PHILOSOPHY.md#0-用語定義) を参照。

## 責務範囲

### Stream02に含まれるもの
1. VPSプロビジョニング（Hetzner API）- 計画
2. OS基盤設定（Nginx, PHP-FPM, MariaDB）- 計画
3. WordPressインストール - 計画
4. Multisite有効化 - 計画
5. サブサイト作成
6. 認証情報発行（Application Password）
7. **記事投稿機能の動作確認（Mockデータ使用）**

### Stream02に含まれないもの
- **記事生成** → Stream01の責務
- **Stream01の出力を使った投稿** → Stream04（結合フェーズ）の責務

### Mockデータについて

Stream02では記事の「内容」ではなく「投稿機能」をテストするため、
あらかじめ用意されたMockテキスト・Mock画像を使用します。

```typescript
import { MOCK_ARTICLE, createMockArticleWithImage } from '@/lib/wordpress/mock-data';

// Mockデータで投稿テスト
await articlePublisher.publish(MOCK_ARTICLE);
```

## ディレクトリ構造

```
stream-02/
├── src/
│   ├── app/                        # Stub UI（単体テスト用・統合しない）
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── connection/             # 接続テスト
│   │   ├── site/                   # サイトセットアップテスト
│   │   └── article/                # 記事投稿テスト（Mockデータ使用）
│   │
│   └── lib/                        # ★コアロジック（統合対象）
│       ├── wordpress/              # WordPressモジュール
│       │   ├── wordpress-setup-manager.ts  # 公開API（セットアップ）
│       │   ├── site-manager.ts             # サイト作成ロジック
│       │   ├── article-publisher.ts        # 記事投稿ロジック
│       │   ├── mock-data.ts                # テスト用Mockデータ
│       │   ├── client.ts                   # REST APIクライアント
│       │   ├── types.ts                    # 型定義
│       │   └── index.ts                    # エクスポート
│       │
│       ├── vps/                    # VPS接続モジュール
│       │   ├── ssh-client.ts           # SSH接続
│       │   ├── wp-cli.ts               # WP-CLI実行
│       │   ├── hetzner-client.ts       # Hetzner API（計画）
│       │   ├── provisioner.ts          # プロビジョニング（計画）
│       │   └── index.ts                # エクスポート
│       │
│       └── crypto.ts               # 暗号化ユーティリティ
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example
├── SETUP.md                       # ★セットアップガイド
└── README.md
```

## セットアップ

**詳細な手順は [SETUP.md](./SETUP.md) を参照してください。**

```bash
cd stream-02
npm install
cp .env.example .env.local
# .env.local に接続情報を設定（詳細はSETUP.mdを参照）
```

## 起動

```bash
npm run dev -- --webpack
# http://localhost:3001 でアクセス（ポート3001推奨）
```

**注意:** Next.js 16ではTurbopackがデフォルトですが、ssh2との互換性のため`--webpack`フラグが必要です。

## 開発時のポート構成

```
localhost:3000  → /app/          # 本番統合アプリ
localhost:3001  → /stream-02/    # Stream 02 スタンドアローン
```

## 使用方法

### サイトセットアップ

```typescript
import { WordPressSetupManager } from '@/lib/wordpress';

const manager = new WordPressSetupManager();

// サイトセットアップ（サブサイト作成 + 認証情報発行）
const result = await manager.setupSite({
  slug: 'my-blog',
  title: 'My Blog',
  email: 'admin@example.com',
});

if (result.success) {
  console.log('Site URL:', result.data.url);
  console.log('Credentials:', result.data.credentials);
}
```

### 記事投稿テスト（Mockデータ）

```typescript
import {
  ArticlePublisher,
  WordPressClient,
  MOCK_ARTICLE,
  createMockArticleWithImage,
} from '@/lib/wordpress';

const client = new WordPressClient({
  baseUrl: 'https://test-001.example.com',
  username: 'admin',
  applicationPassword: 'xxxx xxxx xxxx xxxx',
});

const publisher = new ArticlePublisher(client);

// Mockデータで投稿テスト
const result = await publisher.publish(MOCK_ARTICLE);

// 画像付きMockデータでテスト
const resultWithImage = await publisher.publish(createMockArticleWithImage());
```

## 統合方法

単体テスト完了後、コアロジックのみを統合アプリにコピー:

```bash
# WordPressモジュールを統合
cp -r src/lib/wordpress/* ../app/src/lib/wordpress/

# VPSモジュールを統合
cp -r src/lib/vps/* ../app/src/lib/vps/

# 暗号化ユーティリティ（既存がなければ）
cp src/lib/crypto.ts ../app/src/lib/
```

**注意**: `src/app/` は統合対象外です。`mock-data.ts` は本番環境では使用しません。

## 関連ドキュメント

- [SETUP.md](./SETUP.md) - **セットアップガイド（環境変数・VPS設定）**
- [Stream02_Spec.md](../docs/phases/Stream02_Spec.md) - 単体開発仕様
- [Stream02_Tasks.md](../docs/phases/Stream02_Tasks.md) - タスク管理表
- [Stream02_WordPress.md](../docs/phases/Stream02_WordPress.md) - 技術詳細
