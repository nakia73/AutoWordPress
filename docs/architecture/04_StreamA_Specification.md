# 04-A. Stream A: 記事生成モジュール 完全仕様書

> **サービス名:** Argo Note
> **モジュール名:** Stream A - Article Generation Engine
> **バージョン:** 1.0.0
> **最終更新:** 2026-01-29
> **ステータス:** ✅ 実装完了（127テスト パス）
>
> **関連ドキュメント:**
> - [AIパイプライン仕様](./04_AI_Pipeline.md) - 全体設計
> - [StreamA概要](../phases/StreamA_ArticleGen.md) - フェーズ概要
> - [実装報告書](../phases/StreamA_Implementation_Report.md) - 詳細実装記録
> - [E2Eテスト計画](../phases/StreamA_E2E_Test_Plan.md)
> - [品質チェックリスト](../phases/StreamA_Quality_Checklist.md)

---

## 1. 概要

### 1.1 目的

AI記事生成エンジンをスタンドアローンで提供し、以下を実現する：
- WordPress連携なしで動作確認可能
- 高品質なSEO最適化記事の自動生成
- 複数の入力パターンに対応
- サムネイル・セクション画像の自動生成

### 1.2 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Stream A: Article Generation                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────────────────────────────────────┐   │
│  │    入力      │    │              6ステップパイプライン              │   │
│  │  ──────────  │    │  ────────────────────────────────────────────  │   │
│  │  - site_url  │───▶│  Step 1: Research (Tavily 3-Phase Search)     │   │
│  │  - article_  │    │      ↓                                        │   │
│  │    url       │    │  Step 2: Outline (LLM - SEO構成)              │   │
│  │  - text      │    │      ↓                                        │   │
│  │  - hybrid    │    │  Step 3: Content (LLM - 本文生成)             │   │
│  └──────────────┘    │      ↓                                        │   │
│                      │  Step 4: Meta Description                      │   │
│                      │      ↓                                        │   │
│                      │  Step 5: Thumbnail (kie.ai/Google)            │   │
│                      │      ↓                                        │   │
│                      │  Step 6: Section Images                       │   │
│                      └──────────────────────────────────────────────┘   │
│                                     │                                    │
│                                     ▼                                    │
│                      ┌──────────────────────────────────┐               │
│                      │            出力                   │               │
│                      │  ────────────────────────────────  │               │
│                      │  - 記事HTML                       │               │
│                      │  - メタデータJSON                 │               │
│                      │  - サムネイル画像                 │               │
│                      │  - セクション画像（最大5枚）      │               │
│                      └──────────────────────────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ファイル構成

### 2.1 コアモジュール

| ファイル | 役割 | テスト数 | カバレッジ |
|---------|------|---------|-----------|
| `app/src/lib/ai/article-generator.ts` | 記事生成メインロジック | 14 | 90.74% |
| `app/src/lib/ai/llm-client.ts` | LLM APIクライアント | 15 | 94.28% |
| `app/src/lib/ai/tavily-client.ts` | セマンティック検索 | 19 | 98.21% |
| `app/src/lib/ai/image-generator.ts` | 画像生成 (kie.ai/Google) | 20 | 98.55% |
| `app/src/lib/ai/section-image-service.ts` | セクション画像処理 | 19 | 100% |
| `app/src/lib/ai/web-scraper.ts` | URLスクレイピング | 14 | - |
| `app/src/lib/ai/product-analyzer.ts` | プロダクト分析 | - | - |
| `app/src/lib/ai/article-input-handler.ts` | 入力パターン統合 | 13 | - |

### 2.2 UI / CLI

| ファイル | 役割 |
|---------|------|
| `app/src/app/dev/article-gen/page.tsx` | スタブUI（開発用） |
| `app/src/app/dev/article-gen/actions.ts` | Server Actions |
| `app/scripts/argo-gen.ts` | CLIツール |
| `app/scripts/generate-samples.ts` | サンプル生成スクリプト |

### 2.3 テストファイル

