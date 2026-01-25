# ProductBlog AI - 総合仕様書 (Final Specification)

**Version:** 3.0
**Last Updated:** 2026-01-25
**Status:** MVP Development Ready

---

## 1. プロダクトコンセプト

### 1.1 ビジョン: "Packaging is King"

2026年、AIコーディングの普及により「作る」ハードルは消滅しました。しかし、**「作ったが誰にも見てもらえない」**という課題が最大の障壁として残っています。
本サービスは、この課題に対し、技術的な新奇性ではなく**「圧倒的なパッケージング」**で解決策を提示します。

**「プロダクトURLを入力するだけで、集客用のWordPressブログが自動で立ち上がり、勝手に記事が増え続け、資産となっていく」**

この体験をワンストップで提供することで、開発者をマーケティングの呪縛から解放します。

### 1.2 ターゲットユーザー

- **Primary:** 個人開発者、スモールスタートアップ（マーケティング知識・時間がない層）
- **Insight:** 「SNS運用は大変だが、自動でブログ運用ができるなら試したい」「もしダメでも資産（記事）は残したい」
- **Secondary:** アフィリエイトブログ運営者（ドメイン知識はあるが、記事量産のリソースがない層）

### 1.3 コア・バリュープロポジション (MVP)

1.  **Zero-Configuration:** 複雑なSEO設定を排除。URL入力後、3分でサイト構築完了。
2.  **Flexible Scheduling:** 「毎日1記事」に限らず、ユーザー定義の柔軟なスケジュールで自動投稿。
3.  **Asset Ownership (Exit Strategy):** いつでもWordPressデータをエクスポートして他社サーバーへ移管可能。プラットフォームロックインを排除し、安心感を提供。
4.  **Conversion Focus:** 単なるアクセス稼ぎではなく、プロダクト成約（LP誘導）に特化した記事構成をAIが提案。

---

## 2. 機能要件 (Functional Requirements)

### 2.1 セットアップ・管理機能

- **簡易入力:** プロダクト名、URL、簡易説明のみで開始可能。
- **AI分析:** Firecrawl + LLMにより、ターゲットペルソナ、競合、記事クラスター案を自動生成。
- **WordPress自動構築:** WordPress Multisiteでユーザーごとのサイトを即座に作成。
- **サブドメイン:** `blog.productblog-ai.com` のようなサブドメインを即時発行（独自ドメインはFuture）。

### 2.2 記事生成・編集機能

- **セマンティック検索:** Tavily API / Exa AI を用い、最新トレンドとSEOキーワードに基づいた記事構成を作成。
- **スケジューリング:** Cronベースの柔軟な投稿スケジュール設定。
- **公開フロー設定:**
  - **Auto Publish:** 生成即公開。
  - **Review Mode:** 下書き（Draft）として保存。ユーザーはWP管理画面で確認・公開。
- **編集:** アプリ上での簡易編集（指示出し）機能と、WordPress管理画面でのフル編集機能の併用。

### 2.3 導線設計・トラッキング

- **CTA管理:** 記事文末や途中に挿入する「プロダクトへのリンクカード」を一括管理。
- **Analytics:** 記事ごとのPV、クリック数（CTR）、コンバージョン（CV）をダッシュボードで可視化。

---

## 3. 技術アーキテクチャ (Technical Architecture)

### 3.1 全体構成

疎結合な **APIファースト** アーキテクチャを採用し、将来的な拡張性を担保します。

| Layer              | Responsibility        | Technology Stack                                     |
| :----------------- | :-------------------- | :--------------------------------------------------- |
| **Frontend**       | 管理画面・UI          | **Next.js 14 (App Router)**, Tailwind CSS, Shadcn/UI |
| **Backend**        | API・ビジネスロジック | **Next.js API Routes** (Serverless)                  |
| **Database**       | データ永続化          | **PostgreSQL** (Neon), **Redis** (Upstash)           |
| **AI Workflows**   | LLM・検索処理         | **Gemini 1.5** (Default), Claude 3.5, Tavily API     |
| **Infrastructure** | WP実行環境            | **DigitalOcean VPS**, **WordPress Multisite**, **Cloudflare** |

### 3.2 インフラ・スケーリング戦略

コスト効率と拡張性を両立させるフェーズドアプローチを採用。

#### Phase 1: MVP (0-100 Users)

- **構成:** Single VPS (Basic Droplet $24/mo)
- **配置:** Nginx + WordPress Multisite。1つのWPインストールで全サイトを管理。
- **目的:** 固定費の最小化、即時サイト作成。

#### Phase 2: Growth (100-500 Users)

- **構成:** Single VPS (Vertical Scale -> $96/mo)
- **手法:** CPU/RAMのリソース増強（Resize）で対応。Redis Object Cacheを追加。
- **目的:** 運用複雑性の回避。

#### Phase 3: Scale (500+ Users)

- **構成:** Multi-VPS (Horizontal Scale)
- **ネットワーク:** Cloudflare DNSから各VPSノードへ直接ルーティング。
- **手法:** 新規ユーザーは新しいMultisiteインスタンス（Node B, Node C...）に収容。
- **Control Plane:** 1台の管理サーバーがルーティングとプロビジョニングを指揮。

### 3.3 ミドルエンドに関する意思決定

- **判断:** 独立したBFF/Backendサーバー（Go/Node単体）はMVP段階では**配置しない**。
- **理由:**
  1.  Next.js API Routes + Workerの構成で十分なパフォーマンスが出せる（重い処理は非同期Workerへ）。
  2.  単一リポジトリ（Monorepo-like）での開発速度を最優先。
  3.  Vercel等のマネージドインフラを活用し、DevOpsコストを下げる。

---

## 4. データモデル (Schema Overview)

主要なエンティティ関係の定義。

- **User:** 1対多 -> **Product**
- **Product:** プロダクト情報。1対1 -> **BlogSite** (WordPress情報)
- **ArticleCluster:** 生成すべき記事のテーマ・構成案。
- **Article:** 実際の記事コンテンツ。WordPressのPost IDと紐づく。
- **Job:** 非同期タスクの状態管理（Queue処理用）。

---

## 5. 主要ワークフロー (Sequence Summary)

### 5.1 セットアップフロー

1.  User: プロダクトURL入力
2.  Backend: Job(Analyze)をQueueに追加 → 即座にレスポンス
3.  Worker: Firecrawlでサイト解析、LLMで構成案作成
4.  Worker: WP-CLIで新規サイト作成（`wp site create`）
5.  Worker: Cloudflare APIでDNSレコード追加、初期設定完了
6.  User: 「完了」通知を受け取る

### 5.2 記事生成ループ (Daily)

1.  Scheduler: 定期実行トリガー
2.  Backend: その時間にスケジュールされた記事JobをQueueに追加
3.  Worker:
    - **Research:** Simantic Search (Tavily) で情報収集
    - **Draft:** Gemini 1.5 で執筆
    - **Refine:** Claude 3.5 で推敲
    - **Image:** DALL-E 3 で画像生成
    - **Publish:** WordPress REST API へPOST
4.  User: 必要なら下書き確認、または自動公開通知を受け取る

---

## 6. 今後の展望 (Roadmap)

- **v1.0 (MVP):** 基本的な自動生成とWordPress構築機能。
- **v1.5:** 独自ドメイン対応、既存ブログへの投稿機能（Plugin化）。
- **v2.0:** モバイルアプリ・ダッシュボード。
- **v3.0:** 大規模メディア向けエンタープライズ版（専用サーバー提供）。
