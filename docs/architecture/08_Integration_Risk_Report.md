# Argo Note - モジュール間統合リスクレポート

> **目的:** 単体テスト→結合テストのフローで発生しうる不整合リスクの特定と対応方針
> **作成日:** 2026年1月26日
> **ステータス:** 要対応（実装前に解決必須）

---

## 概要

本ドキュメントは、アーキテクチャドキュメント（00〜07）を詳細に分析し、モジュール間の依存関係と結合点での不整合リスクを特定したものです。

### リスクサマリー

| カテゴリ | 高リスク | 中リスク | 合計 |
|---------|---------|---------|------|
| インターフェース定義 | 3件 | - | 3件 |
| 責任分界点 | 2件 | - | 2件 |
| エラーハンドリング | 2件 | - | 2件 |
| データフロー | - | 3件 | 3件 |
| 状態管理 | - | 3件 | 3件 |
| スキーマ矛盾 | - | 4件 | 4件 |
| **合計** | **7件** | **10件** | **17件** |

---

## 高リスク項目（実装前に解決必須）

### IR-001: `products.analysis_result` (JSONB) のスキーマ未定義

**問題箇所:** `02_Backend_Database.md:110`

```sql
analysis_result JSONB,  -- ペルソナ、キーワード等
```

**影響:**
- Phase A〜E の各処理出力構造が不明確
- フロントエンド開発者が型推測で実装 → Runtime エラー
- 単体テスト作成不可能（期待値が定義できない）

**対応方針:**
```typescript
type ProductAnalysisResult = {
  phaseA: {
    product_summary: string;
    target_audience: string;
    value_proposition: string;
  };
  phaseB: {
    purchase_funnel: {
      awareness: string[];
      interest: string[];
      consideration: string[];
      decision: string[];
    };
  };
  phaseC: {
    keywords: Array<{
      keyword: string;
      search_volume: number;
      difficulty: number;
      intent: 'informational' | 'transactional' | 'navigational';
    }>;
  };
  phaseD: {
    competitors: Array<{
      url: string;
      title: string;
      strengths: string[];
      gaps: string[];
    }>;
  };
  phaseE: {
    clusters: Array<{
      pillar_topic: string;
      articles: Array<{
        title: string;
        target_keyword: string;
        priority: number;
      }>;
    }>;
  };
};
```

**対応期限:** Phase 2 開始前

---

### IR-002: `jobs.payload` (JSONB) の型定義なし

**問題箇所:** `02_Backend_Database.md:141-154`

```sql
payload JSONB,
job_type VARCHAR(50),  -- ANALYZE_PRODUCT, GENERATE_ARTICLE, SYNC_WP
```

**問題:**
- 各 `job_type` に対応する `payload` 構造が未定義
- API と Inngest Worker 間でキー名不一致が発生するリスク

**対応方針:**
```typescript
// types/jobs.ts
export type JobPayload =
  | { type: 'ANALYZE_PRODUCT'; data: AnalyzeProductPayload }
  | { type: 'GENERATE_ARTICLE'; data: GenerateArticlePayload }
  | { type: 'SYNC_WP'; data: SyncWordPressPayload }
  | { type: 'PROVISION_BLOG'; data: ProvisionBlogPayload };

export type AnalyzeProductPayload = {
  product_id: string;
  mode: 'url' | 'interactive' | 'research';
  url?: string;
  answers?: Record<string, string>;
  keywords?: string[];
};

export type GenerateArticlePayload = {
  article_id: string;
  product_id: string;
  target_keyword: string;
  cluster_id?: string;
};

export type SyncWordPressPayload = {
  article_id: string;
  site_id: string;
  action: 'create' | 'update' | 'delete';
};

export type ProvisionBlogPayload = {
  site_id: string;
  user_id: string;
  subdomain: string;
  theme: string;
};
```

**対応期限:** Phase 1 開始前

---

### IR-003: Tavily API レスポンス → LLM 入力のマッピング未定義

**問題箇所:** `04_AI_Pipeline.md:100-112`, `05_Sequence_Diagrams.md:129-131`

**現状の記述:**
- 「生データをLLMで解釈」とだけ記述
- 具体的なJSON構造、プロンプトテンプレートへの渡し方が不明

**影響:**
- 外部API変更時の影響範囲が特定不可
- モック作成不可能（テスト困難）

**対応方針:**
```typescript
// types/external-apis.ts
export type TavilySearchResponse = {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
  query: string;
  response_time: number;
};

export type TavilyToLLMInput = {
  search_query: string;
  top_results: Array<{
    title: string;
    url: string;
    summary: string;  // content を要約
  }>;
  analysis_prompt: string;
};
```

**対応期限:** Phase 2 開始前

---

### IR-004: API Route ↔ Inngest の同期/非同期判定基準なし

**問題箇所:** `02_Backend_Database.md:9-12`, `04_AI_Pipeline.md:195`

**現状:**
- 「非同期ジョブキューを挟む」とあるが、どの処理を同期で行い、どこから非同期に委譲するか不明確

**対応方針:**

| エンドポイント | 同期処理 | 非同期委譲（Inngest） |
|---------------|---------|---------------------|
| `POST /api/products` | DB保存、バリデーション | プロダクト分析（Phase A-E） |
| `POST /api/sites` | DB保存、ステータス初期化 | WordPress構築、DNS設定 |
| `POST /api/articles/generate` | DB保存（draft状態） | 記事生成、WordPress同期 |
| `POST /api/schedules` | DB保存、Inngest登録 | - |
| `PUT /api/articles/:id/publish` | ステータス更新 | WordPress同期 |

**対応期限:** Phase 1 開始前

---

### IR-005: Provisioner の定義なし

**問題箇所:** `05_Sequence_Diagrams.md:79-86`

```
Provisioner->>Inngest: Job取得
Provisioner->>VPS: WP-CLI実行
```

**問題:**
- 「Provisioner」が何か（サービス？関数？）未定義
- SSH認証情報の管理責任が不明

**対応方針:**

