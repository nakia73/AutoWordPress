# 04. AIパイプライン・ジョブシステム

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [シーケンス図](./05_Sequence_Diagrams.md) | [ファーストプリンシプル分析](../FIRST_PRINCIPLES_ARTICLE_GENERATION.md) | [Claude Batch API](./05_Claude_Batch_API.md)
> **実装フェーズ:** [Phase 2: Core AI](../phases/Phase2_CoreAI.md), [Phase 4: Automation](../phases/Phase4_Automation.md), [Phase 7: Visual](../phases/Phase7_Visual.md), [Phase 10: GSC連携](../phases/Phase10_GSCIntegration.md), [Phase 15: Prompt Intelligence](../phases/Phase15_PromptIntelligence.md)

ブログ記事の品質と継続性を担保するAI処理系の設計です。

**ジョブ実行基盤:** Inngest（長時間処理・自動リトライ対応）

---

## SEO戦略駆動型コンテンツ生成フロー

**設計思想:** 単なる「URL → クロール → 記事生成」ではなく、SEO戦略に基づいた体系的なコンテンツ生成を行う。

### フロー概要図

```
Phase A          Phase B           Phase C            Phase D
[プロダクト理解] → [購買思考推論] → [キーワード調査] → [競合/SERP分析]
                                                           ↓
Phase G          Phase F           Phase E
[パフォーマンス] ← [個別記事生成] ← [記事クラスター設計]
```

---

**MVPスコープ:** Phase A〜Gを実装対象とする。実行順序は A→B→C→D→E→F→G に確定。

### Phase A: プロダクト理解（Product Understanding）

**目的:** 自社プロダクトの本質的な価値・ターゲット・競合を理解する

**入力方式（ユーザー選択）:**

| 方式 | 説明 | ツール |
|------|------|--------|
| A. URLクロール | プロダクトURLを入力 | Firecrawl / Jina Reader |
| B. インタラクティブ | 質問形式で情報収集 | LLM対話 |
| C. 競合調査ベース | 市場調査から開始 | Tavily Search + LLM |

**出力:**
- プロダクト概要（何を解決するか）
- ターゲットユーザー像
- 主要な競合リスト
- 差別化ポイント

**MVP採用方式の決定プロセス:** AのURLクロールMockup と BのインタラクティブQ&A Mockup を作成し、XなどのSNSで映像を配信して反応を比較し、どちらが市場に求められているかを検証した上で採用方式を決定する。方式Cは本テスト対象外で、扱いは別途決定する。

#### 入力パターン仕様（実装済み - Stream A）

**実装ファイル:** `app/src/lib/ai/article-input-handler.ts`

| モード | 説明 | 必須入力 |
|--------|------|---------|
| `site_url` | 製品/サービスのランディングページURL | url |
| `article_url` | 参考にしたい記事のURL（構造・スタイルを模倣） | url |
| `text` | ユーザーが直接情報を入力 | productName, productDescription, targetKeyword |
| `hybrid` | 複数ソースを組み合わせ | いずれか1つ以上 |

**正規化出力（NormalizedInput）:**
```typescript
type NormalizedInput = {
  productName: string;
  productDescription: string;
  targetKeyword: string;
  language: 'ja' | 'en';
  siteContent?: string;
  referenceArticle?: {
    title: string;
    structure: string[];
    style: string;
    wordCount: number;
  };
  additionalContext?: string;
  inputMode: InputMode;
  sourceUrls: string[];
};
```

---

### Phase B: 購買思考推論（Buyer Thinking Inference）

**目的:** ターゲットユーザーが「どのような思考プロセスで購買に至るか」をLLMで推論

**処理:**
1. Phase Aの情報をLLMに入力
2. 購買ファネル（Awareness → Interest → Consideration → Decision）に沿った思考を推論
3. 各段階で検索しそうなキーワード群を仮説生成

**出力:**
```
認知段階: 「○○ とは」「○○ 意味」
興味段階: 「○○ メリット」「○○ 使い方」
検討段階: 「○○ 比較」「○○ vs △△」「○○ 料金」
決定段階: 「○○ 評判」「○○ 導入事例」「○○ 登録方法」
```

**技術:** LLM推論のみ（APIコスト不要）

---

### Phase C: キーワード調査（Keyword Research）

**目的:** Phase Bの仮説キーワードを実データで検証・拡張

**処理:**
1. Phase Bの仮説キーワードをAPI入力
2. 検索ボリューム・難易度・関連キーワードを取得
3. 優先度スコアリング（ボリューム × 難易度逆数 × 関連性）

