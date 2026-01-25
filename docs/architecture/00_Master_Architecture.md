# 00. アーキテクチャ - マスタードキュメント

> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [WordPress Multisiteガイド](./07_WordPress_Multisite_Guide.md) | [全フェーズ一覧](../phases/)

## 概要

**Argo Note** の技術スタックとアーキテクチャ構造を定義するマスタードキュメントです。
本プロジェクトは、**「バイブコーディング時代の放置OKブログ自動運用SaaS」**です。

**サービスコンセプト:** "Your AI-Powered Blog. Fully Automated."

**核心的価値:**
- バイブコーディングで生まれたプロダクトの集客を自動化
- 最小限の入力で、WordPressブログのセットアップから記事生成・公開・運用まで一気通貫
- 「放置OK」の体験を技術的に担保

**MVP期限:** 2026年2月25日（1ヶ月）| **月額予算:** $100以内

## アーキテクチャ基本方針

1.  **疎結合と責務の分離 (Separation of Concerns):**
    - 管理画面・バックエンドAPI（アプリケーション層）と、実際にブログが稼働するWordPressサーバー（インフラ層）を明確に分離します。
    - これにより、個々のWordPressサイトの負荷がシステム全体に波及するのを防ぎ、セキュリティリスクも隔離します。
2.  **APIファースト:**
    - 全ての操作はAPI経由で行えるように設計し、将来的なモバイルアプリ化や外部連携に備えます。
3.  **資産性・可搬性の担保:**
    - WordPress Multisite構成を採用。標準のXMLエクスポートやMigrationプラグインにより「他社へ移管」が技術的に容易な構造にします（Exit戦略）。
    - 詳細は[Multisite実装可能性調査](./06_Multisite_feasibility.md)を参照。

## 構成要素一覧と詳細ドキュメント

全体の構造は以下の4つの領域に分割して詳細を検討します。

### [01. フロントエンド・アプリケーション層](./01_Frontend_Architecture.md)

ユーザーが触れる管理画面（ダッシュボード）と、バックエンドAPIサーバーの設計です。

- **Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Host:** Vercel
- **Auth:** **Supabase Auth**（Google OAuth対応）

### [02. バックエンドAPI・データベース層](./02_Backend_Database.md)

ビジネスロジック、データ永続化、ジョブ管理を担う層です。

- **API:** Next.js API Routes, Prisma ORM
- **Database:** **Supabase (PostgreSQL)** + MariaDB (WordPress)
- **Worker:** **Inngest**（長時間処理・自動リトライ）
- **Token暗号化:** AES-256-GCM

### [03. インフラ・WordPress実行層](./03_Infrastructure_Ops.md)

実際にユーザーのブログが稼働する環境です。本サービスの心臓部です。

- **Platform:** **DigitalOcean VPS**
- **Architecture:** **WordPress Multisite**（100サイトまで単一VPS）→ [詳細ガイド](./07_WordPress_Multisite_Guide.md)
- **Network:** Cloudflare (DNS, CDN, SSL)
- **Storage:** **Cloudflare R2**（メディアファイル）
- **Monitoring:** UptimeRobot, Sentry

### [04. AIパイプライン・ジョブシステム](./04_AI_Pipeline.md)

記事生成、分析、画像生成を行う非同期処理フローです。

- **Text Gen (Main):** **Claude 3.5 Sonnet**（LiteLLMプロキシ経由）
- **Text Gen (Fallback):** **GPT-4o-mini**
- **Search:** Tavily API
- **Scraping:** **Firecrawl + Jina Reader**（フォールバック）
- **Image (MVP):** Unsplash/Pexels → **DALL-E 3**（Phase 7）
- **Scheduler:** **Inngest**（スケジュール自動化）

---

## 全体アーキテクチャ図（概略）

```mermaid
graph TD
    User((User)) -->|Browser| Dashboard[Next.js Dashboard]

    subgraph "Application Layer (Vercel)"
        Dashboard --> API[Backend API]
        API --> DB[(Supabase PostgreSQL)]
        API --> Inngest[(Inngest Worker)]
    end

    subgraph "AI Logic Layer"
        Inngest -->|Analyze/Generate| LLM[Claude 3.5 Sonnet]
        Inngest -->|Search| Search[Tavily + Firecrawl]
        Inngest -->|Fallback| LLM_FB[GPT-4o-mini]
    end

    subgraph "Infrastructure Layer (DigitalOcean VPS)"
        Inngest -->|Post Article| WP_Multi[WP Multisite Core]
        WP_Multi -->|Virtual| SiteA[Site A]
        WP_Multi -->|Virtual| SiteB[Site B]
        WP_Multi --> R2[(Cloudflare R2)]
    end

    Public((Readers)) -->|Access| Cloudflare
    Cloudflare -->|CDN/WAF| WP_Multi
```

---

## 開発フェーズとの関連

本アーキテクチャは以下のフェーズで実装されます。詳細は[開発ロードマップ](../DEVELOPMENT_ROADMAP.md)を参照。

| フェーズ | 関連するアーキテクチャ要素 | Week |
|---------|--------------------------|------|
| [Phase 1: Infrastructure + Auth](../phases/Phase1_Infrastructure.md) | VPS、Multisite、Supabase Auth | 1 |
| [Phase 2: Core AI](../phases/Phase2_CoreAI.md) | AIパイプライン、Inngest | 2 |
| [Phase 3: User Interface](../phases/Phase3_UserInterface.md) | Next.js Dashboard | 3 |
| [Phase 4: Automation](../phases/Phase4_Automation.md) | スケジュール自動化 | 3 |
| [Phase 5: Monetization](../phases/Phase5_Monetization.md) | Stripe連携 | 4 |
| [Phase 6: MVP Launch](../phases/Phase6_MVPLaunch.md) | Beta運用開始 | 4 |