```
Provisioner = Inngest Function（サーバーレス関数）

実装場所: /src/inngest/functions/provision-blog.ts

SSH認証情報管理:
- 環境変数: VPS_SSH_PRIVATE_KEY（Base64エンコード）
- Vercel Secrets で管理
- 実行時にメモリ上で復号化、ディスク書き込み禁止
```

**対応期限:** Phase 1 開始前

---

### IR-006: エラー発生時のUI/通知フロー未定義

**問題箇所:** `02_Backend_Database.md:378-384`, `04_AI_Pipeline.md:258-264`

**現状の矛盾:**
```
ドキュメントA: 「最終失敗時：メール通知 + ダッシュボード表示」
ドキュメントB: 「別モデル選択UIを表示（Phase 12で実装）」
```

**問題:**
- MVP〜Phase 11 の間、エラー時のUIが存在しない
- Inngest内エラー → API → フロントエンドへの伝播経路が未定義

**対応方針:**

| エラー種別 | HTTP Status | ユーザーへの表示 | 対応アクション | リトライ |
|-----------|-------------|-----------------|---------------|---------|
| LLM Timeout | 504 | 「処理中です。しばらくお待ちください」 | 待機 | Inngest自動（3回） |
| LLM Rate Limit | 429 | 「混雑しています。数分後に再試行します」 | 待機 | Inngest自動（3回） |
| Invalid Token | 401 | 「認証情報の再設定が必要です」 | トークン更新画面へ | 手動 |
| WordPress Error | 502 | 「ブログへの接続に失敗しました」 | サポート連絡 | 手動 |
| Unknown Error | 500 | 「エラーが発生しました。再試行してください」 | 手動再試行 | 手動 |

**MVP必須機能:**
- ダッシュボードにジョブ実行状況一覧
- 失敗したジョブの詳細表示
- 手動再実行ボタン

**対応期限:** Phase 3 完了前

---

### IR-007: WordPress API エラー時の処理未定義

**問題箇所:** `05_Sequence_Diagrams.md:150`

**未定義のケース:**
- `wp_api_token` 無効化時の検知・通知メカニズム
- HTTP 403/500 時のリトライ vs ユーザー通知の判断基準

**対応方針:**

```typescript
// WordPress API エラーハンドリング
const wpErrorHandler = {
  401: {
    action: 'notify_user',
    message: 'WordPress認証が無効です。再接続してください。',
    retry: false,
    updateSiteStatus: 'auth_required'
  },
  403: {
    action: 'notify_user',
    message: 'WordPress権限が不足しています。',
    retry: false,
    updateSiteStatus: 'permission_error'
  },
  500: {
    action: 'retry_with_backoff',
    maxRetries: 3,
    backoffMs: [60000, 300000, 900000],  // 1分, 5分, 15分
    finalAction: 'notify_user'
  },
  502: {
    action: 'retry_with_backoff',
    maxRetries: 5,
    backoffMs: [30000, 60000, 120000, 300000, 600000],
    finalAction: 'notify_user'
  }
};
```

**対応期限:** Phase 2 完了前

---

## 中リスク項目（Phase 6 前に解決推奨）

### IR-008: `articles.content` の形式未確定

**問題箇所:** `02_Backend_Database.md:131`

```sql
content TEXT,  -- HTML/Markdown
```

**対応方針:**
- DB保存形式: **HTML**（WordPress REST API との整合性）
- 生成時: Markdown → HTML 変換（marked.js 使用）
- 編集UI: Markdown エディタ（変換は保存時）

---

### IR-009: `jobs` と `article_generation_logs` の責務重複

**問題箇所:** `02_Backend_Database.md:142-154`, `02_Backend_Database.md:297-310`

**対応方針:**
```
jobs テーブル:
  - 責務: 非同期ジョブの実行状態管理
  - 用途: リトライ制御、キュー管理

article_generation_logs テーブル:
  - 責務: AI生成トレーサビリティ
  - 用途: Phase 15 効果分析、コスト追跡

関連付け:
  ALTER TABLE article_generation_logs
  ADD COLUMN job_id UUID REFERENCES jobs(id);
```

---

### IR-010: `schedule_jobs` → `jobs` の外部キーなし

**問題箇所:** `02_Backend_Database.md:189-199`

**対応方針:**
```sql
ALTER TABLE schedule_jobs
ADD COLUMN job_id UUID REFERENCES jobs(id);
```

---

### IR-011: `articles` に `generating` 状態がない

**問題箇所:** `02_Backend_Database.md:134`

**対応方針:**
```sql
-- 状態遷移の拡張
status VARCHAR(50) DEFAULT 'draft'
-- draft → generating → review → published → archived
--              ↓
--           failed
```

---

### IR-012: `sites` のプロビジョニング失敗状態がない

**問題箇所:** `02_Backend_Database.md:91-100`

**対応方針:**
```sql
-- 状態遷移の拡張
status VARCHAR(50) DEFAULT 'pending'
-- pending → provisioning → active → suspended → deleted
--                ↓
--          provision_failed
```

---

### IR-013: `schedule_jobs` の部分的失敗の記録方法未定義

**対応方針:**
```sql
ALTER TABLE schedule_jobs
ADD COLUMN generation_details JSONB;

-- 例
{
  "requested": 3,
  "completed": 1,
  "skipped": 1,
  "failed": 1,
  "details": [
    {"article_id": "xxx", "status": "completed"},
    {"article_id": null, "status": "skipped", "reason": "keyword_duplicate"},
    {"article_id": "yyy", "status": "failed", "error": "LLM Timeout"}
  ]
}
```

---

### IR-014: LLM設定：環境変数 vs DB の移行戦略なし

**問題箇所:** `02_Backend_Database.md:362-366`, `04_AI_Pipeline.md:251-256`

**対応方針:**
```
Phase 1-11: 環境変数（LLM_MODEL）
Phase 12:
  1. users テーブルに preferred_llm_model カラム追加
  2. API層で優先順位判定:
     user.preferred_llm_model || process.env.LLM_MODEL
```

