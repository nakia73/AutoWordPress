# 05. シーケンス図 (Sequence Diagrams)

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [AIパイプライン](./04_AI_Pipeline.md)

本システムにおける主要なワークフローの処理シーケンスを定義します。

## 1. ユーザー登録〜プロダクト分析〜ブログ構築フロー

ユーザーがサインアップし、プロダクトURLを入力してから、ブログが実際に立ち上がるまでの流れです。
ここではAPIサーバーが「コントローラー」として振る舞い、重い処理はQueue経由でWorkerにオフロードしています。

```mermaid
sequenceDiagram
    actor User
    participant NextUI as Next.js UI (Dashboard)
    participant NextAPI as Next.js API Routes (Backend)
    participant DB as Supabase (PostgreSQL)
    participant Inngest as Inngest (Worker)
    participant Analyzer as AI Worker (Product Analysis)
    participant Provisioner as WP Provisioning Worker
    participant External as External APIs (Claude/Firecrawl)
    participant Cloudflare as Cloudflare API
    participant VPS as DigitalOcean VPS

    User->>NextUI: サインアップ & プロダクトURL入力
    NextUI->>NextAPI: POST /api/products (URL, info)
    NextAPI->>DB: プロダクトレコード作成 (Status: PENDING)
    NextAPI->>Inngest: Job: ANALYZE_PRODUCT 追加
    NextAPI->>NextUI: 202 Accepted (Polling開始)

    par Async Analysis
        Analyzer->>Inngest: Job取得
        Analyzer->>External: FirecrawlでURL解析
        External-->>Analyzer: 解析結果
        Analyzer->>External: Claudeでペルソナ・クラスター生成
        External-->>Analyzer: 分析結果 (JSON)
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
    participant Search as Tavily/Firecrawl API
    participant LLM as Claude 3.5 Sonnet (LiteLLM)
    participant ImageGen as Unsplash/Pexels (MVP)
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
        Writer->>Search: 検索実行 (Trends, Competitors)
        Search-->>Writer: 検索結果
        Writer->>LLM: 構成案作成 (H2, H3)
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
