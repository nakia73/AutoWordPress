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

## 関連ドキュメント

- [00_Master_Architecture.md](./00_Master_Architecture.md) - 全体設計方針
- [02_Backend_Database.md](./02_Backend_Database.md) - バックエンド・DB仕様
- [04_AI_Pipeline.md](./04_AI_Pipeline.md) - AI処理パイプライン仕様
- [05_Sequence_Diagrams.md](./05_Sequence_Diagrams.md) - システムシーケンス図