---

### IR-015: Promptテンプレート：Git管理 → DB管理の移行戦略なし

**問題箇所:** `02_Backend_Database.md:281-295`, `04_AI_Pipeline.md:286-287`

**対応方針:**
```
Phase 0-2: config/prompts/*.yaml (Git管理)
Phase 3:   prompt_templates テーブル導入（読み取り専用、初期データはyamlからインポート）
Phase 15:  prompt_templates テーブル完全移行（UI編集可能）
           Langfuse連携でA/Bテスト実施
```

---

### IR-016: `articles` に `target_keyword` がない

**問題箇所:** `02_Backend_Database.md:127-139`

**対応方針:**
```sql
ALTER TABLE articles ADD COLUMN target_keyword VARCHAR(255);
ALTER TABLE articles ADD COLUMN search_intent VARCHAR(50);
ALTER TABLE articles ADD COLUMN cluster_id UUID REFERENCES article_clusters(id);
```

---

### IR-017: Subscription状態の同期メカニズム未定義

**問題箇所:** `02_Backend_Database.md:75-89`, `02_Backend_Database.md:160-169`

**対応方針:**
```
リアルタイム同期（Stripe Webhook）:
  - customer.subscription.updated → users.subscription_status 更新
  - invoice.paid → billing_history レコード作成
  - invoice.payment_failed → billing_history レコード作成

日次整合性チェック（Nightly Job）:
  - Stripe API から全アクティブサブスク取得
  - users テーブルとの差分を検出
  - 不整合があれば Slack 通知 + 自動修正
```

---

## 実装前チェックリスト

### 開発開始前（必須）

- [ ] TypeScript 型定義ファイル作成
  - [ ] `types/jobs.ts`
  - [ ] `types/products.ts`
  - [ ] `types/articles.ts`
  - [ ] `types/external-apis.ts`
- [ ] OpenAPI 仕様書作成（全エンドポイント）
- [ ] Error Handling Spec 確定
- [ ] 状態遷移図作成（Site, Article, Job）

### Phase 1 完了前

- [ ] IR-002 対応完了（jobs payload スキーマ）
- [ ] IR-004 対応完了（同期/非同期判定基準）
- [ ] IR-005 対応完了（Provisioner 定義）

### Phase 2 完了前

- [ ] IR-001 対応完了（analysis_result スキーマ）
- [ ] IR-003 対応完了（外部API マッピング）
- [ ] IR-007 対応完了（WordPress エラーハンドリング）

### Phase 3 完了前

- [ ] IR-006 対応完了（エラーUI）
- [ ] IR-011 対応完了（article 状態遷移）

### Phase 6 前

- [ ] IR-008〜IR-017 対応完了

---

---

# Part 2: 微視的不整合分析（詳細版）

> **追記日:** 2026年1月26日
> **分析観点:** 15項目 × 全ドキュメント精査
> **発見件数:** 28件の不整合

---

## 1. 数値の不整合

### IR-018: リトライ間隔の矛盾

| ドキュメント | リトライ間隔 | 対象処理 | 行番号 |
|------------|------------|---------|--------|
| `02_Backend_Database.md` | 1分→5分→15分 | 記事生成全般 | 382 |
| `04_AI_Pipeline.md` | 1分→5分→15分 | 記事生成全般 | 281 |
| `CONCEPT_DECISIONS.md` | 1分→5分→15分 | 記事生成 | 1016 |
| **`CONCEPT_DECISIONS.md`** | **1分→5分→30分** | **WordPress投稿失敗時** | **1038** |

**問題:**
- WordPress投稿失敗時のみ最終間隔が30分（他は15分）
- 実装時にどの間隔を採用すべきか不明確

**対応方針:** リトライ間隔を統一（1分→5分→15分）

**対応期限:** Phase 1 開始前

---

### IR-019: タイムアウト値の矛盾

| ドキュメント | 値 | 対象 |
|------------|-----|------|
| `04_AI_Pipeline.md:254` | 30秒 | LLM_TIMEOUT_SECONDS |
| `02_Backend_Database.md:380` | 10分/記事 | 記事生成タイムアウト |

**問題:**
- LLMタイムアウト30秒 vs 記事生成全体10分の関係が不明
- 1記事生成で何回LLM呼び出しが発生するか未定義

**対応方針:**
```
LLM単一呼び出し: 30秒
記事生成全体（複数LLM呼び出し含む）: 10分
→ 1記事あたり最大20回のLLM呼び出しを想定
```

---

## 2. 命名規則の不統一

### IR-020: ステータスカラム命名の不統一

| テーブル | カラム名 | 問題 |
|---------|---------|------|
| users | `subscription_status` | プレフィックス付き |
| sites | `status` | プレフィックスなし |
| articles | `status` | プレフィックスなし |
| jobs | `status` | プレフィックスなし |

**対応方針:** 全て `status` に統一（users テーブルのみ例外として許容）

---

### IR-021: イベント/ジョブ名の不統一

| 呼称 | ドキュメント | ケース |
|------|------------|--------|
| `WRITE_ARTICLE` | `04_AI_Pipeline.md:119` | SCREAMING_SNAKE |
| `GENERATE_ARTICLE` | `02_Backend_Database.md:144` | SCREAMING_SNAKE |
| `generate-for-${user.id}` | `Phase4_Automation.md:92` | kebab-case |

**問題:** 同じ「記事生成」処理が3種類の名称で呼ばれている

**対応方針:**
```
job_type (DB): SCREAMING_SNAKE_CASE（GENERATE_ARTICLE）
Inngest event: kebab-case（article/generate）
関数名: camelCase（generateArticle）
```

---

### IR-022: タイムスタンプカラム名の不統一

| パターン | 例 |
|---------|-----|
| 標準 | `created_at`, `updated_at` |
| 非標準 | `collected_at`, `calculated_at`, `published_at` |

**対応方針:**
- 作成/更新: `created_at`, `updated_at`
- ドメイン固有: `published_at`, `collected_at` は許容

