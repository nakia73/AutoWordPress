# Stream A: Article Generation - 詳細実装計画

> **サービス名:** Argo Note
> **関連ドキュメント:** [StreamA概要](./StreamA_ArticleGen.md) | [AIパイプライン仕様](../architecture/04_AI_Pipeline.md) | [ファーストプリンシプル分析](../FIRST_PRINCIPLES_ARTICLE_GENERATION.md)
>
> **最終更新:** 2026-01-29

---

## 1. 実装状況サマリー

### 1.1 コンポーネント別ステータス

| コンポーネント | ファイル | 状態 | 詳細 |
|---------------|----------|------|------|
| 記事生成パイプライン | `article-generator.ts` | ✅ 完了 | 6ステップ実装済み |
| Tavily検索 | `tavily-client.ts` | ✅ 完了 | 3フェーズ検索実装済み |
| LLMクライアント | `llm-client.ts` | ✅ 完了 | Gemini 2.0 Flash対応 |
| プロダクト分析 | `product-analyzer.ts` | ✅ 完了 | Phase A-E分析実装済み |
| 画像生成 | `image-generator.ts` | ✅ 完了 | NanoBanana Pro対応 |
| セクション画像 | `section-image-service.ts` | ✅ 完了 | H2/H3自動検出・挿入 |
| Inngest: 分析 | `analyze-product.ts` | ✅ 完了 | 11ステップワークフロー |
| Inngest: 生成 | `generate-article.ts` | ✅ 完了 | 7ステップワークフロー |
| URLクロール | Firecrawl/Jina | ⬜ 未実装 | Tavilyで代替中 |
| キーワードAPI | Keywords Everywhere等 | ⬜ 未実装 | LLM推定で代替中 |

### 1.2 進捗グラフ

