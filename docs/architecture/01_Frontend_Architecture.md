# 01. フロントエンド・アプリケーションアーキテクチャ

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [コンセプト決定](../CONCEPT_DECISIONS.md)
> **実装フェーズ:** [Phase 1: Auth](../phases/Phase1_Infrastructure.md), [Phase 3: User Interface](../phases/Phase3_UserInterface.md), [Phase 9: SSO](../phases/Phase9_SSO.md)

## 技術スタック (Frontend)

**Core Framework:**

- **Next.js 16+ (App Router):** 最新のReact 19機能（RSC）とSEO最適化のため必須。
- **Language:** TypeScript (Strict mode)

**Styling & UI:**

- **Tailwind CSS v4:** ユーティリティファーストでの迅速なスタイリング。
- **Shadcn/UI:** Radix UIベースの再利用可能なコンポーネント集。カスタマイズ性が高く、モダンなデザイン（ガラスモーフィズム等）を実装しやすい。
- **Framer Motion:** マイクロインタラクションとアニメーションの実装。
- **tw-animate-css:** Tailwind用アニメーションユーティリティ。

**UI Dependencies (Radix UI):**

- `@radix-ui/react-dialog` - モーダルダイアログ
- `@radix-ui/react-label` - アクセシブルラベル
- `@radix-ui/react-progress` - プログレスバー
- `@radix-ui/react-separator` - セパレーター
- `@radix-ui/react-slot` - コンポーネント合成
- `@radix-ui/react-tabs` - タブコンポーネント

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

---

## デザインシステム (Phase 6.1 更新)

### カラースキーム: "Argo Note - Black & Gold Luxury Theme"

```css
:root {
  /* Gold Palette */
  --gold: #D4AF37;
  --gold-light: #F4D03F;
  --gold-dark: #B8860B;

  /* Dark Mode Default (ラグジュアリー感) */
  --background: #0A0A0A;
  --foreground: #FAFAFA;
  --card: #111111;
  --primary: #D4AF37;
  --secondary: #1A1A1A;
  --accent: #D4AF37;
  --destructive: #EF4444;

  /* Sidebar */
  --sidebar: #0D0D0D;
  --sidebar-primary: #D4AF37;
  --sidebar-border: rgba(212, 175, 55, 0.15);
}
```

### UIコンポーネント一覧

| コンポーネント | ファイル | 機能 |
|---------------|----------|------|
| Button | `ui/button.tsx` | CVA variants, loading状態, asChild対応 |
| Card | `ui/card.tsx` | Header/Title/Description/Content/Footer/Action |
| Badge | `ui/badge.tsx` | 6バリアント, asChild対応 |
| Input | `ui/input.tsx` | error表示, デザイントークン適用 |
| Dialog | `ui/dialog.tsx` | Radix UI, アニメーション付きモーダル |
| Sheet | `ui/sheet.tsx` | サイドシート/ドロワー（モバイルナビ用） |
| Progress | `ui/progress.tsx` | Framer Motion shimmerエフェクト |
| Skeleton | `ui/skeleton.tsx` | ローディング表示, variants対応 |
| Tabs | `ui/tabs.tsx` | CVA variants, アニメーション |
| Label | `ui/label.tsx` | アクセシブルフォームラベル |

### ダッシュボードコンポーネント

| コンポーネント | ファイル | 機能 |
|---------------|----------|------|
| Sidebar | `dashboard/sidebar.tsx` | 折りたたみ対応, Framer Motion, モバイルSheet連携 |

### アニメーション & エフェクト

| 効果 | CSS Class | 説明 |
|------|-----------|------|
| Gold Gradient | `.gold-gradient` | ゴールドグラデーション背景 |
| Gold Text Gradient | `.gold-text-gradient` | テキストグラデーション |
| Gold Shimmer | `.gold-shimmer` | シマーアニメーション |
| Card Hover Lift | `.card-hover-lift` | ホバー時のリフトエフェクト |
| Press Effect | `.press-effect` | クリック時のスケール効果 |
| Gold Glow | `.gold-glow` | ゴールドグロー効果 |
| Glass Effect | `.glass`, `.glass-gold` | グラスモーフィズム |
| Float Animation | `.float-animation` | フロートアニメーション |

### アクセシビリティ

- **reduced-motion対応:** `@media (prefers-reduced-motion: reduce)` でアニメーション無効化
- **フォーカスリング:** ゴールドグロー効果付きの強化されたフォーカス表示
- **スクリーンリーダー:** `.sr-only` クラスでSR専用テキスト対応
- **カスタムスクロールバー:** ゴールドテーマのスタイリング済み