```
app/src/lib/ai/__tests__/
├── article-generator.test.ts       # 14テスト
├── tavily-client.test.ts           # 19テスト
├── llm-client.test.ts              # 15テスト
├── image-generator.test.ts         # 20テスト
├── section-image-service.test.ts   # 19テスト
├── web-scraper.test.ts             # 14テスト
├── article-input-handler.test.ts   # 13テスト
└── integration.test.ts             # 10テスト (API必要)

app/scripts/__tests__/
└── argo-gen.test.ts                # 12テスト
```

---

## 3. 6ステップパイプライン仕様

### Step 1: Research（リサーチ）

**担当モジュール:** `tavily-client.ts`

**3段階マルチフェーズ検索:**

| Phase | 目的 | クエリパターン | ソース |
|-------|------|---------------|--------|
| NEWS | 最新ニュース取得 | `{keyword} latest news {year}` | ニュースサイト |
| SNS | リアルタイム反応 | `{keyword} reviews opinions` | X/Twitter, Reddit |
| OFFICIAL | 公式情報 | `{keyword} official documentation` | 公式サイト |

**API仕様:**
```typescript
interface TavilySearchOptions {
  search_depth?: 'basic' | 'advanced';
  topic?: 'general' | 'news';
  time_range?: 'day' | 'week' | 'month' | 'year';
  include_domains?: string[];
  exclude_domains?: string[];
  include_answer?: boolean;
  include_raw_content?: boolean;
  max_results?: number;
  country?: string;
}

// 使用例
const result = await tavilyClient.multiPhaseSearch(keyword, {
  language: 'ja',
  country: 'japan',
});
```

**出力:**
```typescript
interface MultiPhaseResearchResult {
  news: TavilySearchResult[];
  sns: TavilySearchResult[];
  official: TavilySearchResult[];
  combinedContext: string;
  answer?: string;
}
```

---

### Step 2: Outline Generation（構成生成）

**担当モジュール:** `article-generator.ts` → `llm-client.ts`

**入力:** GenerationOptions + Research結果
**出力:** ArticleOutline

```typescript
interface ArticleOutline {
  title: string;
  sections: Array<{
    heading: string;
    level: 2 | 3;
    notes: string;
  }>;
}
```

**LLMプロンプト:**
- SEO最適化された見出し構成
- H2/H3階層の適切な設計
- 検索意図に対応した構成

---

### Step 3: Content Generation（本文生成）

**担当モジュール:** `article-generator.ts` → `llm-client.ts`

**記事タイプ別文字数:**

| タイプ | 目的 | 文字数目安 | H2数目安 |
|--------|------|-----------|---------|
| `article` | 深度のある解説記事 | 3,000〜4,000 | 5-7 |
| `faq` | よくある質問への回答 | 1,500〜2,500 | 5-10 |
| `glossary` | 用語解説 | 1,000〜2,000 | 1-3 |

**出力フォーマット:** HTML

```html
<article>
  <h1>タイトル</h1>
  <p>リード文...</p>
  <h2>見出し1</h2>
  <p>本文...</p>
  <h3>小見出し</h3>
  <p>本文...</p>
  ...
</article>
```

---

### Step 4: Meta Description（メタディスクリプション生成）

**担当モジュール:** `article-generator.ts` → `llm-client.ts`

**要件:**
- 最大160文字
- ターゲットキーワード含有
- CTA要素（行動喚起）含有

---

### Step 5: Thumbnail Generation（サムネイル生成）

**担当モジュール:** `image-generator.ts`

**API優先順位:**
1. **kie.ai NanoBanana Pro**（主要）- $0.09/image
2. **Google公式API**（フォールバック）- $0.134/image

**仕様:**
- アスペクト比: 16:9
- 解像度: 2K
- 出力形式: PNG
- テキストなし（抽象的なイラスト）

**API仕様（kie.ai）:**
```typescript
interface KieAIRequest {
  model: 'nano-banana-pro';
  input: {
    prompt: string;
    aspect_ratio: '16:9';
    resolution: '2K';
    output_format: 'png';
  };
}
```

---

### Step 6: Section Images（セクション画像生成）

**担当モジュール:** `section-image-service.ts` → `image-generator.ts`

**処理フロー:**
1. HTML見出し（H2）を自動抽出
2. 各見出しに対応する画像プロンプト生成
3. 画像生成（最大5枚）
4. 生成画像をHTML内に自動挿入