```
核心機能     ████████████████████ 100%
Inngest統合  ████████████████████ 100%
外部API      ██████████████░░░░░░  70%
テスト       ████░░░░░░░░░░░░░░░░  20%
監視/ログ    ██░░░░░░░░░░░░░░░░░░  10%
スタブUI     ░░░░░░░░░░░░░░░░░░░░   0%
CLIツール    ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 2. アーキテクチャ詳細

### 2.1 記事生成パイプライン

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ArticleGenerator Pipeline                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Input                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ targetKeyword: string                                        │   │
│  │ productContext: ProductAnalysisResult                        │   │
│  │ articleType: 'article' | 'faq' | 'glossary'                 │   │
│  │ language: 'ja' | 'en'                                        │   │
│  │ includeImages: boolean                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Step 1: Research (TavilyClient)                              │   │
│  │   - NEWS: 最新24時間のニュース                                │   │
│  │   - SNS: X/Twitter/Reddit                                    │   │
│  │   - OFFICIAL: 公式サイト・信頼性高いソース                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Step 2: Outline Generation (LLMClient)                       │   │
│  │   - JSON形式でアウトライン生成                                 │   │
│  │   - title, sections[{heading, points}], conclusion           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Step 3: Content Generation (LLMClient)                       │   │
│  │   - HTML形式で本文生成                                        │   │
│  │   - 3,000-4,000語 (article) / 1,500-2,500語 (faq/glossary)   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Step 4: Meta Description (LLMClient)                         │   │
│  │   - 160文字以内のSEOメタディスクリプション                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Step 5: Thumbnail Generation (ImageGenerator)                │   │
│  │   - 16:9アスペクト比                                          │   │
│  │   - NanoBanana Pro API                                        │   │
│  │   - 日本語テロップ対応                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Step 6: Section Images (SectionImageService)                 │   │
│  │   - H2/H3見出し自動検出                                       │   │
│  │   - 最大5枚まで挿入                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  Output                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ArticleContent {                                              │   │
│  │   title, content (HTML), meta_description,                    │   │
│  │   target_keyword, outline (JSON),                             │   │
│  │   thumbnail_url, word_count, sources[]                        │   │
│  │ }                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 プロダクト分析パイプライン

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ProductAnalyzer Pipeline                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Phase A: analyzeProduct()                                          │
│  ├── Input: プロダクト基本情報 (名前, URL, 説明)                      │
│  └── Output: product_summary, target_audience, value_proposition    │
│                                                                     │
│  Phase B: analyzePurchaseFunnel()                                   │
│  ├── Input: Phase A結果                                             │
│  └── Output: awareness/interest/consideration/decision タッチポイント│
│                                                                     │
│  Phase C: researchKeywords()                                        │
│  ├── Input: Phase A, B結果                                          │
│  └── Output: keywords[] {keyword, volume, difficulty, intent}       │
│                                                                     │
│  Phase D: analyzeCompetitors()                                      │
│  ├── Input: Phase C結果 (キーワード)                                 │
│  └── Output: competitors[] {url, title, strengths[], gaps[]}        │
│                                                                     │
│  Phase E: generateClusters()                                        │
│  ├── Input: Phase A-D全結果                                         │
│  └── Output: clusters[] {pillar_topic, articles[]}                  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ProductAnalysisResult (JSON) → Prisma products.analysisResult      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. 残タスク詳細

### 3.1 スタブUI作成 (A-3)

**目的:** スタンドアローンで記事生成を検証できるシンプルなUI

```
app/src/app/dev/article-gen/
├── page.tsx           # メインページ
├── components/
│   ├── InputForm.tsx     # 入力フォーム
│   ├── ResultPreview.tsx # 結果プレビュー
│   └── MetadataPanel.tsx # メタデータ表示
└── actions.ts         # Server Actions
```

**実装タスク:**

| タスク | 優先度 | 工数目安 |
|--------|--------|---------|
| 入力フォーム（URL/テキスト/キーワード） | 高 | 2h |
| 生成ボタン + ローディング状態 | 高 | 1h |
| HTML結果プレビュー | 高 | 2h |
| メタデータJSON表示 | 中 | 1h |
| 生成履歴一覧 | 低 | 2h |

**UI設計:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Argo Note - Article Generator (Dev)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Target Keyword: [________________________]               │   │
│  │                                                         │   │
│  │ Product Context:                                         │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ (JSON or select from existing products)              │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │ Article Type: [Article ▼]  Language: [Japanese ▼]      │   │
│  │                                                         │   │
│  │ ☑ Include Images                                        │   │
│  │                                                         │   │
│  │ [Generate Article]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Result Preview                              [Copy HTML]  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  <article>                                              │   │
│  │    <h1>Generated Title</h1>                             │   │
│  │    <p>Content...</p>                                    │   │
│  │  </article>                                              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Metadata                                                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ {                                                        │   │
│  │   "title": "...",                                        │   │
│  │   "word_count": 3500,                                    │   │
│  │   "sources": [...]                                       │   │
│  │ }                                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.2 CLIツール作成 (A-4)

**目的:** コマンドラインから記事生成を実行

```
app/scripts/
├── argo-gen.ts        # メインCLI
├── commands/
│   ├── generate.ts       # 記事生成コマンド
│   ├── analyze.ts        # プロダクト分析コマンド
│   └── batch.ts          # バッチ処理コマンド
└── utils/
    ├── config.ts         # 設定読み込み
    └── output.ts         # 出力フォーマッタ
```

**実装タスク:**

| タスク | 優先度 | 工数目安 |
|--------|--------|---------|
| CLIフレームワーク選定・セットアップ (Commander.js) | 高 | 1h |
| `generate` コマンド実装 | 高 | 3h |
| `analyze` コマンド実装 | 中 | 2h |
| `batch` コマンド実装 | 中 | 2h |
| 出力フォーマット（JSON/HTML/Markdown） | 中 | 1h |
| エラーハンドリング・プログレス表示 | 中 | 1h |

**コマンド仕様:**

```bash
# 単一記事生成
npx tsx scripts/argo-gen.ts generate \
  --keyword "タスク管理ツール比較" \
  --type article \
  --lang ja \
  --images \
  --output ./output/article.html

