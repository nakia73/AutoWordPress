# Stream 02 MVP - タスク管理表

> **関連ドキュメント:** [Stream02_MVP.md](./Stream02_MVP.md) - MVP仕様書
> **最終更新:** 2026-01-30
> **状態:** 🔄 構造修正中（スタンドアローン化）

---

## 1. モジュール構成

### 1.1 コアロジック（stream-02/src/lib/）

| モジュール | ファイル | 責務 | 状態 |
|-----------|----------|------|------|
| **WordPressManager** | `stream-02/src/lib/wordpress/wordpress-manager.ts` | 公開API | 🔄 移動予定 |
| **SiteManager** | `stream-02/src/lib/wordpress/site-manager.ts` | サイト作成ロジック | 🔄 移動予定 |
| **ArticlePublisher** | `stream-02/src/lib/wordpress/article-publisher.ts` | 記事投稿ロジック | 🔄 移動予定 |
| **WordPressClient** | `stream-02/src/lib/wordpress/client.ts` | REST APIクライアント | 🔄 移動予定 |
| **SSHClient** | `stream-02/src/lib/vps/ssh-client.ts` | SSH接続 | 🔄 移動予定 |
| **WPCLIClient** | `stream-02/src/lib/vps/wp-cli.ts` | WP-CLI実行 | 🔄 移動予定 |

### 1.2 依存関係図

```
WordPressManager
    ↓ depends on
├── SiteManager ────────▶ WPCLIClient ────▶ SSHClient
└── ArticlePublisher ───▶ WordPressClient
```

### 1.3 統合先（参考）

統合時は `stream-02/src/lib/` を `app/src/lib/` にコピーする：

| 移動元 | 統合先 |
|--------|--------|
| `stream-02/src/lib/wordpress/` | `app/src/lib/wordpress/` |
| `stream-02/src/lib/vps/` | `app/src/lib/vps/` |

---

## 2. タスク一覧

### Phase 1: Services（ビジネスロジック）✅ 完了

| ID | タスク | 依存 | 状態 |
|----|--------|------|------|
| S-1 | `SiteManager` クラス作成 | - | ✅ |
| S-1.1 | コンストラクタ（WPCLIClient受け取り） | - | ✅ |
| S-1.2 | `create()` メソッド実装 | S-1.1 | ✅ |
| S-1.3 | エラーハンドリング実装 | S-1.2 | ✅ |
| S-2 | `ArticlePublisher` クラス作成 | - | ✅ |
| S-2.1 | コンストラクタ（WordPressClient受け取り） | - | ✅ |
| S-2.2 | `publish()` メソッド実装 | S-2.1 | ✅ |
| S-2.3 | `uploadImage()` メソッド実装 | S-2.1 | ✅ |
| S-2.4 | エラーハンドリング実装 | S-2.2, S-2.3 | ✅ |
| S-3 | Service単体テスト（モック使用） | S-1, S-2 | ✅ |

### Phase 2: Public API ✅ 完了

| ID | タスク | 依存 | 状態 |
|----|--------|------|------|
| P-1 | `WordPressManager` クラス作成 | S-1, S-2 | ✅ |
| P-1.1 | コンストラクタ（内部でService初期化） | S-1, S-2 | ✅ |
| P-1.2 | `createSite()` メソッド実装 | P-1.1 | ✅ |
| P-1.3 | `postArticle()` メソッド実装 | P-1.1 | ✅ |
| P-2 | 統合テスト | P-1 | ✅ |

### Phase 3: Stub UI（独立アプリ）✅ 完了

**設計方針:** 最小限のデザイン（Tailwind CSSで素朴なスタイル、機能優先）

| ID | タスク | 依存 | 状態 |
|----|--------|------|------|
| U-1 | Stub UIプロジェクト初期化 | - | ✅ |
| U-1.1 | Next.js App作成 (`stub-ui/`) | - | ✅ |
| U-1.2 | Tailwind CSS設定 | U-1.1 | ✅ |
| U-1.3 | appモジュールへのパス設定 | U-1.1 | ✅ |
| U-2 | Dashboard画面 | U-1 | ✅ |
| U-2.1 | 環境変数表示 | U-1 | ✅ |
| U-2.2 | ナビゲーション | U-1 | ✅ |
| U-3 | Connection Test画面 | U-1 | ✅ |
| U-3.1 | SSH接続テスト | U-1 | ✅ |
| U-3.2 | WP-CLIテスト | U-1 | ✅ |
| U-3.3 | REST APIテスト | U-1 | ✅ |
| U-4 | Site Create画面 | U-1, P-1 | ✅ |
| U-4.1 | 入力フォーム | U-1 | ✅ |
| U-4.2 | createSite()呼び出し | P-1 | ✅ |
| U-4.3 | 結果表示 | U-4.2 | ✅ |
| U-5 | Article Post画面 | U-1, P-1 | ✅ |
| U-5.1 | 入力フォーム | U-1 | ✅ |
| U-5.2 | postArticle()呼び出し | P-1 | ✅ |
| U-5.3 | 結果表示 | U-5.2 | ✅ |

