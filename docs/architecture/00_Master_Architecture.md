# 00. アーキテクチャ再検討 - マスタードキュメント

## 概要

ProductBlog AIの技術スタックとアーキテクチャ構造の再検討用ドキュメントです。
本プロジェクトは、**「AIによる記事自動生成・自動運用のWordPressブログ構築SaaS」**です。
MVP（Minimum Viable Product）としての立ち上げ速度と、将来的なスケーラビリティ（数千ユーザー規模）、そして何より「ユーザーの認知負荷を下げるパッケージング」を実現するための構成を定義します。

## アーキテクチャ基本方針

1.  **疎結合と責務の分離 (Separation of Concerns):**
    - 管理画面・バックエンドAPI（アプリケーション層）と、実際にブログが稼働するWordPressサーバー（インフラ層）を明確に分離します。
    - これにより、個々のWordPressサイトの負荷がシステム全体に波及するのを防ぎ、セキュリティリスクも隔離します。
2.  **APIファースト:**
    - 全ての操作はAPI経由で行えるように設計し、将来的なモバイルアプリ化や外部連携に備えます。
3.  **資産性・可搬性の担保:**
    - WordPress + Docker構成を採用し、「エクスポートして他社へ移管」が技術的に容易な構造にします（Exit戦略）。

## 構成要素一覧と詳細ドキュメント

全体の構造は以下の4つの領域に分割して詳細を検討します。

### [01. フロントエンド・アプリケーション層](./01_Frontend_Architecture.md)

ユーザーが触れる管理画面（ダッシュボード）と、バックエンドAPIサーバーの設計です。

- **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS
- **Host:** Vercel (MVP時点)
- **Auth:** NextAuth.js / Supabase Auth

### [02. バックエンドAPI・データベース層](./02_Backend_Database.md)

ビジネスロジック、データ永続化、ジョブ管理を担う層です。

- **API:** Next.js API Routes または 独立したGo/Node.jsサーバー
- **Database:** PostgreSQL (Neon / Supabase)
- **Queue:** Redis (Upstash) / BullMQ

### [03. インフラ・WordPress実行層](./03_Infrastructure_Ops.md)

実際にユーザーのブログが稼働する環境です。本サービスの心臓部です。

- **Platform:** DigitalOcean VPS (Droplets) or Coolify
- **Architecture:** **WordPress Multisite (Scalable Single Instance)**
- **Network:** Cloudflare (DNS, CDN, SSL) + **Reverse Proxy Integration**

### [04. AIパイプライン・ジョブシステム](./04_AI_Pipeline.md)

記事生成、分析、画像生成を行う非同期処理フローです。

- **Text Gen:** OpenAI / Anthropic / Gemini (Soft-coded wrapper)
- **Search:** Tavily API / Exa
- **Image:** DALL-E 3 / NanoBananaPro
- **Content Types:** SEO Articles, **FAQ, Glossary, Reviews** (Diverse Schemas)
- **Scheduler:** Cron Jobs (Flexible Scheduling)

---

## 全体アーキテクチャ図（概略）

```mermaid
graph TD
    User((User)) -->|Browser| Dashboard[Next.js Dashboard]

    subgraph "Application Layer (Vercel/Managed)"
        Dashboard --> API[Backend API]
        API --> DB[(PostgreSQL)]
        API --> Redis[(Redis Queue)]
    end

    subgraph "AI Logic Layer"
        Worker[Job Worker] -->|Fetch Jobs| Redis
        Worker -->|Analyze/Generate| LLM[LLM API (Gemini/Claude)]
        Worker -->|Search| Search[Search API (Tavily)]
    end

    subgraph "Infrastructure Layer (VPS/DigitalOcean)"
        Worker -->|Provision/Post| WP_Multi[WP Multisite Core]
        WP_Multi -->|Virtual| SiteA[Site A (Client A)]
        WP_Multi -->|Virtual| SiteB[Site B (Client B)]
    end

    Public((Readers)) -->|Access| Cloudflare
    Cloudflare -->|CDN/WAF| ReverseProxy[Nginx Proxy]
    ReverseProxy -->|Route| WP_Multi
```