---

## 3. ENUMの不一致

### IR-023: `articles.status` の値の矛盾

**現在の定義（02_Backend_Database.md:135）:**
```sql
status VARCHAR(50) DEFAULT 'draft'  -- draft, published, archived
```

**必要な値:**
```
draft, generating, review, published, archived, failed
```

**欠落:** `generating`, `review`, `failed`

**影響:**
- Phase 2 実装時にユーザーが記事生成中かどうか判定不可
- UI層が生成進捗を表示できない

**対応期限:** Phase 2 開始前

---

### IR-024: `schedule_jobs.status` の不一致

| ドキュメント | 定義値 |
|------------|-------|
| `02_Backend_Database.md:193` | queued, running, completed, failed |
| 本レポート IR-013 | pending, running, completed, failed |

**問題:** `queued` vs `pending` の不統一

**対応方針:** `pending` に統一（Inngest との整合性）

---

### IR-025: `sites.status` の欠落値

**現在:**
```
provisioning, active, suspended
```

**必要:**
```
pending, provisioning, provision_failed, active, suspended, deleted
```

**欠落:** `pending`, `provision_failed`, `deleted`

---

### IR-026: VARCHAR サイズの不統一

| テーブル | 型 |
|---------|-----|
| users.subscription_status | VARCHAR(50) |
| sites.status | VARCHAR(50) |
| schedule_jobs.status | **VARCHAR(20)** |
| ab_tests.status | **VARCHAR(20)** |

**問題:** VARCHAR(20) では `provision_failed`（16文字）が入らない可能性

**対応方針:** 全て VARCHAR(50) に統一

---

## 4. 外部キー参照の欠落

### IR-027: `products.site_id` の ON DELETE 未指定

**現在（02_Backend_Database.md:106）:**
```sql
site_id UUID REFERENCES sites(id),  -- ON DELETE 指定なし
```

**問題:** サイト削除時の動作が不定

**対応方針:**
```sql
site_id UUID REFERENCES sites(id) ON DELETE SET NULL
```

---

### IR-028: `article_generation_logs` → `jobs` の外部キー欠落

**問題:** ジョブの実行ログがどの非同期ジョブに対応するか不明

**対応方針:**
```sql
ALTER TABLE article_generation_logs
ADD COLUMN job_id UUID REFERENCES jobs(id);
```

---

## 5. セキュリティ要件の欠落

### IR-029: WordPress API トークン暗号化の詳細不足

**現在の記述:**
```sql
wp_api_token VARCHAR(500),  -- AES-256-GCMで暗号化して保存
```

**欠落項目:**
- 暗号化キー管理方法（KMS vs 環境変数）
- キーローテーション方針
- トークン有効期限管理
- トークン無効化方法

**対応方針:**
```
暗号化キー: AWS KMS または Vercel Environment Variables
キーローテーション: 90日ごと
有効期限: WordPress Application Password は無期限
無効化: ダッシュボードから手動、またはサイト削除時自動
```

---

### IR-030: Tavily API キーの管理方法が未定義

**欠落項目:**
- Tavily API キーの保存位置
- 暗号化方法
- レート制限時の処理
- API キー漏洩時の対応

**対応方針:**
```
保存: Vercel Environment Variables（TAVILY_API_KEY）
暗号化: Vercel側で自動暗号化
レート制限: 429エラー時は指数バックオフでリトライ
漏洩時: 即座にキー再発行、環境変数更新
```

---

### IR-031: SSO トークン有効期限の未定義

**現在:**
```sql
expires_at TIMESTAMP
```

**欠落:** デフォルト有効期限が未定義

**対応方針:**
```
デフォルト有効期限: 5分
トークン再利用: 禁止（used = true で無効化）
IP制限: 発行時のIPと同一である必要あり（オプション）
```

---

## 6. データ型の不一致

### IR-032: `billing_history.amount` の型

**現在（02_Backend_Database.md:165）:**
```sql
amount INTEGER,  -- 金額（最小単位: 円）
```

**問題:** Stripe はセント単位で金額を扱う

**対応方針:**
```sql
amount_cents INTEGER,  -- Stripe の最小単位
currency VARCHAR(3) DEFAULT 'jpy'
```

---

### IR-033: `temperature` の有効範囲未定義

**現在:**
```sql
temperature DECIMAL(3,2)
```

**問題:** 0.0〜2.0 の範囲制約がない

**対応方針:**
```sql
temperature DECIMAL(3,2) CHECK (temperature >= 0 AND temperature <= 2)
```

---

## 7. NULL許容の不整合

### IR-034: `products.site_id` の NOT NULL 定義が曖昧

**現在:**
```sql
site_id UUID REFERENCES sites(id),
-- NOT NULL 制約なし
```

**問題:** プロダクト作成時に site_id が必須か不明

**対応方針:**
```sql
site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE
-- プロダクトは必ずサイトに紐付く
```

---

### IR-035: `articles.wp_post_id` の NULL許容ルール

**問題:** どの状態で NULL が許容されるか未定義

**対応方針:**
```
draft, generating, review, failed: NULL 許容
published: NOT NULL 必須（CHECK制約は実装困難なためアプリ層で制御）
```

---

## 8. バリデーションルールの欠落

### IR-036: VARCHAR カラムの形式制約不定義

| カラム | 必要な制約 |
|--------|----------|
| email | RFC 5322 準拠 |
| slug | `^[a-z0-9-]+$`（英小文字・数字・ハイフンのみ） |
| url | URL形式（https://で始まる） |
| meta_description | 最大160文字 |

**対応方針:** API層でZodスキーマによるバリデーション

---

### IR-037: `cron_expression` のバリデーション不足

**欠落:**
- Cron式フォーマット検証ロジック
- タイムゾーン指定方法
- 無効な式のエラーメッセージ

**対応方針:**
```typescript
import { parseExpression } from 'cron-parser';

function validateCron(expression: string): boolean {
  try {
    parseExpression(expression, { tz: 'Asia/Tokyo' });
    return true;
  } catch {
    return false;
  }
}
```