**API候補（コスト順）:**

| API | 月額目安 | 特徴 |
|-----|---------|------|
| Keywords Everywhere | $10〜 | 安価、Chrome拡張あり |
| DataForSEO | $50〜 | 高精度、API充実 |
| Semrush API | $100〜 | 業界標準、高コスト |

**MVP方針:** Keywords Everywhere or DataForSEO（$50/月程度）

**出力:**
- 検証済みキーワードリスト（検索ボリューム付き）
- 優先度ランキング
- 関連キーワード（ロングテール）

---

### Phase D: 競合/SERP分析（Competitor & SERP Analysis） ※実装済み

**目的:** 各キーワードで上位表示されている記事を分析し、勝てる構成を設計

**処理:** ※3段階検索（Multi-Phase Search）を実装
1. **Phase 1 - NEWS検索:** 最新ニュース（24時間以内）を取得
2. **Phase 2 - SNS検索:** X/Twitter, Redditでのリアルタイム反応を取得
3. **Phase 3 - OFFICIAL検索:** 公式・権威あるソースから情報を取得
4. **スコアフィルタリング:** 関連度スコア0.6以上の結果のみ採用
5. **Tavily AI Summary活用:** 各フェーズのanswerフィールドを優先抽出
6. LLMで分析:
   - 共通している見出し構成
   - 不足している観点
   - 差別化可能なポイント

**実装ファイル:** `lib/ai/tavily-client.ts`

**出力:**
- 競合記事サマリー（各キーワード）
- 推奨見出し構成（差別化込み）
- 参照すべきソースURL
- NEWS/SNS/OFFICIAL各カテゴリの結果

---

### Phase E: 記事クラスター設計（Article Cluster Design）

**目的:** 内部リンク戦略を含む記事群（クラスター）を設計

**処理:**
1. Phase C/Dの結果を統合
2. ピラーページ（柱記事）とクラスター記事の関係を設計
3. 内部リンク構造を可視化

**出力:**
```
ピラー: 「○○ 完全ガイド」
  ├─ クラスター1: 「○○ とは」
  ├─ クラスター2: 「○○ 使い方」
  ├─ クラスター3: 「○○ vs △△」
  └─ クラスター4: 「○○ 料金」
```

**ユーザー確認ポイント:**
- クラスター構成の承認
- 優先順位の調整
- 除外キーワードの指定

---

### Phase F: 個別記事計画・生成（Article Planning & Generation）

**目的:** 各記事を高品質に生成

**サブフロー:**

1. **Planner（構成）**
   - Input: キーワード + Phase D競合分析
   - Output: H2/H3見出し構成、参照ソース
   - **参照ソース明示**（ユーザーによる確認の補助）

2. **Writer（執筆）**
   - Input: 構成案 + 参照情報
   - Tool: **Gemini 3 Flash**（ソフトコーディング）/ **Claude Batch API**（標準採用、50%コスト削減）
   - Output: 本文（HTML）、メタディスクリプション
   - **プロンプトテンプレートID記録**（Phase 15トレーサビリティ）
   - **Claude API方針:** 1記事でも複数記事でも**常にBatch APIを使用**（ストリーミング/同期API不使用）（[仕様書](./05_Claude_Batch_API.md)）

3. **Editor（推敲）**
   - Input: 初稿
   - Output: HTMLタグ整合性、導線自然さ、SEOチェック
   - **Fact Check:** ❌ 実装しない（設計決定 2026-01-27: ユーザー責任）

4. **Illustrator（画像）** ※実装済み
   - Input: 記事タイトル・要約・セクション見出し
   - Tool: **kie.ai NanoBanana Pro**（主要、$0.09/image）+ **Google公式API**（フォールバック、$0.134/image）
   - Output: アイキャッチ画像 + セクション別画像（H2/H3見出し直後に挿入）
   - **コスト削減:** kie.ai使用で画像コスト33%削減
   - **実装ファイル:**
     - `lib/ai/image-generator.ts` - サムネイル・セクション画像生成
     - `lib/ai/section-image-service.ts` - HTML見出し抽出・画像挿入

---

### Phase G: パフォーマンス最適化（Performance Optimization）

**目的:** 公開後のデータに基づき、継続的に改善

**処理（Phase 10実装）:**
1. GSC（Google Search Console）からデータ取得
   - インプレッション、クリック、CTR、平均順位
2. パフォーマンス分析
   - 成功パターン抽出
   - 改善が必要な記事特定