# プロダクト分析
npx tsx scripts/argo-gen.ts analyze \
  --name "TaskFlow" \
  --url "https://taskflow.example.com" \
  --output ./output/analysis.json

# バッチ処理
npx tsx scripts/argo-gen.ts batch \
  --input ./keywords.txt \
  --output ./output/ \
  --parallel 3
```

**keywords.txt 形式:**

```
タスク管理ツール比較,article,ja
プロジェクト管理とは,glossary,ja
タスク管理FAQ,faq,ja
```

---

### 3.3 品質検証 (A-5)

**目的:** 生成記事の品質を評価・改善

**実装タスク:**

| タスク | 優先度 | 工数目安 |
|--------|--------|---------|
| サンプル記事10本生成 | 高 | 2h |
| 品質チェックリスト作成 | 高 | 1h |
| 自動品質スコアリング実装 | 中 | 4h |
| プロンプト調整・A/Bテスト | 中 | 4h |
| 品質レポート生成 | 低 | 2h |

**品質チェックリスト:**

```markdown
## 構造品質
- [ ] 適切なH2/H3見出し構造
- [ ] 導入文が存在する
- [ ] 結論/まとめセクションがある
- [ ] リスト・表の適切な使用

## コンテンツ品質
- [ ] ターゲットキーワードが自然に含まれている
- [ ] 参照URLが明示されている
- [ ] ハルシネーション（誤情報）がない
- [ ] 文字数が目標範囲内

## SEO品質
- [ ] メタディスクリプションが160文字以内
- [ ] タイトルが60文字以内
- [ ] 見出しにキーワードが含まれている

## 可読性
- [ ] 段落が適切に分割されている
- [ ] 専門用語に説明がある
- [ ] 文章が冗長でない
```

**自動品質スコアリング:**

```typescript
interface QualityScore {
  structure: number;      // 0-100
  content: number;        // 0-100
  seo: number;            // 0-100
  readability: number;    // 0-100
  overall: number;        // 0-100
  issues: string[];       // 問題点リスト
}

async function scoreArticle(content: ArticleContent): Promise<QualityScore> {
  // 構造チェック
  const structureScore = checkStructure(content);

  // コンテンツチェック（LLMベース）
  const contentScore = await checkContent(content);

  // SEOチェック
  const seoScore = checkSEO(content);

  // 可読性チェック
  const readabilityScore = checkReadability(content);

  return {
    structure: structureScore,
    content: contentScore,
    seo: seoScore,
    readability: readabilityScore,
    overall: (structureScore + contentScore + seoScore + readabilityScore) / 4,
    issues: collectIssues()
  };
}
```

---

### 3.4 Firecrawl/Jina Reader統合

**目的:** URLからプロダクト情報を自動抽出

**現状:** Tavily検索で代替中

**実装タスク:**

| タスク | 優先度 | 工数目安 |
|--------|--------|---------|
| Firecrawl APIクライアント実装 | 中 | 2h |
| Jina Reader APIクライアント実装 | 中 | 2h |
| URL→構造化データ変換ロジック | 中 | 3h |
| product-analyzer.ts への統合 | 中 | 2h |
| エラーハンドリング・フォールバック | 中 | 1h |

**API仕様:**

```typescript
// Firecrawl
interface FirecrawlClient {
  scrape(url: string): Promise<{
    markdown: string;
    metadata: {
      title: string;
      description: string;
      ogImage: string;
    };
  }>;

  crawl(url: string, options: {
    maxPages?: number;
    includePaths?: string[];
  }): Promise<CrawlResult[]>;
}

