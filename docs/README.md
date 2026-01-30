# Argo Note - プロダクト仕様ドキュメント

> **"Your AI-Powered Blog. Fully Automated."**
> バイブコーディング時代の「放置OK」ブログ自動運用SaaS

---

## 最上位設計思想

**すべての開発は [開発哲学 (DEVELOPMENT_PHILOSOPHY.md)](./DEVELOPMENT_PHILOSOPHY.md) に従うこと。**

主要原則:
- **Service Per Pattern**: 統合を最終目的として、各機能を単体で開発・テスト可能な状態に保つ
- **開発フロー**: 単体開発 → 単体テスト → 結合テスト → 統合
- **Web UI による目視確認**: 単体テスト時に開発者が状態を視覚的に確認するための UI

---

## このリポジトリについて

このリポジトリは **Argo Note** のプロダクト仕様を定義・管理するためのドキュメントプロジェクトです。

### 目的

- プロダクトの設計・仕様を明確化
- 技術的な意思決定を記録
- 開発フェーズの計画を管理

### 注意事項

**このリポジトリは仕様定義のみを目的としています。実装コードは含まれません。**

---

## ドキュメント構成

```
docs/
│
├── README.md                          # 本ドキュメント（インデックス）
│
├─────────────────────────────────────────────────────────────────
│  【最上位設計思想】
├─────────────────────────────────────────────────────────────────
├── DEVELOPMENT_PHILOSOPHY.md          # 開発哲学（最上位・全文書はこれに従う）
│   └── Service Per Pattern、スタンドアロン開発、Web UI目視確認
├── STREAM_OVERVIEW.md                 # 全ストリーム一覧と開発計画
│   └── Stream 01-13 の概要と優先順位
│
├─────────────────────────────────────────────────────────────────
│  【コア設計ドキュメント】
├─────────────────────────────────────────────────────────────────
├── CONCEPT_DECISIONS.md               # 全決定事項の記録（マスター）
├── DEVELOPMENT_ROADMAP.md             # 開発ロードマップ
├── TASK_MANAGEMENT.md                 # タスク管理
├── USER_INPUT_LOG.md                  # ユーザー入力ログ（原文保存）
│
├─────────────────────────────────────────────────────────────────
│  【記事生成・AI戦略】
├─────────────────────────────────────────────────────────────────
├── FIRST_PRINCIPLES_ARTICLE_GENERATION.md   # ファーストプリンシプル分析 + 実装仕様
│   └── 5つの飛躍的アイデア（Soul Injection, Living Article, Thought Map, Vibe Writing, Transparency）
├── WORDPRESS_BLOG_CONSIDERATIONS.md         # WordPressブログ検討事項
│
├─────────────────────────────────────────────────────────────────
│  【コード統合記録】(Rapid-Note2からの移植)
├─────────────────────────────────────────────────────────────────
├── RAPID_NOTE_INTEGRATION_TASKS.md    # 統合タスク一覧（完了）
├── RAPID_NOTE_INTEGRATION_SUMMARY.md  # 統合完了レポート
│
├─────────────────────────────────────────────────────────────────
│  【技術仕様書】architecture/
├─────────────────────────────────────────────────────────────────
├── architecture/
│   ├── Stream01_Specification.md      # Stream 01 記事生成モジュール完全仕様書
│   ├── Stream02_Multisite_Feasibility.md  # Stream 02 Multisite採用検討
│   ├── Stream02_Multisite_Guide.md    # Stream 02 Multisite実装ガイド
│   ├── Claude_Batch_API.md            # Claude Batch API仕様
│   └── VPS_Provider_Selection.md      # VPSプロバイダー選定
│
├─────────────────────────────────────────────────────────────────
│  【ストリームドキュメント】phases/
├─────────────────────────────────────────────────────────────────
├── phases/
│   │
│   │  ── Stream 01: Article Generation ──
│   ├── Stream01_ArticleGen.md         # 記事生成モジュール仕様
│   ├── Stream01_Implementation_Plan.md    # 実装計画
│   ├── Stream01_Implementation_Report.md  # 実装レポート
│   ├── Stream01_E2E_Test_Plan.md      # E2Eテスト計画
│   ├── Stream01_Quality_Checklist.md  # 品質チェックリスト
│   │
│   │  ── Stream 02: WordPress Setup ──
│   ├── Stream02_WordPress.md          # WordPress セットアップ仕様
│   ├── Stream02_MVP.md                # MVP要件
│   ├── Stream02_MVP_Tasks.md          # MVPタスク一覧
│   │
│   │  ── Stream 12: LLM Selector ──
│   ├── Stream12_LLMSelector.md        # LLMセレクター仕様
│   │
│   │  ── Stream 13: Marketing ──
│   ├── Stream13_Marketing.md          # マーケティング仕様
│   │
│   │  ── 旧Phaseドキュメント（参考用）──
│   ├── Phase0_Mockup.md               # モックアップ・コンセプト検証
│   ├── Phase0.5_MVPBranding.md        # MVP用ブランディング
│   ├── Phase1_Infrastructure.md       # インフラ + 認証
│   ├── Phase2_CoreAI.md               # AIコア機能
│   └── ...
│
├─────────────────────────────────────────────────────────────────
│  【アーカイブ】archive/
├─────────────────────────────────────────────────────────────────
├── archive/
│   └── architecture-legacy/           # 旧アーキテクチャドキュメント
│       ├── 00_Master_Architecture.md
│       ├── 01_Frontend_Architecture.md
│       └── ...
│
├─────────────────────────────────────────────────────────────────
│  【ビジネス分析】business/
├─────────────────────────────────────────────────────────────────
└── business/
    └── Cost_Revenue_Analysis.md       # コスト・収益分析レポート
```

