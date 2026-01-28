# Argo Note - プロダクト仕様ドキュメント

> **"Your AI-Powered Blog. Fully Automated."**
> バイブコーディング時代の「放置OK」ブログ自動運用SaaS

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
│   ├── 00_Master_Architecture.md      # 全体アーキテクチャ（マスター）
│   ├── 01_Frontend_Architecture.md    # フロントエンド仕様
│   ├── 02_Backend_Database.md         # バックエンド・DB仕様
│   ├── 03_Infrastructure_Ops.md       # インフラ・運用仕様
│   ├── 04_AI_Pipeline.md              # AIパイプライン仕様
│   ├── 05_Sequence_Diagrams.md        # シーケンス図
│   ├── 06_Multisite_feasibility.md    # Multisite採用検討
│   ├── 07_WordPress_Multisite_Guide.md    # Multisite実装ガイド
│   ├── 08_Integration_Risk_Report.md      # 整合性リスクレポート
│   ├── 09_Critical_Issues_Report.md       # 致命的問題点レポート（10イテレーション）
│   └── 10_Comprehensive_Critical_Issues_Report.md  # 包括的問題点レポート（50イテレーション）
│
├─────────────────────────────────────────────────────────────────
│  【開発フェーズ】phases/
├─────────────────────────────────────────────────────────────────
├── phases/
│   │
│   │  ── MVP必須（Phase 0-6）──
│   ├── Phase0_Mockup.md               # モックアップ・コンセプト検証
│   ├── Phase0.5_MVPBranding.md        # MVP用ブランディング
│   ├── Phase1_Infrastructure.md       # インフラ + 認証
│   ├── Phase2_CoreAI.md               # AIコア機能
│   ├── Phase3_UserInterface.md        # ユーザーインターフェース
│   ├── Phase4_Automation.md           # 自動化
│   ├── Phase5_Monetization.md         # 収益化
│   ├── Phase6_MVPLaunch.md            # MVPリリース
│   │
│   │  ── MVP後拡張（Phase 7-15）──
│   ├── Phase7_Visual.md               # 画像生成
│   ├── Phase8_CustomDomain.md         # 独自ドメイン
│   ├── Phase9_SSO.md                  # シームレスログイン
│   ├── Phase10_GSCIntegration.md      # GSC連携 + Living Article
│   ├── Phase11_HeadlessEvaluation.md  # Headless化評価
│   ├── Phase12_ModelSelection.md      # LLMモデル選択 + Vibe Writing
│   ├── Phase13_BrandIdentity.md       # ブランド進化
│   ├── Phase14_ReferralProgram.md     # リファラルプログラム
│   └── Phase15_PromptIntelligence.md  # プロンプト効果分析 + Soul Injection LoRA
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
| 1 | [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) | フェーズ一覧と技術スタック |
| 2 | [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) | 全ての意思決定の記録 |
| 3 | [00_Master_Architecture.md](./architecture/00_Master_Architecture.md) | 技術アーキテクチャ概要 |

### 記事生成・AI機能

| ドキュメント | 内容 |
|-------------|------|
| [FIRST_PRINCIPLES_ARTICLE_GENERATION.md](./FIRST_PRINCIPLES_ARTICLE_GENERATION.md) | 記事生成のファーストプリンシプル分析 + 飛躍的アイデア実装仕様 |
| [WORDPRESS_BLOG_CONSIDERATIONS.md](./WORDPRESS_BLOG_CONSIDERATIONS.md) | WordPressブログ運用の検討事項 |
| [04_AI_Pipeline.md](./architecture/04_AI_Pipeline.md) | AIパイプライン技術仕様（Phase A-G） |
| [RAPID_NOTE_INTEGRATION_TASKS.md](./RAPID_NOTE_INTEGRATION_TASKS.md) | Rapid-Note2コード統合タスク一覧 |
| [RAPID_NOTE_INTEGRATION_SUMMARY.md](./RAPID_NOTE_INTEGRATION_SUMMARY.md) | 統合完了レポート |

