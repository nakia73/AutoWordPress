# Phase 15: Prompt Intelligence（プロンプトインテリジェンス）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [AIパイプライン](../architecture/04_AI_Pipeline.md) | [コンセプト決定](../CONCEPT_DECISIONS.md)
> **前提フェーズ:** Phase 10（GSC連携）
> **依存関係:** GSCデータ、記事生成ログ

---

## 概要

**目的:** 記事生成に使用したプロンプト・ロジックを追跡し、パフォーマンスデータと相関分析することで、効果的なプロンプトを特定・共有する仕組みを構築する。

**コアコンセプト:**
- **トレーサビリティ:** どの記事がどのプロンプト・ロジックで生成されたかを完全追跡
- **パフォーマンス相関:** GSCデータと生成ログを紐付け、効果を測定
- **ユーザー選択:** 効果が高いプロンプトをユーザーが選択・カスタマイズ可能
- **コミュニティインテリジェンス:** 匿名集計により全体の知見を共有

---

## 設計思想

### なぜPrompt Intelligenceが必要か

1. **ブラックボックス問題の解消**
   - 「なぜこの記事は成功したのか」がわからない
   - プロンプトの微調整が効果的だったのか、キーワード選定が良かったのか判別不能

2. **継続的改善の基盤**
   - 成功パターンを特定し、横展開可能に
   - 失敗パターンを避けるための学習

3. **ユーザーへの価値提供**
   - 「このプロンプトを使うと成功しやすい」という明確な指針
   - 自分のジャンルに最適なプロンプトの発見

---

## 機能仕様

### 1. トレーサビリティ（記事生成ログ）

**記録対象:**

| 項目 | 説明 |
|------|------|
| 使用プロンプトテンプレートID | どのプロンプトを使用したか |
| 生成ロジックバージョン | パイプラインのバージョン |
| LLMモデル | gemini-3.0-pro等 |
| Temperature | 生成時の温度パラメータ |
| ターゲットキーワード | 狙ったキーワード |
| 検索意図分類 | Awareness/Interest/Consideration/Decision |
| 参照ソース | 参照したURL一覧 |
| 生成時間 | 処理にかかった時間 |
| APIコスト | 生成にかかったコスト |

### 2. パフォーマンスデータ連携

**GSCから取得するデータ:**

| 指標 | 説明 |
|------|------|
| インプレッション | 検索結果に表示された回数 |
| クリック | 実際にクリックされた回数 |
| CTR | クリック率 |
| 平均順位 | 検索結果での平均順位 |

**追加指標（オプション）:**

| 指標 | ソース |
|------|--------|
| PV数 | Google Analytics |
| 滞在時間 | Google Analytics |
| 直帰率 | Google Analytics |

### 3. プロンプト効果分析

**Prompt Effectiveness Score (PES):**

```
PES = (インプレッション × 0.2) + (クリック × 0.3) + (順位逆数 × 0.3) + (CTR × 0.2)
```

**分析軸:**

| 軸 | 説明 |
|----|------|
| プロンプトテンプレート別 | どのプロンプトが最も効果的か |
| ジャンル別 | どのジャンルでどのプロンプトが有効か |
| 検索意図別 | Awareness記事 vs Decision記事 |
| 時系列 | 効果の推移 |

### 4. ユーザーダッシュボード

**表示内容:**

```
┌─────────────────────────────────────────────┐
│  あなたのプロンプト効果ランキング           │
├─────────────────────────────────────────────┤
│  1. 🥇 SEO最適化プロンプト v2.3            │
│     PES: 87.5 | 使用記事: 12 | 平均順位: 4.2│
│                                             │
│  2. 🥈 比較記事プロンプト v1.8             │
│     PES: 72.3 | 使用記事: 8 | 平均順位: 7.1 │
│                                             │
│  3. 🥉 導入事例プロンプト v1.2             │
│     PES: 65.8 | 使用記事: 5 | 平均順位: 9.5 │
└─────────────────────────────────────────────┘
```

**操作:**
- プロンプトテンプレートの選択
- カスタムプロンプトの作成
- A/Bテストの設定

### 5. コミュニティインテリジェンス

