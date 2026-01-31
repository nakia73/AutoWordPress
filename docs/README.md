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

## リポジトリ構造

```
Autoblog/
│
├── docs/                     # プロダクト仕様・設計ドキュメント
│   ├── README.md             # 本ドキュメント（インデックス）
│   │
│   │  【最上位設計思想】
│   ├── DEVELOPMENT_PHILOSOPHY.md     # 開発哲学（最上位）
│   ├── STREAM_OVERVIEW.md            # 全ストリーム一覧と開発計画
│   │
│   │  【コア設計】
│   ├── CONCEPT_DECISIONS.md          # 全決定事項の記録
│   ├── DEVELOPMENT_ROADMAP.md        # 開発ロードマップ
│   ├── TASK_MANAGEMENT.md            # タスク管理
│   │
│   │  【AI戦略】
│   ├── FIRST_PRINCIPLES_ARTICLE_GENERATION.md  # 記事生成のファーストプリンシプル
│   ├── WORDPRESS_BLOG_CONSIDERATIONS.md        # WordPress運用検討
│   │
│   │  【共通技術仕様】
│   ├── architecture/
│   │   ├── Claude_Batch_API.md       # Claude Batch API仕様
│   │   └── VPS_Provider_Selection.md # VPSプロバイダー選定
│   │
│   │  【ビジネス】
│   ├── business/
│   │   └── Cost_Revenue_Analysis.md  # コスト・収益分析
│   │
│   │  【アーカイブ】
│   └── archive/
│       ├── phases-legacy/            # 旧Phaseドキュメント
│       ├── architecture-legacy/      # 旧アーキテクチャドキュメント
│       └── Rapid-Note2/              # 統合済みコードベース
│
├── app/                      # 統合本番アプリケーション
│
├── stream-01/                # Stream 01: Article Generation ✅ 完了
│   ├── docs/                 # Stream固有のドキュメント
│   │   ├── Stream01_ArticleGen.md
│   │   ├── Stream01_Specification.md
│   │   ├── Stream01_Implementation_Plan.md
│   │   ├── Stream01_Implementation_Report.md
│   │   ├── Stream01_E2E_Test_Plan.md
│   │   └── Stream01_Quality_Checklist.md
│   └── src/                  # アプリケーションコード
│
├── stream-02/                # Stream 02: WordPress Setup 🔄 開発中
│   ├── docs/                 # Stream固有のドキュメント
│   │   ├── Stream02_Spec.md
│   │   ├── Stream02_Tasks.md
│   │   ├── Stream02_WordPress.md
│   │   ├── Stream02_WPAgent_Spec.md
│   │   ├── Stream02_Multisite_Feasibility.md
│   │   └── Stream02_Multisite_Guide.md
│   └── src/                  # アプリケーションコード
│
├── stream-12/                # Stream 12: LLM Selector 📋 計画
│   └── docs/
│       └── Stream12_LLMSelector.md
│
├── stream-13/                # Stream 13: Marketing 📋 継続
│   ├── docs/
│   │   └── Stream13_Marketing.md
│   └── mockup/               # UIモックアップ
│
└── tools/                    # 開発ツール
    ├── demo-ralph-project/
    └── ralph-claude-code/
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
| **Stream 01** | [Stream01_ArticleGen.md](../stream-01/docs/Stream01_ArticleGen.md) | ✅ 完了 |
| **Stream 02** | [Stream02_Spec.md](../stream-02/docs/Stream02_Spec.md) | 🔄 開発中 |
| **Stream 12** | [Stream12_LLMSelector.md](../stream-12/docs/Stream12_LLMSelector.md) | 📋 計画 |
| **Stream 13** | [Stream13_Marketing.md](../stream-13/docs/Stream13_Marketing.md) | 📋 継続 |

### 共通技術仕様書

| ドキュメント | 内容 |
|-------------|------|
| [Claude_Batch_API.md](./architecture/Claude_Batch_API.md) | Claude Batch API仕様 |
| [VPS_Provider_Selection.md](./architecture/VPS_Provider_Selection.md) | VPSプロバイダー選定 |

### 記事生成・AI機能

| ドキュメント | 内容 |
|-------------|------|
| [FIRST_PRINCIPLES_ARTICLE_GENERATION.md](./FIRST_PRINCIPLES_ARTICLE_GENERATION.md) | 記事生成のファーストプリンシプル分析 |
| [WORDPRESS_BLOG_CONSIDERATIONS.md](./WORDPRESS_BLOG_CONSIDERATIONS.md) | WordPressブログ運用の検討事項 |

### ビジネス分析

| ドキュメント | 内容 |
|-------------|------|
| [Cost_Revenue_Analysis.md](./business/Cost_Revenue_Analysis.md) | コスト・収益分析、損益分岐点 |

---

## ドキュメント関連図

```
                            ┌─────────────────────┐
                            │   docs/README.md    │
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
  │ stream-01/    │          │ stream-02/      │          │ stream-12,13/   │
  │ docs/         │          │ docs/           │          │ docs/           │
  │ (記事生成)    │          │ (WordPress)     │          │ (LLM/Marketing) │
  └───────────────┘          └─────────────────┘          └─────────────────┘
```

**凡例:**
- 各Streamのドキュメントはそれぞれのディレクトリ配下に格納
- 共通仕様は `docs/architecture/` に配置

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