---

## 9. キャッシュ戦略の欠落

### IR-038: Redis Object Cache の必須化タイミング不明

| フェーズ | 記述 |
|---------|------|
| Phase 1 | オプション |
| Phase 2 | 必須化 |

**問題:** 必須化のトリガー（ユーザー数? レスポンス時間?）が未定義

**対応方針:**
```
必須化条件:
- アクティブユーザー50以上、または
- WordPress管理画面の平均レスポンス > 3秒
```

---

### IR-039: CDN キャッシュ戦略の未定義

**欠落:**
- キャッシュ対象
- TTL設定
- キャッシュパージ方法

**対応方針:**
```
静的ファイル（JS/CSS/画像）: TTL 1年、immutable
HTML: キャッシュなし（動的コンテンツ）
API レスポンス: キャッシュなし
パージ: Cloudflare API経由でデプロイ時に実行
```

---

### IR-040: TanStack Query のキャッシュ設定未定義

**欠落:** staleTime, cacheTime のデフォルト値

**対応方針:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5分
      cacheTime: 1000 * 60 * 30, // 30分
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 10. レート制限の未定義

### IR-041: API レート制限の統一がない

| コンポーネント | 制限 |
|--------------|------|
| SSO トークン生成 | 1分間に5回 |
| スケジュール実行 | **未定義** |
| Tavily API | **未定義** |
| LLM API | **未定義** |

**対応方針:**
```
グローバルAPI: 100リクエスト/分/ユーザー
記事生成: 10リクエスト/時/ユーザー
プロダクト分析: 5リクエスト/時/ユーザー
外部API（Tavily等）: アプリ全体で60リクエスト/分
```

---

### IR-042: Inngest ステップ上限との整合性

**Inngest無料枠:** 25,000ステップ/月

**未定義:**
- 1記事生成あたりのステップ数
- 1ユーザーあたりの月間生成可能記事数

**対応方針:**
```
1記事生成: 約10ステップ（分析2 + 生成3 + 投稿2 + 通知3）
25,000 / 10 = 2,500記事/月
100ユーザー想定: 25記事/月/ユーザー
```

---

## 11. ログ・監査証跡の欠落

### IR-043: ユーザー操作ログテーブル欠落

**欠落:** ダッシュボードでのアクション（記事削除、スケジュール変更など）のログ

**対応方針:**
```sql
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,  -- 'article.delete', 'schedule.update'
  target_type VARCHAR(50),       -- 'article', 'schedule', 'site'
  target_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### IR-044: 削除ログの欠落

**問題:** hard delete 前の記録がない

**対応方針:**
```sql
CREATE TABLE deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  deleted_by UUID REFERENCES users(id),
  reason VARCHAR(255),
  backup_data JSONB,  -- 削除前のレコード全体
  deleted_at TIMESTAMP DEFAULT NOW()
);
```

---

### IR-045: Stripe Webhook のログ記録不足

**欠落:**
- webhook_signature 検証のログ
- 重複処理検知ログ（idempotency key）

**対応方針:**
```sql
CREATE TABLE stripe_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(100) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  signature_valid BOOLEAN,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 12. フェーズ間の依存関係矛盾

### IR-046: Phase 15 の前提条件の曖昧性

**現在:**
```
前提フェーズ: Phase 10（GSC連携）
```

**問題:** 「十分なデータ蓄積」の定義がない

**対応方針:**
```
Phase 15 開始条件:
- GSC連携完了後 30日以上経過
- 記事生成ログ 100件以上
- GSCデータ取得成功率 95%以上
```

---

## 優先度別修正項目サマリー

### 🔴 高優先度（実装前に必須）

| ID | 問題 | 対応期限 |
|----|------|---------|
| IR-018 | リトライ間隔統一 | Phase 1 開始前 |
| IR-023 | articles.status 値追加 | Phase 2 開始前 |
| IR-026 | VARCHAR サイズ統一 | DB初期化前 |
| IR-029 | トークン暗号化詳細 | Phase 1 開始前 |
| IR-030 | Tavily APIキー管理 | Phase 2 開始前 |
| IR-034 | products.site_id NOT NULL | Phase 1 開始前 |
| IR-041 | APIレート制限定義 | Phase 3 開始前 |

### 🟡 中優先度（Phase 6 前に推奨）

| ID | 問題 | 対応期限 |
|----|------|---------|
| IR-020〜022 | 命名規則統一 | Phase 2 開始前 |
| IR-024〜025 | ENUM値統一 | Phase 2 開始前 |
| IR-027〜028 | 外部キー追加 | Phase 2 開始前 |
| IR-032〜033 | データ型修正 | Phase 5 開始前 |
| IR-036〜037 | バリデーション追加 | Phase 3 開始前 |
| IR-038〜040 | キャッシュ戦略定義 | Phase 2 開始前 |
| IR-043〜045 | ログテーブル追加 | Phase 3 開始前 |

---

## 実装前チェックリスト（追加分）

### DB スキーマ確定前

- [ ] IR-023: articles.status に generating, review, failed 追加
- [ ] IR-024: schedule_jobs.status を pending に統一
- [ ] IR-025: sites.status に pending, provision_failed, deleted 追加
- [ ] IR-026: 全 status カラムを VARCHAR(50) に統一
- [ ] IR-027: products.site_id に ON DELETE SET NULL 追加
- [ ] IR-032: billing_history.amount を amount_cents に変更
- [ ] IR-033: temperature に CHECK 制約追加
- [ ] IR-034: products.site_id に NOT NULL 追加
- [ ] IR-043: user_activity_logs テーブル作成
- [ ] IR-044: deletion_logs テーブル作成
- [ ] IR-045: stripe_webhook_logs テーブル作成

### 環境変数・設定確定前

- [ ] IR-018: リトライ間隔を 1分→5分→15分 に統一
- [ ] IR-019: タイムアウト値の関係を明確化
- [ ] IR-029: 暗号化キー管理方法を決定
- [ ] IR-030: Tavily APIキー管理方法を決定
- [ ] IR-031: SSOトークン有効期限を5分に設定

