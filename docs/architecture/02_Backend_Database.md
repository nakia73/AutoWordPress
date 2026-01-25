# 02. バックエンドAPI・データベースアーキテクチャ

## バックエンド構成 (API)

**Technology:** Next.js API Routes (Serverless Functions)

- **理由:** フロントエンドと同一レポジトリで管理でき、型安全性（monorepo-like）が高い。MVP開発速度重視。
- **Job Processing:** 長時間実行処理（記事生成など）はServerless関数のタイムアウト（Vercel Pro: 300sなど）に引っかかるため、**非同期ジョブキュー**を必ず挟む設計とします。

**Language:** TypeScript / Node.js

## データベース設計 (Database)

**Engine:** PostgreSQL 16+
**Hosting:** Neon (Serverless Postgres) or Supabase (Managed)

- コネクションプーリングが必須（Serverless環境からの接続過多を防ぐため）。

**ORM:** Prisma

- スキーマ定義の明確化とマイグレーション管理の容易さ。

### 主要テーブル概要

- **Users:** 認証情報、Stripe顧客ID
- **Products:** ユーザーが登録したプロダクト情報（URL, 説明）
- **ArticleClusters:** 生成AIが提案した「記事構成案」のまとまり
  - `status`: PENDING, GENERATING, COMPLETED
- **Articles:** 生成された記事データ
  - `content`: Markdown/HTML
  - `wp_post_id`: 連携先WordPressのID
  - `status`: DRAFT, PUBLISHED
- **Jobs:** 非同期処理の状態管理
  - `job_type`: GENERATE_ARTICLE, SYNC_WP, ANALYZE_PRODUCT

## 外部サービス連携

1.  **Stripe (Payment):** サブスクリプション管理
2.  **Auth (NextAuth):** Google Login, Email/Pass
3.  **Tavily API:** 情報収集・検索
4.  **OpenAI/Anthropic/Google:** LLM API

## ジョブキュー・非同期処理

**Infrastructure:** Redis (Upstash) or BullMQ on dedicated worker
**Worker:**

- Vercel Functionsでは限界がある場合、**Cloudflare Workers** または **Railway上のNode.js Worker** を検討。
- MVP段階では Vercel Cron Jobs + API Routes の組み合わせで、定期実行（Polling）モデルでコストを抑えるアプローチも可。