3. リライト提案
   - タイトル改善案
   - 見出し追加提案
   - 内部リンク強化

**出力:**
- 週次パフォーマンスレポート
- リライト候補リスト
- プロンプト効果相関分析（Phase 15連携）

---

## 基本フロー（レガシー互換）

> **注意:** 以下は旧仕様との互換性のために残しています。新規実装はSEO戦略駆動型フローを使用してください。

**実行環境:** Inngest（ステップ単位で実行、失敗時自動リトライ）

1.  **Analyst (分析) - 複数入力方式対応:**
    - **Input:** 以下のいずれか（ユーザーが選択）
      - **A. URLクロール方式:** プロダクトURLを入力 → Firecrawl/Jina Readerで情報取得
      - **B. インタラクティブ方式:** ユーザーへの質問形式で情報収集（明確なプロダクトがない場合）
      - **C. 競合調査方式:** Tavily Search APIで市場調査 → LLMで解釈・整理
    - **注記:** MVPで採用する方式はA/Bモックアップ検証後に決定する（Xでインプレッション/反応を比較）。
    - **Tool:**
      - 方式A: **Firecrawl**（プライマリ）/ **Jina Reader**（フォールバック）+ LLM
      - 方式B: LLMによる対話的質問生成 + ユーザー入力
      - 方式C: **Tavily Search API** → LLM解釈（必須フロー）
    - **Output:** ターゲットペルソナ、競合分析、キーワード戦略、記事クラスター案
    - **フォールバック:** 方式Aで両API失敗時は方式Bに自動切り替え

2.  **Researcher (競合・市場調査):**
    - **Input:** キーワード、業界、ターゲット市場
    - **Tool:** **Tavily Search API**（Web検索）
    - **Process:**
      1. Tavily Search APIで競合サイト・人気記事を検索
      2. **検索結果をLLMに渡して解釈・分析**（このフローは必須）
      3. ブログコンセプト・方向性の提案を生成
    - **Output:** 競合分析レポート、コンテンツ方向性提案、差別化ポイント

3.  **Planner (構成):**
    - **Input:** 記事テーマ（キーワード）+ Researcher出力
    - **Tool:** Tavily API (追加検索) + LLM
    - **Output:** 記事構成案（H2, H3見出し）、参照すべきURLリスト、**参照ソース明示**

4.  **Writer (執筆):**
    - **Input:** 構成案 + 参照情報
    - **Tool:** **Gemini 3 Flash**（ソフトコーディング、ユーザー変更可）/ **Claude Batch API**（標準採用、50%コスト削減）
    - **Output:** 本文（HTML）、メタディスクリプション
    - **注意:** Claude使用時はストリーミング/同期APIではなく、**常にBatch APIを使用**

5.  **Editor (推敲・校正):**
    - **Input:** 初稿
    - **Tool:** LLM（設定に従う）
    - **Output:** HTMLタグの整合性チェック、プロダクト導線の自然さチェック
    - **Fact Check:** ❌ 実装しない（設計決定 2026-01-27: ユーザー責任）

6.  **Illustrator (画像):** ※実装済み
    - **Input:** 記事タイトル・要約・セクション見出し
    - **Tool:** **kie.ai NanoBanana Pro**（主要、$0.09/image）+ **Google公式API**（フォールバック、$0.134/image）
    - **Output:** アイキャッチ画像（16:9）+ セクション別画像（H2見出し直後に挿入、最大5枚）
    - **コスト最適化:** kie.ai使用で画像コスト33%削減

## LLMモデル戦略（確定）

**重要設計原則: ソフトコーディング**
LLMモデルは**ハードコードしてはならない**。環境変数または設定ファイルによりモデルを後から切り替えられる設計とする。これにより、モデルの性能向上・価格変更・新モデルリリースに柔軟に対応可能。

**LiteLLMプロキシ**を使用し、モデル切り替えを容易化。

- **Gemini 3 Flash（現行採用 - 2026年1月更新）:**
  - **役割:** 全フェーズのメインライター
  - **選定理由:** 高速応答、コストパフォーマンス、十分な品質
  - **設定:** `LLM_MODEL=gemini-3-flash`
  - **API ID:** `gemini-3-flash-preview`

**モデル設定例（環境変数）:**
```env
GEMINI_API_KEY=AIza...
LLM_MODEL=gemini-3-flash
LLM_TIMEOUT_SECONDS=30
LLM_MAX_RETRIES=3
```

