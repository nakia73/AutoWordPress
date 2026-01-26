# 05. シーケンス図 (Sequence Diagrams)

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [AIパイプライン](./04_AI_Pipeline.md)

本システムにおける主要なワークフローの処理シーケンスを定義します。

## 1. ユーザー登録〜プロダクト分析〜ブログ構築フロー

ユーザーがサインアップし、プロダクト情報を入力してから、ブログが実際に立ち上がるまでの流れです。
**プロダクト分析は複数の入力方式に対応**しており、ユーザーの状況に応じて選択できます。

### プロダクト分析の入力方式

| 方式 | 対象ユーザー | 入力内容 |
|------|-------------|----------|
| **A. URLクロール** | 明確なプロダクトサイトがある | URLを貼り付け → Firecrawl/Jina Readerで情報取得 |
| **B. インタラクティブ** | プロダクトが未確定/開発中 | 質問に回答 → LLMが整理 |
| **C. 競合調査** | 市場参入を検討中 | キーワード入力 → Tavily検索 → LLM解釈 |

**重要:** 方式Cでは、Tavily Search API → LLM解釈 のフローが**必須**です。

**MVP採用方式の決定プロセス:** AのURLクロールMockup と BのインタラクティブQ&A Mockup を作成し、XなどのSNSで映像を配信して反応を比較し、どちらが市場に求められているかを検証した上で採用方式を決定する。方式Cは本テスト対象外で、扱いは別途決定する。

```mermaid
sequenceDiagram
    actor User
    participant NextUI as Next.js UI (Dashboard)
    participant NextAPI as Next.js API Routes (Backend)
    participant DB as Supabase (PostgreSQL)
    participant Inngest as Inngest (Worker)
    participant Analyzer as AI Worker (Product Analysis)
    participant Tavily as Tavily Search API
    participant Scraper as Firecrawl/Jina Reader
    participant LLM as Gemini 3.0 Pro (LiteLLM)
    participant Provisioner as WP Provisioning Worker
    participant Cloudflare as Cloudflare API
    participant VPS as DigitalOcean VPS

    User->>NextUI: サインアップ
    NextUI->>User: 分析方式を選択（A/B/C）

    alt 方式A: URLクロール
        User->>NextUI: プロダクトURL入力
        NextUI->>NextAPI: POST /api/products (mode: url, url: ...)
    else 方式B: インタラクティブ
        User->>NextUI: 質問に回答（プロダクト概要、ターゲット等）
        NextUI->>NextAPI: POST /api/products (mode: interactive, answers: ...)
    else 方式C: 競合調査
        User->>NextUI: キーワード・業界入力
        NextUI->>NextAPI: POST /api/products (mode: research, keywords: ...)
    end

    NextAPI->>DB: プロダクトレコード作成 (Status: PENDING)
    NextAPI->>Inngest: Job: ANALYZE_PRODUCT 追加
    NextAPI->>NextUI: 202 Accepted (Polling開始)

    par Async Analysis
        Analyzer->>Inngest: Job取得

        alt 方式A: URLクロール
            Analyzer->>Scraper: URLをクロール
            Scraper-->>Analyzer: ページ内容
            Analyzer->>LLM: 内容からペルソナ・戦略を生成
        else 方式B: インタラクティブ
            Analyzer->>LLM: 回答からペルソナ・戦略を生成
        else 方式C: 競合調査
            Analyzer->>Tavily: 競合サイト・人気記事を検索
            Tavily-->>Analyzer: 検索結果（生データ）
            Note over Analyzer,LLM: ※必須フロー: 検索結果をLLMで解釈
            Analyzer->>LLM: 検索結果を解釈・分析
            LLM-->>Analyzer: 競合分析・コンセプト提案
            Analyzer->>LLM: ペルソナ・戦略を生成
        end

        LLM-->>Analyzer: 分析結果 (JSON)
        Analyzer->>DB: ProductAnalysis保存 & Status更新
        Analyzer->>Inngest: Job: PROVISION_BLOG 追加
    end

    par Async Provisioning
        Provisioner->>Inngest: Job取得
        Provisioner->>Cloudflare: DNSレコード追加 (blog.yourapp.com)
        Provisioner->>VPS: WP-CLI実行 (wp site create)
        VPS-->>Provisioner: サイト作成完了
        Provisioner->>VPS: 初期設定 (テーマ・プラグイン)
        Provisioner->>DB: BlogSite情報保存 (Active)
    end

    loop Polling
        NextUI->>NextAPI: GET /api/products/:id
        NextAPI->>DB: Status確認
        DB-->>NextUI: Status: ACTIVE / ANALYSIS_COMPLETED
    end

    NextUI-->>User: 「ブログ構築完了！」表示
```