### API 実装前

- [ ] IR-036: Zodスキーマによるバリデーション実装
- [ ] IR-037: cron-parser によるCron式検証実装
- [ ] IR-041: レート制限ミドルウェア実装

---

---

# Part 3: マクロ視点整合性分析（思想→実装のブレイクダウン検証）

> **追記日:** 2026年1月26日
> **分析観点:** ビジョン・思想から各フェーズ・モジュールへの整合性検証
> **検証範囲:** CONCEPT_DECISIONS.md、全フェーズドキュメント、全アーキテクチャドキュメント

---

## 総合整合性評価

| 観点 | 整合度 | 評価 |
|------|--------|------|
| ビジョン・ミッション | ✅ 高度 | サービスコンセプト一貫、ターゲット明確 |
| ビジネスモデル | ✅ 整合 | 価格＝予算＝技術選定が三角形で成立 |
| 技術思想 | ✅ 一貫 | 過剰設計回避、ソフトコーディング方針 |
| フェーズ設計 | ⚠️ 雄心的 | 論理的だが実装時間が楽観的 |
| UX設計 | ✅ 一貫 | 認知負荷軽減方針が全体で反映 |
| リスク対策 | ✅ 充実 | Multisite リスク認識と対策が詳細 |
| 競合優位性 | ✅ 明確 | パッケージング軸が機能設計に反映 |
| 期待値管理 | ✅ 適切 | SEO保証なし明記、段階的品質向上 |

---

## 1. ビジョン・ミッションの整合性

### MA-001: サービスコンセプトの一貫性

**検証結果:** ✅ 高度に整合

全ドキュメントで統一されたコンセプト：
```
"Your AI-Powered Blog. Fully Automated."
```

| ドキュメント | 行番号 | 記述 |
|------------|--------|------|
| README.md | 3-4 | 同一 |
| DEVELOPMENT_ROADMAP.md | 3-4 | 同一 |
| CONCEPT_DECISIONS.md | 3 | 同一 |
| 00_Master_Architecture.md | 10 | 同一 |

---

### MA-002: ターゲットユーザー定義の整合性

**検証結果:** ✅ 完全整合

**バイブコーダーの特徴（CONCEPT_DECISIONS.md B1-B2）:**
- 知識がない（SEOやブログ）
- 時間がない（開発で手一杯）
- 興味がない（マーケティングより開発に集中）

この定義は全フェーズのUX設計（認知負荷軽減など）に反映されている。

---

### MA-003: 「放置OK」訴求と機能設計の整合性

**検証結果:** ✅ 改善実施済み

**改善履歴:**
- 初期: 自動化がMVPに含まれるか曖昧
- 改善後: Phase 4（Automation）を **MVP必須機能** として位置づけ

**対応文書:** Phase4_Automation.md Line 11

---

## 2. ビジネスモデルとの整合性

### MA-004: 価格設定と提供機能のバランス

**検証結果:** ✅ 戦略的整合

**価格戦略（CONCEPT_DECISIONS.md D1）:**
- 初期: $20/月
- 成長期: $30/月
- 戦略: 「利益度外視でバイラル優先」→「回収フェーズを明確に分ける」

**MVP機能との対応:**

| MVP機能 | 価格帯対応 |
|--------|----------|
| WordPress自動セットアップ | ✅ 基本機能 |
| AI記事生成（毎日1記事） | ✅ 基本機能 |
| スケジュール自動化 | ✅ 基本機能（MVP必須） |
| 下書き・公開管理 | ✅ 基本機能 |

---

### MA-005: MVP予算（$100/月）と技術選定の整合性

**検証結果:** ✅ 厳格に整合

**予算配分（CONCEPT_DECISIONS.md I2）:**

| 項目 | コスト |
|------|--------|
| VPS (DigitalOcean) | $24/月 |
| ドメイン | $1/月 |
| Vercel, Supabase, Inngest | 無料枠 |
| 予備 | $75/月 |

**技術選定との整合:**
- 単一VPS（100サイトまで）→ コスト最小化
- Supabase無料枠（50,000 MAU）で十分なMVP規模
- Inngest無料枠（25,000ステップ/月）→ MVP自動化に十分

---

## 3. 技術思想の一貫性

### MA-006: 「過剰設計の回避」方針と実装複雑度

**検証結果:** ✅ 方針と実装が整合

**方針（DEVELOPMENT_ROADMAP.md Line 81-83）:**
- 「過剰設計の回避」
- 「将来の仮定ではなく、現在の課題を解決」

**実装への反映:**
- Phase 0-6は「必須機能」に絞込
- Phase 7-15は「拡張機能」として後付け
- Headless化（Phase 11）は「必要になったら検討」

---

### MA-007: WordPress Multisite選択の妥当性

**検証結果:** ✅ 戦略的に最適

**選択の根拠（CONCEPT_DECISIONS.md A2 & E0）:**
1. 資産性・可搬性の確保（標準XMLエクスポートで他社移管容易）
2. Exit Strategy（ユーザーロックインを避ける）
3. 単一VPSで100サイト管理可能（コスト効率）

**全フェーズへの影響:**
- Phase 1: VPS + Multisite構築が基盤
- Phase 2-3: Multisite前提でAPI設計
- Phase 6以降: 複数サイト運用前提で監視・バックアップ設計

---

### MA-008: 「ソフトコーディング」方針の徹底度

**検証結果:** ✅ 設計段階で徹底

**方針（CONCEPT_DECISIONS.md E6）:**
- 「ハードコード禁止、環境変数でモデル切り替え可能」

**実装への反映:**
- Phase 2_CoreAI.md: LiteLLMプロキシ経由での実装明記
- 00_Master_Architecture.md: 同方針強調

**懸念:** 実装コードがないため、実装段階での検証が必要

---

## 4. フェーズ設計の論理的整合性

### MA-009: MVP（Phase 0-6）のスコープと「1ヶ月」期限の現実性