### Phase 4: Integration準備 ✅ 完了

| ID | タスク | 依存 | 状態 |
|----|--------|------|------|
| I-1 | ドキュメント更新 | All | ✅ |
| I-2 | Integration Phaseへの引き渡し確認 | All | ✅ |

---

## 3. 成果物一覧

### スタンドアローン構成（stream-02/）

```
stream-02/
├── package.json
├── tsconfig.json
├── .env.example
├── README.md
├── vitest.config.ts
│
├── src/
│   ├── lib/                        # ★コアロジック（統合対象）
│   │   ├── wordpress/
│   │   │   ├── client.ts               # REST APIクライアント
│   │   │   ├── wordpress-manager.ts    # 公開API
│   │   │   ├── site-manager.ts         # サイト作成ロジック
│   │   │   ├── article-publisher.ts    # 記事投稿ロジック
│   │   │   └── __tests__/
│   │   │       ├── wordpress-manager.test.ts  # 4 tests
│   │   │       ├── site-manager.test.ts       # 5 tests
│   │   │       └── article-publisher.test.ts  # 7 tests
│   │   │
│   │   └── vps/                        # VPS接続モジュール
│   │       ├── ssh-client.ts
│   │       ├── wp-cli.ts
│   │       └── index.ts
│   │
│   └── app/                        # Stub UI（統合しない）
│       ├── page.tsx                # Dashboard
│       ├── layout.tsx
│       ├── globals.css
│       ├── connection/
│       │   ├── page.tsx            # Connection Test画面
│       │   └── actions.ts          # Server Actions
│       ├── site/
│       │   ├── page.tsx            # Site Create画面
│       │   └── actions.ts          # Server Actions
│       └── article/
│           ├── page.tsx            # Article Post画面
│           └── actions.ts          # Server Actions
│
├── next.config.ts
└── eslint.config.mjs
```

---

## 4. テスト結果

```
 ✓ src/lib/wordpress/__tests__/site-manager.test.ts (5 tests)
 ✓ src/lib/wordpress/__tests__/wordpress-manager.test.ts (4 tests)
 ✓ src/lib/wordpress/__tests__/article-publisher.test.ts (7 tests)

 Test Files  3 passed (3)
 Tests       16 passed (16)
```

---

## 5. 次のステップ

### 5.1 スタンドアローン化（必須・最優先）

1. **stream-02/src/lib/ ディレクトリを作成**
2. **コアロジックを移動** - `app/src/lib/wordpress/` → `stream-02/src/lib/wordpress/`
3. **VPSモジュールを移動** - `app/src/lib/vps/` → `stream-02/src/lib/vps/`
4. **Stub UIのインポートパスを修正** - `@app/` → `@/lib/`

### 5.2 動作確認

1. **VPS環境のセットアップ確認** - WordPress Multisiteが動作していることを確認
2. **環境変数の設定** - `.env.local` にVPS接続情報を設定
3. **Stub UIでの動作確認** - 実際のWordPress環境で各機能をテスト

### 5.3 統合（スタンドアローン開発完了後）

1. **Integration Phaseへの引き渡し** - Stream 01との統合

---

## 6. 使用方法

### WordPressManager

```typescript
import { WordPressManager } from '@/lib/wordpress/wordpress-manager';

const manager = new WordPressManager();

// サイト作成
const siteResult = await manager.createSite({
  slug: 'my-blog',
  title: 'My Blog',
  email: 'admin@example.com',
});

// 記事投稿
const articleResult = await manager.postArticle({
  siteUrl: siteResult.data.url,
  credentials: siteResult.data.credentials,
  article: {
    title: 'Hello World',
    content: '<p>First post!</p>',
    status: 'publish',
  },
});
```

### Stub UI（開発サーバー起動）

```bash
cd stream-02
npm run dev -- --webpack
# http://localhost:3001 でアクセス（port 3001推奨）
```

**注意:** Next.js 16ではTurbopackがデフォルトですが、外部モジュール（ssh2）との互換性のため`--webpack`フラグが必要です。

### 開発時のポート構成

```
localhost:3000  → /app/          # 本番統合アプリ
localhost:3001  → /stream-02/    # Stream 02 スタンドアロン
```

---

*最終更新: 2026-01-30*
