# Phase 3: User Interface（ユーザー・インターフェース）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [フロントエンド仕様](../architecture/01_Frontend_Architecture.md) | [シーケンス図](../architecture/05_Sequence_Diagrams.md)
> **前のフェーズ:** [← Phase 2: Core AI](./Phase2_CoreAI.md) | **次のフェーズ:** [Phase 4: Automation →](./Phase4_Automation.md)
>
> **実施週:** Week 3

**テーマ:** User Onboarding & Control
**ゴール:** ユーザーがアカウントを作成し、自身のブログが作成・運用されていくプロセスを管理できるダッシュボードを提供する。

---

## 1. 目的

AIというブラックボックスを、ユーザーが安心してコントロールできる窓口を作ります。特に、複雑なWordPress設定を意識させず、**「成果の確認と簡単な指示」**に集中できるUXを目指します。

---

## 2. 実装ステップ

### Step 1: 認証統合（Supabase Auth - Phase 1で構築済み）

**Note:** 認証基盤はPhase 1で構築済み。本フェーズではUIとの統合を行う。

- **Google OAuth** によるワンクリックサインアップ/ログイン
- Supabase Auth のセッション管理
- Next.js App Routerとの統合

**セキュリティ要件:**

- CSRF保護（Supabase Auth内蔵）
- Rate Limiting（Supabase側で設定）
- セキュアなCookie設定（HttpOnly, Secure, SameSite）

### Step 2: 魔法のようなオンボーディング

- URL入力後の「待機時間」を、「価値が蓄積されている時間」として演出。
- 進捗バーやステップインジケーターを用いて、分析中・構築中・生成中の状態を可視化。

**オンボーディングフロー:**

1. Googleアカウントでサインアップ（ワンクリック）
2. プロダクトURL入力
3. 分析中プログレス表示（「Analyzing your product...」）
4. 完了通知 → ダッシュボードへ

### Step 3: 記事管理ダッシュボード

- 生成された記事の一覧表示とステータス（下書き/公開/生成中）の管理。
- 各記事のプレビュー機能。
- 記事ごとの「自動公開」または「手動確認後公開」のトグルスイッチ。

**表示項目:**

| 項目 | 説明 |
|------|------|
| 総記事数 | 生成された記事の合計 |
| 公開済み | WordPressで公開中の記事数 |
| 下書き | 確認待ちの記事数 |
| 生成中 | 現在処理中の記事数 |

### Step 4: コンバージョン導線（CTA）管理

- 全記事に共通して挿入される「プロダクトへのリンクカード（CTA）」を一括編集できる機能。
- これにより、SEO記事からメインプロダクトへの送客効率を最大化。

---

## 3. 技術スタック

**詳細:** [フロントエンド仕様書](../architecture/01_Frontend_Architecture.md) を参照

| コンポーネント | 技術 |
|---------------|------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Shadcn/UI + Framer Motion |
| UI Components | Radix UI (@radix-ui/react-*) |
| State | Zustand + TanStack Query |
| Auth | **Supabase Auth**（Google OAuth対応）|

### Phase 6.1 UI Upgrade (2026-01-27 完了)

本フェーズでUIの大幅なアップグレードを実施。詳細は [Phase 6.1 UI Upgrade Plan](../../app/.claude/phase-6.1-ui-upgrade.md) を参照。

**主な変更点:**

- **カラースキーム:** Blue-600 → Gold (#D4AF37) ラグジュアリーテーマ
- **レイアウト:** 横型ナビ → サイドバーナビゲーション
- **アニメーション:** Framer Motion による豊富なインタラクション
- **コンポーネント:** 4個 → 10個に拡充（Dialog, Sheet, Progress, Skeleton, Tabs, Label追加）
- **ダークモード:** OSデフォルト対応 → ダークモード基調のラグジュアリーテーマ

---

## 4. 画面一覧

| 画面 | パス | 認証 |
|------|------|------|
| ランディングページ | `/` | 不要 |
| サインアップ | `/signup` | 不要 |
| ログイン | `/login` | 不要 |
| パスワードリセット | `/reset-password` | 不要 |
| オンボーディング | `/onboarding` | 必要 |
| ダッシュボード | `/dashboard` | 必要 |
| 記事一覧 | `/dashboard/articles` | 必要 |
| 設定 | `/dashboard/settings` | 必要 |

**ディレクトリ構造:** [フロントエンド仕様書](../architecture/01_Frontend_Architecture.md#ディレクトリ構造-src) を参照

---

## 6. セキュリティ & 実用性の考慮

- **アクセス制御:** 自分のドメインに関連するデータのみが閲覧可能であることをサーバーサイドで厳格に検証。
- **疎結合設計:** ダッシュボードが一時的にダウンしても、WordPress側のブログ表示には影響を与えない設計。

---

## 7. 成功基準

- ITに詳しくないユーザーでも、迷うことなくブログを開設し、1記事目の確認まで到達できること。
- パスワードのリセットやログインといった標準的な認証機能が不備なく動作すること。

---

## 8. 次のステップ

ユーザーインターフェースが完成したら、**Phase 4: Automation** でスケジュール自動化を実装する（MVP必須機能）。