**出力:**
```typescript
interface SectionImageResult {
  processedHtml: string;
  imagesGenerated: number;
  errors: string[];
}
```

---

## 4. 入力パターン仕様

### 4.1 サポートする入力モード

```typescript
type InputMode = 'site_url' | 'text' | 'hybrid';
```

> **注意:** `article_url`（参考記事URL模倣）モードは、本来の設計である「Trace機能（Writing Style Trace）」として Phase 10 で正式実装予定です。Trace機能は専用管理画面（`/settings/style-traces`）で事前にスタイルプロファイルを登録し、記事生成時に選択する「アセット管理方式」で実装されます。

### 4.2 各モードの詳細

#### Mode 1: `site_url`（サイトURL入力）

製品/サービスのランディングページURLを入力。

```typescript
interface SiteUrlInput {
  mode: 'site_url';
  url: string;              // 必須: 製品ページURL
  targetKeyword?: string;   // 任意: 指定しない場合は自動生成
  language?: 'ja' | 'en';   // デフォルト: 'ja'
}
```

**処理フロー:**
1. Jina Reader APIでURLをスクレイピング
2. LLMで製品名・説明を抽出
3. ターゲットキーワードを自動生成（未指定時）
4. 記事生成へ

#### Mode 2: `text`（テキスト入力）

ユーザーが直接情報を入力。

```typescript
interface TextInput {
  mode: 'text';
  productName: string;         // 必須: 製品名
  productDescription: string;  // 必須: 製品説明
  targetKeyword: string;       // 必須: ターゲットキーワード
  additionalContext?: string;  // 任意: 追加コンテキスト
  language?: 'ja' | 'en';
}
```

#### Mode 3: `hybrid`（ハイブリッド入力）

サイトURLとテキスト入力を組み合わせ。

```typescript
interface HybridInput {
  mode: 'hybrid';
  siteUrl?: string;            // 任意: 製品ページURL
  productName?: string;        // 任意（URLから抽出可）
  productDescription?: string;
  targetKeyword?: string;
  additionalContext?: string;
  language?: 'ja' | 'en';
}
```

### 4.3 正規化出力

全入力モードは以下の統一フォーマットに正規化される：

```typescript
interface NormalizedInput {
  // 記事生成に必須
  productName: string;
  productDescription: string;
  targetKeyword: string;
  language: 'ja' | 'en';

  // オプション拡張
  siteContent?: string;
  // referenceArticle: Phase 10「Trace機能」で使用予定
  // 現時点では未使用
  referenceArticle?: {
    title: string;
    structure: string[];
    style: string;
    wordCount: number;
  };
  additionalContext?: string;

  // メタデータ
  inputMode: InputMode;
  sourceUrls: string[];
}
```

---

## 5. 出力仕様

### 5.1 ArticleContent（記事コンテンツ）

```typescript
interface ArticleContent {
  title: string;
  slug: string;
  content: string;              // HTML
  meta_description: string;
  target_keyword: string;
  search_intent: string;
  article_type: ArticleType;
  language: 'ja' | 'en';
  word_count: number;
  thumbnail?: ThumbnailResult;
  sectionImagesGenerated?: number;
  sources?: string[];
  generated_at: string;
}
```

### 5.2 ThumbnailResult

```typescript
interface ThumbnailResult {
  imageData: Buffer;
  promptUsed: string;
  isFallback?: boolean;
  errorMessage?: string;
}
```

### 5.3 メタデータJSON出力例

```json
{
  "title": "タスク管理ツール比較：2026年最新版ガイド",
  "slug": "task-management-tool-comparison-2026",
  "excerpt": "主要タスク管理ツールを徹底比較...",
  "keywords": ["タスク管理", "比較", "Notion", "TaskFlow"],
  "type": "article",
  "word_count": 3500,
  "sources": [
    "https://official-docs.example.com",
    "https://review-site.example.com"
  ],
  "generated_at": "2026-01-29T12:00:00Z"
}
```

---

## 6. 外部API仕様

### 6.1 Tavily API（セマンティック検索）

| 項目 | 値 |
|------|-----|
| エンドポイント | `https://api.tavily.com/search` |
| 認証 | `TAVILY_API_KEY` |
| コスト | 従量課金 |