**エラーハンドリング方針:**
- **フォールバックは設けない**
- APIエラー（5xx）、レート制限（429）、タイムアウト発生時：
  1. ユーザーにエラーを明確に表示
  2. 別モデルの選択を促すUI表示（Phase 12で実装）
  3. ユーザーが手動でモデルを切り替えて再実行

**モデル選択機能:** Phase 12で段階的に実装予定

## スケジューリングシステム（Phase 4 - MVP必須）

「毎日定時」だけでなく、ユーザー定義の柔軟なスケジュールに対応します。

- **実行基盤:** **Inngest Scheduled Functions**
- **Custom Schedule:** `Cron Expression` をユーザーごとに生成してDBに保存
- **例:**
  - 1日1記事：`0 9 * * *`（毎日9時）
  - 週3記事：`0 9 * * 1,3,5`（月水金9時）
  - 1日10記事：バッチ処理として実装

**リトライ設定:**
- タイムアウト：20分/記事
- リトライ回数：最大3回
- リトライ間隔：指数バックオフ（1分→5分→15分）
- 最終失敗時：メール通知 + ダッシュボード表示

## プロンプト管理

**MVP:** `config/prompts/*.yaml` + Git管理
**Phase 2以降:** Langfuse（A/Bテスト、品質モニタリング）

## コンテキスト管理 (RAG的な要素)

過去に書いた記事の内容と重複しないように、または内部リンクを貼るために、過去記事のメタデータ（タイトル、Slug、要約）をVector Store (pgvector on Supabase) に保存することも検討します（Future）。
MVPでは、「直近10記事のタイトルリスト」をプロンプトに含める簡易的な重複防止策をとります。

---

## 実装済みモジュール一覧（2026年1月更新）

> Rapid-Note2から流用・移植した機能を含む新規実装モジュールの一覧

### Tavily検索クライアント（強化版）

**ファイル:** `app/src/lib/ai/tavily-client.ts`

**機能:**
- 3段階マルチフェーズ検索（NEWS → SNS → OFFICIAL）
- 関連度スコアフィルタリング（min_relevance_score: 0.6）
- Tavily AI Summary（answer）の活用
- time_range対応（day, week, month, year）
- include_domains / exclude_domains対応
- country設定対応（japan等）

**主要メソッド:**
```typescript
multiPhaseSearch(keyword, options): Promise<MultiPhaseResearchResult>
filterByScore(results, minScore): TavilySearchResult[]
researchForArticle(keyword, options): Promise<string>
```

**流用元:** `Rapid-Note2/src/research.py`

---

### Webスクレイパー

**ファイル:** `app/src/lib/ai/web-scraper.ts`

**機能:**
- Jina Reader APIを使用したURL→Markdownコンテンツ抽出
- 構造化された見出し抽出
- 画像URL抽出
- テスト: 14テスト

**主要メソッド:**
```typescript
scrapeUrl(url: string): Promise<ScrapedContent>
```

---

### 入力パターンハンドラー

**ファイル:** `app/src/lib/ai/article-input-handler.ts`

**機能:**
- 4つの入力モード（site_url, article_url, text, hybrid）の統合処理
- 入力の正規化（NormalizedInput）
- URLスクレイピング→製品情報抽出→キーワード生成の自動化
- テスト: 13テスト

**主要メソッド:**
```typescript
processInput(input: ArticleInput): Promise<NormalizedInput>
```

---

### 画像生成サービス

**ファイル:** `app/src/lib/ai/image-generator.ts`

**機能:**
- **kie.ai NanoBanana Pro**（主要）によるサムネイル生成（$0.09/image）
- **Google公式API**（フォールバック）（$0.134/image）
- 参照画像によるスタイル維持機能
- LLMによる最終プロンプト生成
- テスト: 20テスト、カバレッジ98.55%

**主要メソッド:**
```typescript
generateThumbnail(title, body, options): Promise<ThumbnailResult>
generateSectionImage(sectionText, articleTitle, options): Promise<ImageGenerationResult>
generateImageWithAPI(prompt, options): Promise<Buffer>
```

**流用元:** `Rapid-Note2/backend/app/services/thumbnail_service.py`

---

### セクション画像サービス

**ファイル:** `app/src/lib/ai/section-image-service.ts`

**機能:**
- HTML見出し（H2/H3）の自動抽出
- 各セクションに対応する画像の自動生成
- 生成画像のHTML自動挿入
- WordPress Media APIとの連携対応

**主要メソッド:**
```typescript
processArticleImages(articleHtml, articleTitle, options): Promise<SectionImageResult>
generateSectionImages(articleHtml, articleTitle, options): Promise<Array<{header, imageData, error}>>
```

