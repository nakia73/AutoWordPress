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

- **Platform:** **Hetzner VPS** → [選定理由](./11_VPS_Provider_Selection.md)
- **Architecture:** **WordPress Multisite**（100サイトまで単一VPS）→ [詳細ガイド](./07_WordPress_Multisite_Guide.md)
- **Network/Security:** Cloudflare（詳細下記）
- **Storage:** **Cloudflare R2**（メディアファイル）
- **Monitoring:** UptimeRobot, Sentry

#### Cloudflare利用サービス一覧

| サービス | 用途 | プラン |
|---------|------|--------|
| **Cloudflare DNS** | ドメイン管理、サブドメインルーティング | Free |
| **Cloudflare CDN** | 静的ファイルキャッシュ、グローバル配信 | Free |
| **Cloudflare SSL** | ワイルドカードSSL証明書（*.argonote.app） | Free |
| **Cloudflare WAF** | DDoS対策、Web攻撃防御、Bot対策 | Free |
| **Cloudflare R2** | メディアファイルストレージ（エグレス無料） | 従量課金 |
| **Cloudflare Proxy** | リバースプロキシ、オリジンIP秘匿 | Free |

**注:** 全てCloudflareのFreeプランで対応可能。R2のみ従量課金（10GB/月無料枠あり）。

### [04. AIパイプライン・ジョブシステム](./04_AI_Pipeline.md)

記事生成、分析、画像生成を行う非同期処理フローです。

**Stream A: 記事生成エンジン（実装済み）** → [完全仕様書](./04_StreamA_Specification.md)

6ステップパイプラインで高品質な記事を自動生成：

| Step | 処理 | ツール | 状態 |
|------|------|--------|------|
| 1 | Research（リサーチ） | Tavily 3段階検索 | ✅ |
| 2 | Outline（構成生成） | LLM | ✅ |
| 3 | Content（本文生成） | LLM | ✅ |
| 4 | Meta Description | LLM | ✅ |
| 5 | Thumbnail（サムネイル） | kie.ai / Google | ✅ |
| 6 | Section Images（挿絵） | kie.ai / Google | ✅ |

**技術スタック:**
- **LLM:** **Gemini 2.0 Flash**（LiteLLMプロキシ経由、ソフトコーディング）
- **Search/競合調査:** **Tavily API**（3段階マルチフェーズ検索）
- **Scraping:** **Jina Reader API**
- **Image:** **kie.ai NanoBanana Pro**（主要）+ **Google API**（フォールバック）
- **Scheduler:** **Inngest**（スケジュール自動化）

**入力パターン:** 4モード対応（site_url / article_url / text / hybrid）

**重要:** LLMモデルはソフトコーディング（環境変数で切り替え可能）とする。ハードコード禁止。

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

    subgraph "Stream A: Article Generation Engine"
        Inngest -->|Step 1| Tavily[Tavily API<br/>3段階検索]
        Tavily -->|Research Data| LLM[Gemini 2.0 Flash<br/>※ソフトコーディング]
        LLM -->|Step 2-4| Content[Outline/Content/<br/>Meta Description]
        Content -->|Step 5-6| ImageGen[kie.ai NanoBanana Pro<br/>+ Google API]
        Inngest -->|Scraping| Scraper[Jina Reader API]
    end

    subgraph "Infrastructure Layer (Hetzner VPS)"
        Inngest -->|Post Article| WP_Multi[WP Multisite Core]
        WP_Multi -->|Virtual| SiteA[Site A]
        WP_Multi -->|Virtual| SiteB[Site B]
        WP_Multi --> R2[(Cloudflare R2)]
    end

    Public((Readers)) -->|Access| Cloudflare
    Cloudflare -->|CDN/WAF| WP_Multi
```

### Stream A パイプライン詳細図

```mermaid
flowchart LR
    subgraph Input["入力パターン"]
        A1[site_url]
        A2[article_url]
        A3[text]
        A4[hybrid]
    end

    subgraph Pipeline["6ステップパイプライン"]
        B1[Step 1: Research<br/>Tavily 3-Phase]
        B2[Step 2: Outline<br/>LLM]
        B3[Step 3: Content<br/>LLM]
        B4[Step 4: Meta<br/>LLM]
        B5[Step 5: Thumbnail<br/>kie.ai/Google]
        B6[Step 6: Section Images<br/>kie.ai/Google]

        B1 --> B2 --> B3 --> B4 --> B5 --> B6
    end

    subgraph Output["出力"]
        C1[記事HTML]
        C2[メタデータJSON]
        C3[サムネイル画像]
        C4[セクション画像x5]
    end

    Input --> Pipeline --> Output
```

---

## 開発フェーズとの関連

本アーキテクチャは以下のフェーズで実装されます。詳細は[開発ロードマップ](../DEVELOPMENT_ROADMAP.md)を参照。

| フェーズ | 関連するアーキテクチャ要素 | Week |
|---------|--------------------------|------|
| [Phase 0: Mockup](../phases/Phase0_Mockup.md) | SNSデモ動画・コンセプト検証 | 1前半 |
| [Phase 0.5: MVP Branding](../phases/Phase0.5_MVPBranding.md) | ロゴ・アイコン・正式LP | 1前半 |
| [Phase 1: Infrastructure + Auth](../phases/Phase1_Infrastructure.md) | VPS、Multisite、Supabase Auth | 1 |
| [Phase 2: Core AI](../phases/Phase2_CoreAI.md) | AIパイプライン、Inngest | 2 |
| [Phase 3: User Interface](../phases/Phase3_UserInterface.md) | Next.js Dashboard | 3 |
| [Phase 4: Automation](../phases/Phase4_Automation.md) | スケジュール自動化 | 3 |
| [Phase 5: Monetization](../phases/Phase5_Monetization.md) | Stripe連携 | 4 |
| [Phase 6: MVP Launch](../phases/Phase6_MVPLaunch.md) | Beta運用開始 | 4 |

**成長フェーズ（Phase 7-15）:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) を参照
- Phase 10: GSC Integration（パフォーマンスデータ取得）
- **Phase 15: Prompt Intelligence**（プロンプト効果分析・A/Bテスト）