### 技術仕様書

| ドキュメント | 内容 |
|-------------|------|
| [00_Master_Architecture.md](./architecture/00_Master_Architecture.md) | 全体アーキテクチャ概要（マスター） |
| [01_Frontend_Architecture.md](./architecture/01_Frontend_Architecture.md) | フロントエンド仕様（Next.js, UI） |
| [02_Backend_Database.md](./architecture/02_Backend_Database.md) | バックエンド・データベース仕様 |
| [03_Infrastructure_Ops.md](./architecture/03_Infrastructure_Ops.md) | インフラ・運用仕様（VPS, WordPress） |
| [05_Sequence_Diagrams.md](./architecture/05_Sequence_Diagrams.md) | シーケンス図 |
| [06_Multisite_feasibility.md](./architecture/06_Multisite_feasibility.md) | Multisite採用検討 |
| [07_WordPress_Multisite_Guide.md](./architecture/07_WordPress_Multisite_Guide.md) | Multisite実装ガイド |

### ビジネス分析

| ドキュメント | 内容 |
|-------------|------|
| [Cost_Revenue_Analysis.md](./business/Cost_Revenue_Analysis.md) | コスト・収益分析、損益分岐点 |

### 開発フェーズ（MVP Phase 0-6）

| Phase | ドキュメント | 内容 |
|-------|-------------|------|
| 0 | [Phase0_Mockup.md](./phases/Phase0_Mockup.md) | モックアップ・コンセプト検証 |
| 0.5 | [Phase0.5_MVPBranding.md](./phases/Phase0.5_MVPBranding.md) | MVP用ブランディング |
| 1 | [Phase1_Infrastructure.md](./phases/Phase1_Infrastructure.md) | インフラ + 認証 |
| 2 | [Phase2_CoreAI.md](./phases/Phase2_CoreAI.md) | AIコア機能 |
| 3 | [Phase3_UserInterface.md](./phases/Phase3_UserInterface.md) | ユーザーインターフェース |
| 4 | [Phase4_Automation.md](./phases/Phase4_Automation.md) | 自動化 |
| 5 | [Phase5_Monetization.md](./phases/Phase5_Monetization.md) | 収益化 |
| 6 | [Phase6_MVPLaunch.md](./phases/Phase6_MVPLaunch.md) | MVPリリース |

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
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
  ┌───────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │ DEVELOPMENT   │◀────────▶│    CONCEPT      │◀────────▶│ 00_Master       │
  │ ROADMAP.md    │          │ DECISIONS.md    │          │ Architecture.md │
  │ (ロードマップ)│          │  (全決定事項)   │          │  (技術概要)     │
  └───────┬───────┘          └────────┬────────┘          └────────┬────────┘
          │                           │                            │
          │    ┌──────────────────────┼──────────────────────┐     │
          │    │                      │                      │     │
          │    ▼                      ▼                      ▼     │
          │ ┌────────────┐  ┌──────────────────────┐  ┌─────────────────┐
          │ │ WORDPRESS  │  │ FIRST_PRINCIPLES_    │  │ architecture/   │
          │ │ BLOG_*.md  │◀▶│ ARTICLE_GENERATION.md│◀▶│ 01-07_*.md      │
          │ │(WP検討事項)│  │ (記事生成分析+実装)  │  │ (技術仕様詳細)  │
          │ └────────────┘  └──────────┬───────────┘  └─────────────────┘
          │                            │
          │          ┌─────────────────┼─────────────────┐
          │          │                 │                 │
          ▼          ▼                 ▼                 ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
  │ phases/      │ │ 04_AI        │ │ Cost_Revenue │ │ RAPID_NOTE       │
  │ Phase0-15.md │ │ Pipeline.md  │ │ Analysis.md  │ │ INTEGRATION_*.md │
  │(開発フェーズ)│ │(AI技術仕様)  │ │ (コスト分析) │ │(コード統合記録)  │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘
```

**凡例:**
- `◀──▶` : 相互参照あり
- `──▶` : 一方向参照
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
