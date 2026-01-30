# Stream 02: WordPress Setup

> **上位ドキュメント:** [開発哲学](../docs/DEVELOPMENT_PHILOSOPHY.md) | [Stream概要](../docs/STREAM_OVERVIEW.md)
>
> **本モジュールは統合を前提としたスタンドアローン開発です。**

## 概要

WordPress Multisite セットアップのスタンドアローンモジュールです。

- **目的**: 単体テスト・開発者による目視確認
- **統合先**: `/app/src/lib/wordpress/` および `/app/src/lib/vps/`
- **統合対象**: `src/lib/` のコアロジックのみ（`src/app/` のUIは含めない）

## ディレクトリ構造

```
stream-02/
├── src/
│   ├── app/                        # Stub UI（単体テスト用・統合しない）
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── connection/             # 接続テスト
│   │   ├── site/                   # サイト作成テスト
│   │   └── article/                # 記事投稿テスト
│   │
│   └── lib/                        # ★コアロジック（統合対象）
│       ├── wordpress/              # WordPressモジュール
│       │   ├── wordpress-manager.ts    # 公開API
│       │   ├── site-manager.ts         # サイト作成ロジック
│       │   ├── article-publisher.ts    # 記事投稿ロジック
│       │   ├── client.ts               # REST APIクライアント
│       │   ├── types.ts                # 型定義
│       │   └── index.ts                # エクスポート
│       │
│       ├── vps/                    # VPS接続モジュール
│       │   ├── ssh-client.ts           # SSH接続
│       │   ├── wp-cli.ts               # WP-CLI実行
│       │   └── index.ts                # エクスポート
│       │
│       └── crypto.ts               # 暗号化ユーティリティ
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── .env.example
└── README.md
```

## セットアップ

```bash
cd stream-02
npm install
cp .env.example .env.local
# .env.local に接続情報を設定
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

**注意**: `src/app/` は統合対象外です。

## 関連ドキュメント

- [Stream02_MVP.md](../docs/phases/Stream02_MVP.md) - MVP仕様書
- [Stream02_MVP_Tasks.md](../docs/phases/Stream02_MVP_Tasks.md) - タスク管理表
- [Stream02_WordPress.md](../docs/phases/Stream02_WordPress.md) - Full版仕様（将来拡張用）