// Jina Reader
interface JinaReaderClient {
  read(url: string): Promise<{
    content: string;     // Markdown形式
    title: string;
    links: string[];
  }>;
}
```

---

### 3.5 テスト整備

**目的:** 各モジュールの品質保証

**実装タスク:**

| タスク | 優先度 | 工数目安 |
|--------|--------|---------|
| ユニットテストフレームワーク設定 (Vitest) | 高 | 1h |
| article-generator.ts テスト | 高 | 3h |
| tavily-client.ts テスト（モック） | 高 | 2h |
| llm-client.ts テスト（モック） | 高 | 2h |
| product-analyzer.ts テスト | 中 | 3h |
| E2E統合テスト | 中 | 4h |

**テスト構造:**

```
app/src/lib/ai/__tests__/
├── article-generator.test.ts
├── tavily-client.test.ts
├── llm-client.test.ts
├── product-analyzer.test.ts
├── image-generator.test.ts
└── mocks/
    ├── tavily.ts
    ├── llm.ts
    └── nanobana.ts
```

**テスト例:**

```typescript
// article-generator.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ArticleGenerator } from '../article-generator';
import { mockTavilyClient } from './mocks/tavily';
import { mockLLMClient } from './mocks/llm';

describe('ArticleGenerator', () => {
  it('should generate article with all steps', async () => {
    const generator = new ArticleGenerator({
      tavilyClient: mockTavilyClient,
      llmClient: mockLLMClient,
    });

    const result = await generator.generate({
      targetKeyword: 'タスク管理ツール',
      productContext: mockProductContext,
      articleType: 'article',
      language: 'ja',
      includeImages: false,
    });

    expect(result.title).toBeDefined();
    expect(result.content).toContain('<h2>');
    expect(result.word_count).toBeGreaterThan(3000);
  });
});
```

---

### 3.6 監視・ログ整備

**目的:** 本番環境での問題検知・デバッグ

**実装タスク:**

| タスク | 優先度 | 工数目安 |
|--------|--------|---------|
| Sentry統合 | 高 | 2h |
| 構造化ログ実装 (Pino) | 高 | 2h |
| LLM使用量トラッキング | 中 | 2h |
| API呼び出し計測 | 中 | 1h |
| ダッシュボード作成 | 低 | 3h |

**ログ構造:**

```typescript
interface GenerationLog {
  requestId: string;
  timestamp: string;

  // 入力
  input: {
    keyword: string;
    articleType: string;
    language: string;
  };

  // ステップ別タイミング
  steps: {
    research: { durationMs: number; resultCount: number };
    outline: { durationMs: number; tokensUsed: number };
    content: { durationMs: number; tokensUsed: number };
    meta: { durationMs: number };
    thumbnail: { durationMs: number; success: boolean };
    sectionImages: { durationMs: number; count: number };
  };

  // 結果
  result: {
    success: boolean;
    wordCount: number;
    totalDurationMs: number;
    totalTokensUsed: number;
  };

  // エラー（あれば）
  error?: {
    step: string;
    message: string;
    stack?: string;
  };
}
```

---

## 4. 実装スケジュール

### Phase 1: スタンドアローン動作確認（優先）

```
Week 1:
├── A-3: スタブUI作成
│   ├── Day 1-2: 入力フォーム + 生成ボタン
│   ├── Day 3: 結果プレビュー
│   └── Day 4: メタデータ表示
│
├── A-4: CLIツール作成
│   ├── Day 1: CLIフレームワーク設定
│   ├── Day 2-3: generate/analyze コマンド
│   └── Day 4: batch コマンド
│
└── A-5: 品質検証（開始）
    └── Day 5: サンプル記事生成 + チェックリスト作成
