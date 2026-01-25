# 01. フロントエンド・アプリケーションアーキテクチャ

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

**コンセプト: "Modern & Trustworthy"**

- ユーザーが「自分の手でハイクオリティなブログを管理している」と感じられるプロフェッショナルなUI。
- **ダッシュボード:** 複雑なデータを可視化するグラフ（Recharts等）の使用。
- **セットアップウィザード:** 3分で終わる体験を「プログレスバー」や「ステップ表示」で視覚的に演出。
- **モバイルファースト:** 管理画面もスマートフォンで閲覧・簡易操作（ステータス確認など）ができるようにレスポンシブ対応を徹底。

## 記事編集機能（MVP vs Future）

- **MVP:**
  - アプリ内では「記事のリジェネレート（再生成）」指示や「公開/非公開」のスイッチングのみ。
  - 本文の細かい編集は **WordPressの管理画面** に遷移して行う（SSOまたはリンキング）。
- **Future:**
  - Tiptap等のヘッドレスエディタを導入し、Next.jsアプリ内でもリッチテキスト編集を可能にする。

## フォーム管理

- **React Hook Form + Zod:** 型安全なバリデーションとパフォーマンス最適化。