**検証結果:** ⚠️ 雄心的だが実現可能性に懸念

**フェーズ構成:**
```
Week 1前半: Phase 0 (Mockup) + Phase 0.5 (MVP Branding)
Week 1:     Phase 1 (Infrastructure + Auth)
Week 2:     Phase 2 (Core AI)
Week 3:     Phase 3 (UI) + Phase 4 (Automation)
Week 4:     Phase 5 (Monetization) + Phase 6 (MVP Launch)
```

**複雑度評価:**

| Phase | 実装項目 | 複雑度 |
|-------|---------|--------|
| 0 | Mockup動画作成 | 低 |
| 0.5 | ロゴ・アイコン作成 | 低 |
| 1 | VPS構築、Multisite、認証 | **高** |
| 2 | AI記事生成エンジン、API連携 | **極高** |
| 3 | Next.js ダッシュボード構築 | **高** |
| 4 | スケジュール自動化（Inngest） | 中 |
| 5 | Stripe決済連携 | 中 |
| 6 | リリース、QA、運用 | 中 |

**懸念点:**
1. Phase 1 + 2 が同時進行不可（インフラが完成してからAIが実装可能）
2. Phase 2の複雑度（Firecrawl + Tavily + Gemini + WordPress API連携）
3. テスト期間の不足（Phase 3-4 の UI + 自動化テストが Week 3に両立）

**対策:** バイブコーディング活用が成功の鍵（CONCEPT_DECISIONS.md I1）

---

### MA-010: フェーズ間の依存関係に循環や矛盾がないか

**検証結果:** ✅ 依存関係が明確で循環なし

**依存チェーン:**
```
Phase 0 → 0.5 → 1 → 2 → 3 → 4 → 5 → 6
                ↑       ↑       ↑
              基盤   エンジン   UI+自動化
```

**Phase 7以降の依存関係:**
- Phase 7 (Visual): Phase 6完了後、独立実装可能
- Phase 10 (GSC): Phase 6 で十分なデータ蓄積後
- Phase 15 (Prompt Intelligence): **Phase 10（GSCデータ）が前提**

---

## 5. ユーザー体験設計の一貫性

### MA-011: 「3分でセットアップ」訴求と実際のオンボーディングフロー

**検証結果:** ✅ 訴求を修正済み

**明確化（CONCEPT_DECISIONS.md C2）:**
- 「3分で完了はただの目安であり根拠なし」
- 本質は「認知負荷・認知ストレスの低減」

**オンボーディングフロー（Phase3_UserInterface.md）:**
1. Googleアカウントでサインアップ（ワンクリック）
2. プロダクトURL入力
3. 分析中プログレス表示
4. 完了通知 → ダッシュボード

---

### MA-012: 「認知負荷軽減」方針と UI/UX 設計の整合性

**検証結果:** ✅ 全体で一貫

| 要素 | 設計方針 |
|------|---------|
| ログイン | Google OAuth（ワンクリック） |
| 入力フロー | URL入力のみ |
| ダッシュボード | 主要指標（記事数、公開/下書き）に絞込 |
| プラグイン選択 | ホワイトリスト制（選択肢を限定） |
| WordPress管理 | アクセス制御（複雑性を隔離） |

---

## 6. リスク認識と対策の整合性

### MA-013: 「最大懸念：WordPress Multisite運用」と対策の十分性

**検証結果:** ✅ リスク認識から対策まで明確

**最大リスク（CONCEPT_DECISIONS.md I3）:**
> WordPress Multisite の保守運用におけるトラブル

**対策の体系性:**

| リスク | 対策 | 実施時期 |
|--------|------|---------|
| DB肥大化 | 500サイトで水平分割 | 到達時 |
| WPコアアップデート | 自動更新 + ステージング先行テスト | 運用開始時 |
| プラグイン互換性 | ホワイトリスト制 | MVP |
| セキュリティ脆弱性 | Wordfence + 自動スキャン | MVP |
| パフォーマンス劣化 | DB最適化（WP-Optimize） | 月次 |
| バックアップ失敗 | 週次 + 検証 | 運用開始時 |
| 復旧手順未整備 | 復旧手順書を事前作成 | MVP前 |

**監視閾値:**
- DBテーブル数: 4500超（500サイト相当）で警告
- ディスク使用率: 70%警告、80%緊急
- WPエラーログ: 10件/時超で緊急
- レスポンスタイム: 3秒超で警告

---

## 7. 競合優位性・差別化の一貫性

### MA-014: 「パッケージングが革新性」という主張の各フェーズでの体現

**検証結果:** ✅ MVP〜Phase 15まで一貫

**コア主張（CONCEPT_DECISIONS.md A1）:**
> このサービスの最も革新的な価値提案は、**技術的な新奇性ではなく「パッケージング」**にある。

**各フェーズでの体現:**

| フェーズ | パッケージング要素 |
|---------|------------------|
| Phase 0-1 | 「セットアップが簡単」の実証 |
| Phase 2 | 「記事生成が統合」 |
| Phase 3 | 「管理が簡単」 |
| Phase 4 | 「完全自動」 |
| Phase 10 | 「改善が自動」 |
| Phase 15 | 「最適化が学習」 |

---

### MA-015: 競合との差別化ポイント

**検証結果:** ✅ 機能設計が差別化に直結

| 項目 | AutoBlogging.ai | Argo Note |
|------|-----------------|----------|
| WordPressセットアップ | ユーザー自身 | **完全自動（弊社提供）** |
| サーバー管理 | ユーザー責任 | 弊社が運用 |
| 体験 | ツール提供 | **オールインワン・放置OK** |
| 課金体系 | クレジット制（記事単位） | サブスク（固定月額） |
| ターゲット | SEO経験者向け | **初心者・バイブコーダー向け** |

---

## 8. 期待値管理の整合性

### MA-016: 「SEO効果は保証しない」方針とマーケティング訴求の矛盾

**検証結果:** ✅ 期待値コントロールが明確