**匿名集計データ:**

```
┌─────────────────────────────────────────────┐
│  コミュニティで人気のプロンプト             │
├─────────────────────────────────────────────┤
│  📊 全ユーザー統計                          │
│                                             │
│  SaaSプロダクト向け:                        │
│    - 「機能比較プロンプト」 平均PES: 78.2   │
│    - 「導入メリットプロンプト」 平均PES: 71.5│
│                                             │
│  アプリ向け:                                │
│    - 「使い方ガイドプロンプト」 平均PES: 82.1│
│    - 「トラブル解決プロンプト」 平均PES: 75.8│
└─────────────────────────────────────────────┘
```

**プライバシー配慮:**
- プロンプト内容は匿名化
- 統計データのみ共有
- オプトアウト可能

### 6. A/Bテスト機能

**設定:**

```yaml
ab_test:
  name: "SEOプロンプト比較テスト"
  variants:
    - id: "control"
      prompt_template_id: "prompt_seo_v2"
      weight: 50
    - id: "variant_a"
      prompt_template_id: "prompt_seo_v3"
      weight: 50
  metrics:
    - impressions
    - clicks
    - ctr
    - average_position
  duration_days: 14
  min_sample_size: 10
```

**結果表示:**

```
┌─────────────────────────────────────────────┐
│  A/Bテスト結果: SEOプロンプト比較           │
├─────────────────────────────────────────────┤
│  Control (v2):  CTR 2.3% | 順位 6.2         │
│  Variant A (v3): CTR 3.1% | 順位 4.8        │
│                                             │
│  🏆 勝者: Variant A (+34.8% CTR向上)        │
│  統計的有意性: 95%                          │
└─────────────────────────────────────────────┘
```

---

## データベース設計

### テーブル構造

```sql
-- プロンプトテンプレート管理
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),           -- 'seo', 'comparison', 'tutorial', etc.
  target_genre VARCHAR(100),      -- 'saas', 'app', 'ecommerce', etc.
  prompt_text TEXT NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  is_system BOOLEAN DEFAULT true, -- システム提供 or ユーザー作成
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 生成ロジックバージョン管理
CREATE TABLE generation_logic_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  changes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 記事生成ログ（トレーサビリティの核心）
CREATE TABLE article_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  prompt_template_id UUID REFERENCES prompt_templates(id),
  logic_version_id UUID REFERENCES generation_logic_versions(id),

  -- LLM設定
  llm_model VARCHAR(100),
  temperature DECIMAL(3,2),
  max_tokens INTEGER,

  -- コンテンツ情報
  target_keyword VARCHAR(255),
  search_intent VARCHAR(50),      -- 'awareness', 'interest', 'consideration', 'decision'
  reference_sources JSONB,        -- 参照したURLリスト

  -- メタデータ
  generation_time_ms INTEGER,
  output_word_count INTEGER,
  api_cost_usd DECIMAL(10, 4),

  created_at TIMESTAMP DEFAULT NOW()
);

-- パフォーマンス指標（GSC連携）
CREATE TABLE article_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,

  -- 期間
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,

  -- GSC指標
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2),
  average_position DECIMAL(5, 2),

  -- GA指標（オプション）
  page_views INTEGER,
  avg_time_on_page INTEGER,       -- 秒
  bounce_rate DECIMAL(5, 2),

  collected_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(article_id, date_from, date_to)
);

-- プロンプト効果スコア（集計テーブル）
CREATE TABLE prompt_effectiveness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_template_id UUID REFERENCES prompt_templates(id),

  -- 集計期間
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- スコア
  pes_score DECIMAL(5, 2),
  total_articles INTEGER,
  avg_impressions DECIMAL(10, 2),
  avg_clicks DECIMAL(10, 2),
  avg_ctr DECIMAL(5, 2),
  avg_position DECIMAL(5, 2),

  -- セグメント
  genre VARCHAR(100),
  search_intent VARCHAR(50),

  calculated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(prompt_template_id, period_start, period_end, genre, search_intent)
);

-- A/Bテスト管理
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'running', 'completed', 'cancelled'

  -- 設定
  variants JSONB NOT NULL,        -- [{id, prompt_template_id, weight}, ...]
  metrics TEXT[] NOT NULL,        -- ['impressions', 'clicks', 'ctr', 'average_position']
  duration_days INTEGER DEFAULT 14,
  min_sample_size INTEGER DEFAULT 10,

  -- 結果
  winner_variant_id VARCHAR(50),
  statistical_significance DECIMAL(5, 2),
  result_summary JSONB,

  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- A/Bテスト記事割り当て
CREATE TABLE ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  variant_id VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(ab_test_id, article_id)
);
```

