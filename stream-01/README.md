# Stream A: Article Generation Engine

> **上位ドキュメント:** [開発哲学](../docs/DEVELOPMENT_PHILOSOPHY.md)
>
> **本モジュールは統合を前提としたスタンドアロン開発です。**

## 概要

AI記事生成エンジンのスタンドアロンモジュールです。

- **目的**: 単体テスト・開発者による目視確認
- **統合先**: `/app/src/lib/ai/`
- **統合対象**: `src/lib/ai/` のコアロジックのみ（`src/app/` のUIは含めない）

## ディレクトリ構造

```
stream-a/
├── src/
│   ├── app/           # スタブUI（単体テスト用・統合しない）
│   ├── lib/ai/        # コアロジック（★統合対象）
│   ├── components/    # UI用コンポーネント（統合しない）
│   └── types/         # 型定義
├── package.json       # 独立した依存関係
└── README.md
```

## セットアップ

```bash
cd stream-a
npm install
cp .env.example .env
# .env に API キーを設定
```

## 起動

```bash
npm run dev
# http://localhost:3001 でアクセス
```

## テスト

```bash
npm test
npm run test:coverage
```

## 統合方法

単体テスト完了後、コアロジックのみを統合アプリにコピー:

```bash
# コアロジックを統合
cp -r src/lib/ai/* ../app/src/lib/ai/

# 型定義を統合（必要に応じて）
cp -r src/types/* ../app/src/types/
```

**注意**: `src/app/` と `src/components/` は統合対象外です。
