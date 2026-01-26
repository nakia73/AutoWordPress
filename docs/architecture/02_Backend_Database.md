# 02. バックエンドAPI・データベースアーキテクチャ

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [コンセプト決定](../CONCEPT_DECISIONS.md)
> **実装フェーズ:** [Phase 2: Core AI](../phases/Phase2_CoreAI.md), [Phase 5: Monetization](../phases/Phase5_Monetization.md)

## バックエンド構成 (API)

**Technology:** Next.js API Routes (Serverless Functions)

- **理由:** フロントエンドと同一レポジトリで管理でき、型安全性（monorepo-like）が高い。MVP開発速度重視。
- **Job Processing:** 長時間実行処理（記事生成など）はServerless関数のタイムアウト（Vercel Pro: 300sなど）に引っかかるため、**非同期ジョブキュー**を必ず挟む設計とします。

**Language:** TypeScript / Node.js

## データベース設計 (Database)

**Engine:** PostgreSQL 16+
**Hosting:** **Supabase**（確定）

- Auth + DB + Storage の統合により開発効率最大化
- コネクションプーリング：Supabase組み込み（Supavisor）
- WordPress用：MariaDB（VPS上）- 2DB構成を許容

### MariaDB採用理由（WordPress用）

WordPress Multisite用のデータベースとしてMariaDBを採用する理由：

1. **WordPress公式推奨**: WordPressはMySQL/MariaDBを公式サポート。MariaDBはMySQLの完全互換フォーク
2. **パフォーマンス優位性**:
   - 改良されたクエリオプティマイザ
   - 効率的なストレージエンジン（Aria）
   - スレッドプール機能が標準搭載
3. **ライセンス・継続性**:
   - MySQLはOracle所有でライセンス懸念あり
   - MariaDBはGPL v2で永続的にオープンソース保証
   - MySQL創設者が主導する活発な開発コミュニティ
4. **業界標準**:
   - DigitalOcean、Linode等の主要VPSで標準採用
   - WordPressホスティング大手（WP Engine、Kinsta）もMariaDB採用

**注:** MySQLでも動作するが、VPS環境ではMariaDBがデファクトスタンダード。

**ORM:** Prisma

- スキーマ定義の明確化とマイグレーション管理の容易さ。
- マイグレーション失敗時：バックアップからリストア（手順書を事前作成）

### 主要テーブル概要

| テーブル | 説明 | 実装フェーズ |
|---------|------|-------------|
| Users | 認証情報、Stripe顧客ID、サブスク状態 | Phase 1, 5 |
| Sites | WordPressサイト情報 | Phase 1 |
| Products | プロダクト情報（URL, 分析結果） | Phase 2 |
| ArticleClusters | 記事構成案のまとまり | Phase 2 |
| Articles | 生成された記事データ | Phase 2 |
| Jobs | 非同期処理の状態管理（Inngest連携） | Phase 2 |
| **Schedules** | **自動生成スケジュール** | **Phase 4（MVP必須）** |
| GeneratedImages | AI生成画像履歴 | Phase 7 |
| CustomDomains | 独自ドメイン管理 | Phase 8 |
| SSOTokens | シームレスログイン用トークン | Phase 9 |

---

## 詳細スキーマ定義

### コアテーブル（MVP: Phase 2-4）