**SEO効果に関する方針（CONCEPT_DECISIONS.md B9 & B13）:**
- MVP前のSEO効果検証は**実施しない**
- 「SEO上位表示を保証する」とは訴求しない
- 「自動でコンテンツが蓄積される」を訴求

**利用規約への反映:**
- AI生成コンテンツであること、SEO効果を保証しないことを明記

---

### MA-017: 初期品質期待値と実装段階の整合性

**検証結果:** ⚠️ グラデーション設計が明確だが、初期ユーザーの失望リスク

**クオリティ戦略（CONCEPT_DECISIONS.md B15）:**

| フェーズ | クオリティ | 推敲プロセス |
|---------|----------|-----------|
| **MVP** | 特別にこだわらない | 1〜2段階の簡易的生成 |
| **将来** | クオリティ重視 | 複数段階のレビュー・推敲 |

**対策:**
- Phase 2_CoreAI.md: 生成後に「事実確認（Fact Check）」を実施
- Phase 3_UserInterface.md: デフォルトを「下書き」で提供（ユーザー確認後公開）

---

## 9. 具体的な矛盾・不整合のリスト

### 【中度】発見された問題

#### MA-018: フェーズ実装期間の楽観性

**問題箇所:** DEVELOPMENT_ROADMAP.md Lines 44-53

**内容:** Phase 1-6 を4週間で実装

**懸念:**
- Phase 2（AI エンジン）+ Phase 3（UI）の同時進行が困難
- Week 2-3 の複雑度が高い

**対策:** ドキュメントに「バイブコーディング活用が成功の鍵」と記載あり

**推奨アクション:**
- [ ] 実装進捗で週次ふりかえりを計画
- [ ] スコープ調整の基準を事前に設定

---

#### MA-019: 初期品質期待値のギャップ

**問題箇所:** CONCEPT_DECISIONS.md B15 vs A6

**矛盾:**
- MVP: 「特別にこだわらない」
- 5年後: 「クオリティNo.1」を目指す

**リスク:**
- Phase 6_MVPLaunch で「70%継続意向」を目標としているため、品質が重要
- Beta ユーザーの満足度に影響する可能性

**推奨アクション:**
- [ ] Beta ユーザーへの品質期待値を早期に周知
- [ ] 品質改善パス（Phase 6.5相当）の検討

---

#### MA-020: キーワード調査API の選定未定

**問題箇所:** CONCEPT_DECISIONS.md E12 Lines 958-964

**内容:** Keywords Everywhere（$10〜）vs DataForSEO（$50〜）が未決定

**推奨アクション:**
- [ ] Phase 2 開始前にどちらを採用するか決定

---

#### MA-021: Phase 13 Brand Evolution の実装基準が曖昧

**問題箇所:** CONCEPT_DECISIONS.md H17 Lines 1379-1381

**現在の基準:** 「MRR $1,000達成、またはユーザー100人到達後」

**問題:** どちらか早い方？遅い方？

**推奨アクション:**
- [ ] 条件を AND / OR で明確化

---

#### MA-022: 利用規約ドラフトの欠如

**問題箇所:** CONCEPT_DECISIONS.md E8 Lines 876-885

**内容:** MVP ではユーザー責任 + AI生成免責表示が必須

**推奨アクション:**
- [ ] Phase 1 並行で利用規約ドラフト作成

---

## 10. 推奨される整合性向上アクション

### 🔴 高優先度

| ID | アクション | 効果 | 実施時期 |
|----|-----------|------|---------|
| MA-018 | Phase 2-4 の実装時間見積り再検討 | 現実的な期限設定 | Phase 1 開始前 |
| MA-019 | Beta ユーザーへの品質期待値説明資料作成 | 初期満足度向上 | Phase 6 前 |
| MA-020 | キーワード調査API 最終決定 | スコープ確定 | Phase 2 開始前 |
| MA-022 | 利用規約ドラフト作成 | 法的リスク軽減 | Phase 1 並行 |

### 🟡 中優先度

| ID | アクション | 効果 | 実施時期 |
|----|-----------|------|---------|
| MA-021 | Phase 13 の実装基準を AND/OR で明確化 | 意思決定の確定 | Phase 6 後 |
| - | DEVELOPMENT_ROADMAP に詳細フェーズリンク補強 | ナビゲーション改善 | ドキュメント完成時 |
| - | 競合分析（AutoBlogging.ai）の定期更新計画 | 市場動向把握 | Phase 7 前 |

---

## 実装前チェックリスト（マクロ視点）

### ビジョン・戦略確認

- [ ] MA-001: サービスコンセプトが全実装で一貫しているか確認
- [ ] MA-014: パッケージング革新性が各フェーズで体現されているか確認
- [ ] MA-016: SEO効果非保証の訴求が利用規約に反映されているか確認

### フェーズ設計確認

- [ ] MA-009: Week 2-3 の実装計画を再検討
- [ ] MA-010: フェーズ間依存関係に変更がないか確認
- [ ] MA-018: 週次ふりかえりの仕組みを導入

### 品質・期待値管理

- [ ] MA-017: MVP品質基準を明文化
- [ ] MA-019: Beta ユーザー向け品質説明資料を準備
- [ ] MA-022: 利用規約ドラフトを作成

### リスク対策確認

- [ ] MA-013: Multisite 監視閾値を監視ツールに設定
- [ ] 復旧手順書の事前作成

---

## 関連ドキュメント

- [00_Master_Architecture.md](./00_Master_Architecture.md) - 全体設計方針
- [02_Backend_Database.md](./02_Backend_Database.md) - バックエンド・DB仕様
- [04_AI_Pipeline.md](./04_AI_Pipeline.md) - AI処理パイプライン仕様
- [05_Sequence_Diagrams.md](./05_Sequence_Diagrams.md) - システムシーケンス図
- [CONCEPT_DECISIONS.md](../CONCEPT_DECISIONS.md) - 全決定事項
- [DEVELOPMENT_ROADMAP.md](../DEVELOPMENT_ROADMAP.md) - 開発ロードマップ