---

## クイックリンク

### 全体像を把握する（トップダウン）

| 順序 | ドキュメント | 内容 |
|------|-------------|------|
| **0** | **[DEVELOPMENT_PHILOSOPHY.md](./DEVELOPMENT_PHILOSOPHY.md)** | **開発哲学（最上位）** |
| **1** | **[STREAM_OVERVIEW.md](./STREAM_OVERVIEW.md)** | **全ストリーム一覧と計画** |
| 2 | [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) | フェーズ一覧と技術スタック |
| 3 | [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) | 全ての意思決定の記録 |

### ストリームドキュメント

| ストリーム | メインドキュメント | 状態 |
|-----------|------------------|------|
| **Stream 01** | [Stream01_ArticleGen.md](./phases/Stream01_ArticleGen.md) | ✅ 完了 |
| **Stream 02** | [Stream02_WordPress.md](./phases/Stream02_WordPress.md) | ✅ 分離完了 |
| **Stream 12** | [Stream12_LLMSelector.md](./phases/Stream12_LLMSelector.md) | 📋 計画 |
| **Stream 13** | [Stream13_Marketing.md](./phases/Stream13_Marketing.md) | 📋 継続 |

### 技術仕様書

| ドキュメント | 内容 |
|-------------|------|
| [Stream01_Specification.md](./architecture/Stream01_Specification.md) | Stream 01 記事生成モジュール完全仕様書 |
| [Stream02_Multisite_Feasibility.md](./architecture/Stream02_Multisite_Feasibility.md) | Multisite採用検討 |
| [Stream02_Multisite_Guide.md](./architecture/Stream02_Multisite_Guide.md) | Multisite実装ガイド |
| [Claude_Batch_API.md](./architecture/Claude_Batch_API.md) | Claude Batch API仕様 |
| [VPS_Provider_Selection.md](./architecture/VPS_Provider_Selection.md) | VPSプロバイダー選定 |

### 記事生成・AI機能

| ドキュメント | 内容 |
|-------------|------|
| [FIRST_PRINCIPLES_ARTICLE_GENERATION.md](./FIRST_PRINCIPLES_ARTICLE_GENERATION.md) | 記事生成のファーストプリンシプル分析 + 飛躍的アイデア実装仕様 |
| [WORDPRESS_BLOG_CONSIDERATIONS.md](./WORDPRESS_BLOG_CONSIDERATIONS.md) | WordPressブログ運用の検討事項 |
| [RAPID_NOTE_INTEGRATION_TASKS.md](./RAPID_NOTE_INTEGRATION_TASKS.md) | Rapid-Note2コード統合タスク一覧 |
| [RAPID_NOTE_INTEGRATION_SUMMARY.md](./RAPID_NOTE_INTEGRATION_SUMMARY.md) | 統合完了レポート |

### ビジネス分析

| ドキュメント | 内容 |
|-------------|------|
| [Cost_Revenue_Analysis.md](./business/Cost_Revenue_Analysis.md) | コスト・収益分析、損益分岐点 |

### タスク管理

- [TASK_MANAGEMENT.md](./TASK_MANAGEMENT.md) - 進行中・完了タスクの管理
- [USER_INPUT_LOG.md](./USER_INPUT_LOG.md) - ユーザー入力の原文保存

---

## ドキュメント関連図

```
                            ┌─────────────────────┐
                            │      README.md      │
                            │    (インデックス)    │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │ DEVELOPMENT_        │
                            │ PHILOSOPHY.md       │
                            │ 【最上位設計思想】  │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │ STREAM_OVERVIEW.md  │
                            │ 【全ストリーム一覧】│
                            └──────────┬──────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
  ┌───────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │ Stream01_*    │          │ Stream02_*      │          │ Stream12/13_*   │
  │ (記事生成)    │          │ (WordPress)     │          │ (LLM/Marketing) │
  └───────────────┘          └─────────────────┘          └─────────────────┘
```

**凡例:**
- 親子関係: 上位ドキュメントから下位ドキュメントへリンク

---

## プロジェクト概要

### ターゲット

**バイブコーディングでプロダクトを作った個人開発者**

- アプリは作れるが、集客方法がわからない
- SEO・ブログの書き方を学ぶ時間がない
- マーケティングより開発に集中したい

### 提供価値

> **「作ったアプリ、誰にも見つけてもらえない？ブログ集客をAIが全自動で。」**

- WordPressブログの自動セットアップ
- AI記事の自動生成・スケジュール投稿
- 完全自動運用（放置OK）

### 技術スタック（確定）

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Prisma ORM |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL) + MariaDB (WP) |
| Worker | Inngest |
| AI | Gemini 3.0 Pro (LiteLLM経由) |
| WordPress | Multisite on Hetzner VPS |
| CDN/Security | Cloudflare |

---

## MVP期限

**2026年2月25日（1ヶ月）**

月額予算: $100以内

---

## 貢献・編集について

ドキュメントの編集・追加を行う際は、[TASK_MANAGEMENT.md](./TASK_MANAGEMENT.md) にタスクを登録してから作業を開始してください。