```

### Phase 2: 品質・安定性向上

```
Week 2:
├── テスト整備
│   ├── Day 1: Vitest設定
│   ├── Day 2-3: 主要モジュールテスト
│   └── Day 4: E2E統合テスト
│
├── 監視・ログ整備
│   ├── Day 1: Sentry統合
│   └── Day 2: 構造化ログ実装
│
└── A-5: 品質検証（完了）
    ├── Day 3: 自動品質スコアリング
    └── Day 4-5: プロンプト調整
```

### Phase 3: 拡張機能

```
Week 3+:
├── Firecrawl/Jina Reader統合
│   ├── Day 1-2: APIクライアント実装
│   └── Day 3: product-analyzer.ts統合
│
└── Keywords API統合（オプション）
    └── DataForSEO or Keywords Everywhere
```

---

## 5. 環境変数（確認済み）

```bash
# AI/LLM (2026年1月更新)
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key  # オプション
LLM_MODEL=gemini-3-flash  # デフォルト推奨
LLM_TIMEOUT_SECONDS=30

# Search
TAVILY_API_KEY=your-tavily-key

# Image
KIE_AI_API_KEY=your-kie-ai-key      # 主要（$0.09/image）
GOOGLE_API_KEY=your-google-key       # フォールバック（gemini-3-pro-image-preview）

# Inngest
INNGEST_SIGNING_KEY=your-signing-key
INNGEST_EVENT_KEY=your-event-key

# Database
DATABASE_URL=postgresql://...

# 追加予定
# FIRECRAWL_API_KEY=your-firecrawl-key
# JINA_API_KEY=your-jina-key
```

---

## 6. ファイル一覧

### 実装済み

```
app/src/lib/ai/
├── article-generator.ts      # 記事生成パイプライン
├── tavily-client.ts          # Tavily API統合
├── llm-client.ts             # LLMクライアント
├── product-analyzer.ts       # プロダクト分析
├── image-generator.ts        # 画像生成
└── section-image-service.ts  # セクション画像挿入

app/src/lib/inngest/functions/
├── analyze-product.ts        # 分析ジョブ
└── generate-article.ts       # 生成ジョブ

app/src/types/
├── articles.ts               # 記事関連型定義
├── products.ts               # プロダクト関連型定義
└── external-apis.ts          # 外部API型定義
```

### 作成予定

```
app/src/app/dev/article-gen/  # スタブUI
├── page.tsx
├── components/
└── actions.ts

app/scripts/                   # CLIツール
├── argo-gen.ts
├── commands/
└── utils/

app/src/lib/ai/__tests__/     # テスト
├── *.test.ts
└── mocks/

app/src/lib/ai/               # 追加モジュール
├── firecrawl-client.ts       # Firecrawl統合
├── jina-reader-client.ts     # Jina Reader統合
└── quality-scorer.ts         # 品質スコアリング
```

---

## 7. 成功基準

### スタンドアローン動作

| 基準 | 目標値 |
|------|--------|
| 記事生成成功率 | 95%以上 |
| 生成時間（画像なし） | 3分以内 |
| 生成時間（画像あり） | 5分以内 |
| 品質スコア | 70点以上 |

### 品質

| 基準 | 目標値 |
|------|--------|
| 文字数精度 | 目標の±20% |
| 見出し構造 | H2が3つ以上 |
| 参照ソース | 3つ以上 |
| ハルシネーション | 0件 |

### テストカバレッジ

| 対象 | 目標値 |
|------|--------|
| ユニットテスト | 80%以上 |
| 統合テスト | 主要フロー100% |
| E2Eテスト | Happy Path 100% |

---

## 8. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| LLM API障害 | 生成停止 | リトライ + フォールバックモデル |
| Tavily API制限 | 検索失敗 | キャッシュ + レート制限管理 |
| 画像生成失敗 | 品質低下 | テキストのみで続行（graceful degradation） |
| 品質ばらつき | ユーザー不満 | プロンプト改善 + 品質スコアフィルタ |
| コスト超過 | 予算オーバー | トークン使用量監視 + アラート |