### インデックス

```sql
-- パフォーマンスクエリ用
CREATE INDEX idx_generation_logs_user ON article_generation_logs(user_id);
CREATE INDEX idx_generation_logs_prompt ON article_generation_logs(prompt_template_id);
CREATE INDEX idx_generation_logs_created ON article_generation_logs(created_at);
CREATE INDEX idx_performance_article_date ON article_performance_metrics(article_id, date_from);
CREATE INDEX idx_pes_prompt_period ON prompt_effectiveness_scores(prompt_template_id, period_start);
```

---

## API設計

### エンドポイント

```
# プロンプトテンプレート
GET    /api/prompts                    # 一覧取得
GET    /api/prompts/:id                # 詳細取得
POST   /api/prompts                    # 新規作成（カスタム）
PUT    /api/prompts/:id                # 更新
DELETE /api/prompts/:id                # 削除

# 効果分析
GET    /api/prompts/:id/effectiveness  # プロンプト効果取得
GET    /api/analytics/prompt-ranking   # プロンプトランキング
GET    /api/analytics/community-stats  # コミュニティ統計

# A/Bテスト
GET    /api/ab-tests                   # テスト一覧
POST   /api/ab-tests                   # テスト作成
GET    /api/ab-tests/:id               # テスト詳細
PUT    /api/ab-tests/:id/start         # テスト開始
PUT    /api/ab-tests/:id/stop          # テスト停止
GET    /api/ab-tests/:id/results       # テスト結果

# トレーサビリティ
GET    /api/articles/:id/generation-log # 記事の生成ログ
GET    /api/generation-logs             # 生成ログ一覧
```

---

## 実装フェーズ

### Phase 15.1: 基盤構築（Week 1-2）

- [ ] データベーステーブル作成
- [ ] 生成ログ記録機能
- [ ] プロンプトテンプレート管理UI

### Phase 15.2: 分析機能（Week 3-4）

- [ ] GSCデータ連携（Phase 10拡張）
- [ ] PESスコア計算バッチ
- [ ] プロンプトランキングUI

### Phase 15.3: ユーザー機能（Week 5-6）

- [ ] カスタムプロンプト作成UI
- [ ] プロンプト選択機能
- [ ] 効果比較ダッシュボード

### Phase 15.4: 高度な機能（Week 7-8）

- [ ] A/Bテスト機能
- [ ] コミュニティインテリジェンス
- [ ] 自動最適化提案

---

## 成功指標

**注意:** 具体的な数値目標は設定しない（CONCEPT_DECISIONS.md J6参照）

**KPI（重要指標）:**
- プロンプト選択機能がユーザーに利用されること
- PESスコアの継続的な改善が観測されること
- A/Bテスト機能がアクティブユーザーに活用されること
- コミュニティでのプロンプト共有が発生すること

---

## 検討事項（未決定）

| 項目 | 選択肢 | 決定時期 |
|------|--------|---------|
| プライバシーポリシー | オプトイン vs オプトアウト | Phase 15開始時 |
| カスタムプロンプト公開 | 許可 vs 非許可 | Phase 15.3 |
| A/Bテスト自動化 | 自動割り当て vs 手動 | Phase 15.4 |

---

## 関連ドキュメント

- [04_AI_Pipeline.md](../architecture/04_AI_Pipeline.md) - SEO戦略フロー
- [Phase 10: GSC Integration](./Phase10_GSCIntegration.md) - GSCデータ連携
- [CONCEPT_DECISIONS.md](../CONCEPT_DECISIONS.md) - 設計決定事項