### 6.2 kie.ai API（画像生成 - 主要）

| 項目 | 値 |
|------|-----|
| エンドポイント | `https://api.kie.ai/api/v1/jobs/createTask` |
| モデル | `nano-banana-pro` |
| 認証 | `KIE_AI_API_KEY` |
| コスト | $0.09/image |

### 6.3 Google Gemini API（画像生成 - フォールバック）

| 項目 | 値 |
|------|-----|
| エンドポイント | `generativelanguage.googleapis.com` |
| モデル | `gemini-3-pro-image-preview` (Nano Banana Pro) |
| 認証 | `GOOGLE_API_KEY` |
| コスト | $2.00/M tokens (入力) + $0.134/image (出力) |

### 6.4 Jina Reader API（Webスクレイピング）

| 項目 | 値 |
|------|-----|
| エンドポイント | `https://r.jina.ai/{url}` |
| 認証 | `JINA_API_KEY`（オプション） |
| コスト | 無料（基本） |

### 6.5 LLM設定

| 項目 | 値 |
|------|-----|
| プロバイダー | Google / Anthropic（ソフトコーディング）|
| デフォルトモデル | `gemini-3-flash-preview` |
| タイムアウト | 30秒 |
| 環境変数 | `LLM_MODEL`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` |

### 6.6 サポートするLLMモデル一覧

**注意:** 最新世代のモデルのみサポート。旧世代モデル（Gemini 2.x, Claude 3.x/4.0）は使用不可。

#### Google Gemini 3 (2025年1月リリース)

| モデルキー | APIモデルID | モデル名 | 特徴 | 価格 (入力/出力 $/M tokens) |
|-----------|-------------|---------|------|----------------------------|
| `gemini-3-flash` | `gemini-3-flash-preview` | Gemini 3 Flash | 高速・低コスト（デフォルト）| $0.50 / $3.00 |
| `gemini-3-pro` | `gemini-3-pro-preview` | Gemini 3 Pro | 高品質 | $2.00 / $12.00 (<200k), $4.00 / $18.00 (>200k) |

#### Google Nano Banana Pro（画像生成）

| モデルキー | APIモデルID | モデル名 | 特徴 | 価格 |
|-----------|-------------|---------|------|------|
| - | `gemini-3-pro-image-preview` | Nano Banana Pro | 最高品質の画像生成 | $2.00/M (入力) + $0.134/image |

#### Anthropic Claude 4.5 (最新世代)

| モデルキー | APIモデルID | モデル名 | 特徴 |
|-----------|-------------|---------|------|
| `claude-haiku-4.5` | `claude-haiku-4-5` | Claude Haiku 4.5 | 高速・低コスト |
| `claude-sonnet-4.5` | `claude-sonnet-4-5` | Claude Sonnet 4.5 | バランス型 |
| `claude-opus-4.5` | `claude-opus-4-5` | Claude Opus 4.5 | 最高品質 |

**モデル切り替え方法:**
```bash
# .env で設定
LLM_MODEL="claude-sonnet-4.5"
```

```typescript
// プログラムで指定
const client = new LLMClient({ model: 'claude-opus-4.5' });
```

---

## 7. 環境変数

### 7.1 必須環境変数

| 変数名 | 必須 | 用途 | 取得先 |
|--------|------|------|--------|
| `LLM_MODEL` | ⚠️ 推奨 | 使用LLMモデル | 上記モデル一覧参照 |
| `GEMINI_API_KEY` | ✅* | Google Gemini API | [Google AI Studio](https://aistudio.google.com/apikey) |
| `ANTHROPIC_API_KEY` | ✅* | Anthropic Claude API | [Anthropic Console](https://console.anthropic.com/) |
| `TAVILY_API_KEY` | ✅ | セマンティック検索 | [Tavily](https://tavily.com) |
| `KIE_AI_API_KEY` | ⚠️ | 画像生成（主要）| [kie.ai](https://kie.ai/api-key) |
| `GOOGLE_API_KEY` | ⚠️ | 画像生成（フォールバック）| [Google AI Studio](https://aistudio.google.com/apikey) |
| `JINA_API_KEY` | オプション | Webスクレイピング | [Jina Reader](https://jina.ai/reader) |

**注:** `GEMINI_API_KEY`または`ANTHROPIC_API_KEY`は、使用するモデルに応じて少なくとも1つ必要。

### 7.2 設定ファイル

**パス:** `/app/.env`

```bash
# ============================================
# Stream A: LLM設定
# ============================================