```sql
-- ユーザー
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  -- Stripe連携 (Phase 5)
  stripe_customer_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'trial',  -- trial, active, past_due, canceled
  subscription_id VARCHAR(255),
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WordPressサイト (Phase 1)
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE NOT NULL,          -- サブドメイン: xxx.argonote.app
  wp_admin_url VARCHAR(500),
  wp_api_token VARCHAR(500),                  -- AES-256-GCMで暗号化して保存
  status VARCHAR(50) DEFAULT 'provisioning',  -- provisioning, active, suspended
  created_at TIMESTAMP DEFAULT NOW()
);

-- プロダクト (Phase 2)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  url VARCHAR(500) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  analysis_result JSONB,                      -- ペルソナ、キーワード等
  -- 画像設定 (Phase 7)
  image_style VARCHAR(50) DEFAULT 'illustration',
  color_theme VARCHAR(50) DEFAULT 'auto',
  image_size VARCHAR(20) DEFAULT '1200x630',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 記事クラスター (Phase 2)
CREATE TABLE article_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  pillar_keyword VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',       -- pending, generating, completed
  created_at TIMESTAMP DEFAULT NOW()
);

-- 記事 (Phase 2)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID REFERENCES article_clusters(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,                               -- HTML/Markdown
  meta_description VARCHAR(160),
  article_type VARCHAR(50) DEFAULT 'article', -- article, faq, glossary
  status VARCHAR(50) DEFAULT 'draft',         -- draft, published, archived
  wp_post_id INTEGER,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ジョブキュー (Phase 2)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL,              -- ANALYZE_PRODUCT, GENERATE_ARTICLE, SYNC_WP
  payload JSONB,
  status VARCHAR(50) DEFAULT 'pending',       -- pending, processing, completed, failed
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 課金・決済（Phase 5）

```sql
-- 課金履歴
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255),
  amount INTEGER,                             -- 金額（最小単位: 円）
  currency VARCHAR(10) DEFAULT 'jpy',
  status VARCHAR(50),                         -- paid, failed, refunded
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 自動化機能（Phase 4 - MVP必須）

```sql
-- スケジュール設定
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  cron_expression VARCHAR(50),                -- "0 9 * * 1,3,5" (月水金9時)
  articles_per_run INTEGER DEFAULT 1,
  publish_mode VARCHAR(20) DEFAULT 'draft',   -- draft, publish
  is_active BOOLEAN DEFAULT true,
  next_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- スケジュール実行履歴
CREATE TABLE schedule_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  status VARCHAR(20),                         -- queued, running, completed, failed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  articles_generated INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 画像生成（Phase 7）

```sql
-- 生成画像履歴
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  prompt TEXT,
  image_url VARCHAR(500),
  storage_path VARCHAR(500),                  -- S3/R2のパス
  generation_time_ms INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 独自ドメイン（Phase 8）

```sql
-- カスタムドメイン管理
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  domain VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',       -- pending, verifying, active, error
  ssl_status VARCHAR(50) DEFAULT 'none',      -- none, issuing, active, expired
  verification_token VARCHAR(100),
  ssl_expires_at TIMESTAMP,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### SSO（Phase 9）

```sql
-- SSOトークン管理
CREATE TABLE sso_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(100) UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id),
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sso_tokens_expires ON sso_tokens(expires_at);
```

---

## ステータス値一覧

| テーブル | カラム | 値 |
|---------|--------|-----|
| users | subscription_status | trial, active, past_due, canceled |
| sites | status | provisioning, active, suspended |
| article_clusters | status | pending, generating, completed |
| articles | status | draft, published, archived |
| jobs | status | pending, processing, completed, failed |
| custom_domains | status | pending, verifying, active, error |
| custom_domains | ssl_status | none, issuing, active, expired |

## 外部サービス連携

1.  **Stripe (Payment):** サブスクリプション管理
2.  **Supabase Auth:** Google OAuth, Email/Pass
3.  **Tavily API:** 情報収集・検索・競合調査 → **必ずLLMで解釈するフロー**
4.  **Firecrawl + Jina Reader:** スクレイピング（フォールバック対応）
5.  **Gemini 3.0 Pro:** LLM（LiteLLMプロキシ経由）※ソフトコーディング

**重要:**
- LLMモデルはハードコード禁止。環境変数で切り替え可能な設計とする。
- フォールバックは設けない。エラー時はユーザーに表示し、別モデル選択を促す（Phase 12）。

## ジョブキュー・非同期処理

**Infrastructure:** **Inngest**（確定）

**選定理由:**
- 長時間実行に対応（Vercel 300秒制限を回避）
- ステップ単位での実行（途中失敗時の再開が容易）
- 自動リトライ機能が組み込み
- Vercelと公式統合
- 無料枠：25,000ステップ/月

**リトライ設定:**
- タイムアウト：10分/記事
- リトライ回数：最大3回
- リトライ間隔：指数バックオフ（1分→5分→15分）
- 最終失敗時：メール通知 + ダッシュボード表示