## 2. 記事自動生成・投稿フロー (Daily Loop)

毎日定期的に実行される、またはユーザー定義スケジュールに基づいて実行されるフローです。
ここでもAPIはトリガーのみを行い、実際の生成は非同期で行います。

```mermaid
sequenceDiagram
    participant Scheduler as Inngest Cron
    participant NextAPI as Next.js API Routes
    participant Inngest as Inngest (Worker)
    participant Writer as AI Worker (Writer)
    participant DB as Supabase (PostgreSQL)
    participant Tavily as Tavily Search API
    participant LLM as Gemini 3.0 Pro (LiteLLM)<br/>※ソフトコーディング
    participant ImageGen as Nanobana Pro
    participant UserWP as WordPress Multisite

    Scheduler->>NextAPI: Trigger: Generate Articles (Auth Header)
    NextAPI->>DB: 今日生成すべき記事を検索
    DB-->>NextAPI: 対象プロダクトリスト

    loop For Each Product
        NextAPI->>Inngest: Job: WRITE_ARTICLE (params)
    end

    NextAPI-->>Scheduler: 200 OK (Queued)

    Writer->>Inngest: Job取得
    Writer->>DB: 記事クラスター情報取得 (Keyword, Stage)

    rect rgb(240, 248, 255)
        note right of Writer: Research & Planning
        Writer->>Tavily: 検索実行 (Trends, Competitors)
        Tavily-->>Writer: 検索結果（生データ）
        Note over Writer,LLM: ※必須: 検索結果をLLMで解釈
        Writer->>LLM: 検索結果を解釈 + 構成案作成 (H2, H3)
    end

    rect rgb(255, 248, 240)
        note right of Writer: Writing & Editing
        Writer->>LLM: 本文執筆 (with Reference)
        Writer->>LLM: 推敲・導線チェック
        LLM-->>Writer: 完成記事 (HTML/Markdown)
    end

    rect rgb(240, 255, 240)
        note right of Writer: Media Generation
        Writer->>ImageGen: アイキャッチ画像生成
        ImageGen-->>Writer: 画像URL
    end

    rect rgb(255, 240, 245)
        note right of Writer: Publishing
        Writer->>UserWP: REST API: 投稿 (Status: Draft/Publish)
        UserWP-->>Writer: Post ID
        Writer->>DB: Article保存 (Linked to WP ID)
    end
```

## 3. ミドルエンドに関する補足 (Architecture Decision)

ユーザー様からのご質問「ミドルエンドは配置しないのか？」に対する回答とアーキテクチャの意図です。

### 現状の構成

Next.js (App Router) の **API Routes (Server Actions)** が実質的な「ミドルエンド（BFF: Backend For Frontend）」の役割を果たします。

- **Security:** 環境変数（API Key等）はサーバー側で保持され、クライアントには露出しません。認証（Auth）もここでガードします。
- **Performance:** VercelのEdge Network上で動作し、レイテンシを最小化します。
- **Logic:** 軽いビジネスロジックはここに記述します。

### なぜ独立したミドルエンドサーバー（Go/Node.js単体など）を置かないのか？

1.  **開発スピード (Time to Market):**
    - フロントエンドとバックエンドを単一の言語（TypeScript）、単一のフレームワーク（Next.js）で管理することで、型定義の共有やデプロイの簡略化が可能になり、MVP開発における圧倒的な速度向上に寄与します。
2.  **インフラ複雑性の排除:**
    - 独立したAPIサーバーを立てると、そのサーバーの管理、スケーリング、ロードバランシングが必要になります。Serverless (Vercel) に任せることで、インフラ管理コストをゼロにします。
3.  **非同期処理への委譲:**
    - 本サービスの重い処理（AI生成、WP構築）は、即時応答が必要なAPIサーバーではなく、**Worker（非同期ワーカー）** に任せる設計です。
    - したがって、APIサーバー自体はリクエストを受け付けてQueueに入れるだけの「軽量な」役割に徹するため、Node.js (Next.js API) で十分なパフォーマンスが出ます。

### 将来的な拡張

もし将来的に複雑なステートフルな処理（WebSocketの大量接続など）が必要になった場合や、エンタープライズ向けの厳格なマイクロサービス化が必要になった段階で、GoやRustによる独立したバックエンドサービスの導入を検討します。
現在のMVP〜グロースフェーズにおいては、**Next.js API Routes + Worker** の構成が最適解（オーバーエンジニアリングを避ける）と判断しました。