# 使用するLLMモデル (ソフトコーディング)
# 最新モデルのみサポート（旧世代モデルは使用不可）
# Google: gemini-3-flash, gemini-3-pro
# Anthropic: claude-haiku-4.5, claude-sonnet-4.5, claude-opus-4.5
LLM_MODEL="gemini-3-flash"

# LLMタイムアウト (秒)
LLM_TIMEOUT_SECONDS=30

# LiteLLM経由で使用する場合は true
USE_LITELLM="false"

# --- Google Gemini API ---
GEMINI_API_KEY="AIza..."

# --- Anthropic Claude API ---
ANTHROPIC_API_KEY="sk-ant-..."

# ============================================
# Stream A: 検索・画像生成
# ============================================

# Tavily セマンティック検索 (必須)
TAVILY_API_KEY="tvly-..."

# kie.ai (主要、33%コスト削減)
KIE_AI_API_KEY="..."

# Google API (フォールバック)
GOOGLE_API_KEY="..."

# Jina Reader (オプション)
JINA_API_KEY=""
```

---

## 8. 使用方法

### 8.1 プログラマティックAPI

```typescript
import { articleGenerator } from '@/lib/ai/article-generator';

const result = await articleGenerator.generate({
  targetKeyword: 'タスク管理ツール 比較',
  productName: 'TaskFlow',
  productDescription: 'チーム向けタスク管理ツール',
  articleType: 'article',
  language: 'ja',
  includeImages: true,
});

console.log(result.title);    // 記事タイトル
console.log(result.content);  // HTML本文
console.log(result.thumbnail); // サムネイル画像データ
```

### 8.2 CLIツール

```bash
cd app

# 単一記事生成
npx tsx scripts/argo-gen.ts generate \
  --keyword "タスク管理ツール 比較" \
  --type article \
  --lang ja \
  --output ./output

# バッチ生成
npx tsx scripts/argo-gen.ts batch \
  --file keywords.txt \
  --output ./output
```

### 8.3 スタブUI

```
http://localhost:3000/dev/article-gen
```

機能:
- キーワード入力
- 記事タイプ選択（Article/FAQ/Glossary）
- 言語選択（日本語/English）
- 画像生成オプション
- HTMLプレビュー・コピー

---

## 9. 品質基準

### 9.1 スコアリング（100点満点）

| カテゴリ | 配点 | 内容 |
|---------|------|------|
| 構造品質 | 25点 | 見出し階層、段落構成 |
| SEO品質 | 25点 | キーワード最適化、メタ情報 |
| コンテンツ品質 | 30点 | 正確性、読みやすさ、深度 |
| 画像品質 | 10点 | サムネイル、セクション画像 |
| 技術品質 | 10点 | HTML妥当性、パフォーマンス |

### 9.2 合格基準

| レベル | スコア | 判定 |
|--------|--------|------|
| A | 90-100 | そのまま公開可能 |
| B | 75-89 | 軽微な修正で公開可能 |
| C | 60-74 | 部分的な書き直しが必要 |
| D | 0-59 | 全面的な再生成が必要 |

---

## 10. テスト実行

```bash
cd app

# 全ユニットテスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き
npm run test:coverage

# 統合テスト（実API使用）
INTEGRATION=true npm test

