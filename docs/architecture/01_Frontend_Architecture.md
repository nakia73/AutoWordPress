# 01. フロントエンド・アプリケーションアーキテクチャ

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [コンセプト決定](../CONCEPT_DECISIONS.md)
> **実装フェーズ:** [Phase 1: Auth](../phases/Phase1_Infrastructure.md), [Phase 3: User Interface](../phases/Phase3_UserInterface.md), [Phase 9: SSO](../phases/Phase9_SSO.md)

## 技術スタック (Frontend)

**Core Framework:**

- **Next.js 14+ (App Router):** 最新のReact機能（RSC）とSEO最適化のため必須。
- **Language:** TypeScript (Strict mode)

**Styling & UI:**

- **Tailwind CSS:** ユーティリティファーストでの迅速なスタイリング。
- **Shadcn/UI:** Radix UIベースの再利用可能なコンポーネント集。カスタマイズ性が高く、モダンなデザイン（ガラスモーフィズム等）を実装しやすい。
- **Framer Motion:** マイクロインタラクションとアニメーションの実装。

**State Management:**

- **Zustand:** 軽量で扱いやすいグローバル状態管理（ユーザー設定、一時的なフォーム状態など）。
- **TanStack Query (React Query):** サーバー状態の管理、キャッシュ、楽観的更新。

## ディレクトリ構造 (src/)

```
src/
├── app/                 # App Router pages
│   ├── (auth)/          # Auth related routes (signin, signup)
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── products/    # Product management
│   │   ├── analytics/   # Analytics view
│   │   └── settings/    # User settings
│   └── api/             # API Routes (BFF pattern if needed)
├── components/
│   ├── ui/              # Shadcn primitive components
│   ├── features/        # Feature specific components
│   └── shared/          # Shared components (Layouts, etc)
├── lib/                 # Utilities, API clients
├── hooks/               # Custom hooks
└── types/               # TypeScript definitions
```

## UI/UX デザイン方針

**コンセプト: "放置OKの安心感"**

- ユーザーが「自動で資産が積み上がっている」と感じられる視覚的なフィードバック。
- **ダッシュボード:**
  - 最重要指標：記事数（公開/下書き）
  - 今週の生成予定
  - PV数（GSC連携後）
- **セットアップウィザード:** 認知負荷を最小化した簡易入力フロー。
- **レスポンシブ対応:**
  - **MVP:** PC版のみ（ターゲットの開発者はPC利用が中心）
  - **Phase 7以降:** モバイル最適化

## 認証方式

**Technology:** Supabase Auth（確定）

- **Google OAuth:** MVP必須（認知負荷軽減）
- **Email/Password:** オプション
- **セッション管理:** Supabase組み込み機能

## 記事編集機能（MVP vs Future）

- **MVP:**
  - アプリ内では「記事のリジェネレート（再生成）」指示や「公開/非公開」のスイッチングのみ。
  - 本文の細かい編集は **WordPressの管理画面** に遷移して行う（SSOまたはリンキング）。
- **Future:**
  - Tiptap等のヘッドレスエディタを導入し、Next.jsアプリ内でもリッチテキスト編集を可能にする。

## フォーム管理

- **React Hook Form + Zod:** 型安全なバリデーションとパフォーマンス最適化。