**流用元:** `Rapid-Note2/backend/app/services/section_image_service.py`

---

### 記事生成パイプライン（統合版）

**ファイル:** `app/src/lib/ai/article-generator.ts`

**6ステップパイプライン:**
1. **Research:** 3段階マルチフェーズ検索による調査
2. **Outline:** 記事構成案の生成
3. **Content:** 本文（HTML）の生成
4. **Meta Description:** メタディスクリプションの生成
5. **Thumbnail:** サムネイル画像の生成（includeImages有効時）
6. **Section Images:** セクション別画像の生成・挿入（includeImages有効時）

**使用例:**
```typescript
const result = await articleGenerator.generate({
  targetKeyword: 'AI記事生成',
  productName: 'Argo Note',
  productDescription: '...',
  articleType: 'article',
  language: 'ja',
  includeImages: true, // 画像生成を有効化
});
```

---

### Fact Check（事実確認）について

> **設計決定（2026-01-27）:** Fact Check機能は実装しない

**理由:**
- **内容の真実性・正確性の確認はユーザーの責任**とする
- AI生成コンテンツの品質保証は、参照ソース明示によりユーザーが確認可能な状態を提供
- システムの複雑性を削減し、責任の分離を明確化

**ユーザーへの案内:**
- 生成された記事には参照ソースが明示される
- ユーザーは公開前に内容を確認・編集することが推奨される
- 利用規約に「コンテンツの正確性確認はユーザー責任」を明記

---

### 環境変数

```env
# LLM設定（2026年1月更新）
LLM_MODEL=gemini-3-flash          # デフォルト推奨（API ID: gemini-3-flash-preview）
GEMINI_API_KEY=AIza...            # Google Gemini APIキー
ANTHROPIC_API_KEY=sk-ant-...      # Anthropic Claude APIキー（オプション）

# Tavily検索
TAVILY_API_KEY=tvly-...           # セマンティック検索用

# 画像生成（kie.ai主要 + Gemini 3 Pro Imageフォールバック）
KIE_AI_API_KEY=...                # kie.ai NanoBanana Pro用（主要、$0.09/image）
GOOGLE_API_KEY=AIza...            # Gemini 3 Pro Image用（gemini-3-pro-image-preview）

# Webスクレイピング（オプション）
JINA_API_KEY=...                  # Jina Reader 拡張機能用
```

---

## パイプライン v2.0（将来拡張）

> **追記日:** 2026年1月27日
> **参照:** [ファーストプリンシプル分析](../FIRST_PRINCIPLES_ARTICLE_GENERATION.md)

ファーストプリンシプル分析から導出された、記事生成パイプラインの進化版構想。

### 追加予定機能

| 機能 | 説明 | 対象Phase |
|------|------|-----------|
| **Phase 0: Soul Setup** | ユーザーのライティングスタイル・価値観を学習し、User Style Vectorとして保存 | Phase 12 |
| **F7: Transparency Footer** | AI生成の協業プロセスを記事末尾に自動挿入 | MVP追加推奨 |
| **G1: Living Article Monitor** | 公開記事のフレッシュネス監視、新情報検知 | Phase 10 |
| **G2: Update Suggestion** | 更新提案の自動生成、ユーザー承認フロー | Phase 10 |

### Human-Led AI アプローチ

```
┌─────────────────────────────────────────────────────────────┐
│  人間の領域                    AIの領域                      │
├─────────────────────────────────────────────────────────────┤
│  ◆ ビジョン設定               ◆ 情報収集（Tavily 3段階）   │
│  ◆ ペルソナ定義               ◆ 構造化（アウトライン）     │
│  ◆ 体験の注入                 ◆ ドラフト生成               │
│  ◆ 最終判断                   ◆ 画像生成                   │
│  ◆ 方向性の修正               ◆ 継続的更新                 │
└─────────────────────────────────────────────────────────────┘
```

### 品質レベル定義

| レベル | 名称 | 内容 | 対象 |
|--------|------|------|------|
| **Lv.1** | Quick Draft | AI生成のみ、基本SEO対策 | 速度重視のテスト記事 |
| **Lv.2** | Standard | ペルソナ適用、ストーリーテリング | 通常の運用記事 |
| **Lv.3** | Premium | 独自視点追加、深い専門性 | ピラーページ、重要記事 |

詳細は [FIRST_PRINCIPLES_ARTICLE_GENERATION.md](../FIRST_PRINCIPLES_ARTICLE_GENERATION.md) を参照。