# サンプル記事生成（品質評価用）
npx tsx scripts/generate-samples.ts
```

---

## 11. 成功基準

| 基準 | 目標 | 達成状況 |
|------|------|---------|
| スタンドアローン動作 | WordPress接続なしで記事生成完了 | ✅ 達成 |
| 品質 | 「読んで価値のある」記事が生成される | ✅ 達成 |
| 速度 | 1記事あたり5分以内に生成完了 | ✅ 達成 |
| 再現性 | 同じ入力で一貫した品質の出力 | ✅ 達成 |
| テストカバレッジ | 主要モジュール90%以上 | ✅ 達成 |

---

## 12. モジュール分離・外部連携可能性

### 12.1 依存関係分析

Stream Aは高いモジュラリティを持ち、外部システムとの連携が容易な設計になっています。

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stream A コアモジュール                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  article-generator.ts ─────┬──→ llm-client.ts                   │
│  (メインエントリ)          ├──→ tavily-client.ts                │
│                            ├──→ image-generator.ts              │
│                            ├──→ section-image-service.ts ──→ WordPressClient │
│                            └──→ @/types (型定義のみ)       (オプショナル)    │
│                                                                 │
│  article-input-handler.ts ─┬──→ web-scraper.ts                  │
│  (入力正規化)              ├──→ llm-client.ts                   │
│                            └──→ tavily-client.ts                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │    外部API依存 (HTTP経由)    │
                    ├─────────────────────────────┤
                    │ • Gemini / Claude API       │
                    │ • Tavily API                │
                    │ • kie.ai NanoBanana Pro     │
                    │ • Google Image API          │
                    │ • Jina Reader API           │
                    └─────────────────────────────┘
```

### 12.2 評価サマリー

| 評価項目 | 状態 | 説明 |
|---------|------|------|
| **型依存** | ✅ 良好 | `@/types`は型定義のみ。コピーすれば完全分離可能 |
| **外部API** | ✅ 良好 | 全てHTTP経由。環境変数で切り替え可能 |
| **内部モジュール結合** | ✅ 良好 | 相対importのみ。一括コピー可能 |
| **WordPress依存** | ⚠️ オプショナル | `section-image-service.ts`のみ。コンストラクタで注入 |
| **Prisma/DB依存** | ✅ なし | コアモジュールにDB直接依存なし |
| **Next.js依存** | ✅ なし | 純粋なTypeScript/Node.js |

### 12.3 外部連携シナリオ

#### シナリオ1: WordPressプラグイン（生成機能のみ）

**実現可能性: ◎ 容易**

```
必要なファイル:
├── lib/ai/*.ts          # 全ファイルをコピー
├── types/*.ts           # 型定義をコピー
└── .env                 # API キーを設定
```

`section-image-service.ts`のWordPressClient依存はコンストラクタでオプショナル注入のため、WordPress側で画像アップロードを処理すれば問題なし。

#### シナリオ2: モバイルアプリ（記事生成専用バックエンド）

**実現可能性: ◎ 容易**

```typescript
// Express/Fastify バックエンドの例
import { ArticleGenerator } from './lib/ai/article-generator';
import { articleInputHandler } from './lib/ai/article-input-handler';

app.post('/generate', async (req, res) => {
  const input = await articleInputHandler.normalizeInput(req.body);
  const generator = new ArticleGenerator();
  const article = await generator.generate(input.keywords[0], input.personas[0], 'article');
  res.json(article);
});
```

#### シナリオ3: スタンドアロンnpmパッケージ

**実現可能性: ◎ 容易**

依存関係が最小限のため、独立npmパッケージとして公開可能。

### 12.4 独立利用のための推奨改善（将来オプション）

現状でも連携は可能ですが、より綺麗に分離する場合：

1. **型定義の自己完結化:** `@/types`エイリアスを相対パスに変更、または型定義を同梱
2. **WordPressClient依存の完全除去:** インターフェース注入パターンの採用
3. **環境変数のデフォルト値:** 必須APIキー未設定時の明確なエラーメッセージ

---

## 13. 制限事項・注意事項

1. **Fact Check未実装:** コンテンツの正確性確認はユーザー責任（設計決定 2026-01-27）
2. **Editor（推敲）未実装:** 将来の品質向上フェーズで検討
3. **画像生成API依存:** kie.ai/Google APIの可用性に依存
4. **LLMプロンプト調整:** 継続的な品質改善が必要

---

## 14. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-29 | 1.2.0 | 最新モデルのみサポート（Gemini 3, Claude 4.5）、旧世代モデル廃止 |
| 2026-01-29 | 1.1.0 | マルチLLMプロバイダー対応（Gemini/Claude）、環境変数仕様更新 |
| 2026-01-29 | 1.0.1 | セクション12「モジュール分離・外部連携可能性」追加 |
| 2026-01-29 | 1.0.0 | 初版作成。Stream A実装完了に伴う完全仕様書化 |
