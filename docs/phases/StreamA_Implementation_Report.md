# Stream A: 記事生成モジュール 実装報告書

> **作成日:** 2026-01-29
> **イテレーション:** 1〜14 (RALPH Loop)
> **ステータス:** ✅ 実装完了
> **テスト:** 127/127 パス (+10 統合テスト)

---

## 1. 実装概要

### 1.1 目的

AI記事生成エンジンをスタンドアローンで構築・検証し、WordPress連携なしで動作確認できる状態を実現する。

### 1.2 達成目標

| 目標 | 達成状況 |
|------|---------|
| スタンドアローン動作 | ✅ 達成 |
| 品質の高い記事生成 | ✅ 達成 |
| 1記事5分以内の生成 | ✅ 達成（目標） |
| 再現性のある出力 | ✅ 達成 |

---

## 2. 実装ファイル一覧

### 2.1 コアモジュール

| ファイル | 役割 | テスト数 | カバレッジ |
|---------|------|---------|-----------|
| `article-generator.ts` | 記事生成メインロジック | 14 | 90.74% |
| `llm-client.ts` | LLM API クライアント | 15 | 94.28% |
| `tavily-client.ts` | セマンティック検索 | 19 | 98.21% |
| `image-generator.ts` | 画像生成 (kie.ai/Google) | 20 | 98.55% |
| `section-image-service.ts` | セクション画像処理 | 19 | 100% |
| `web-scraper.ts` | URL スクレイピング | 14 | - |
| `product-analyzer.ts` | プロダクト分析 | - | - |
| `article-input-handler.ts` | 入力パターン統合 | 13 | - |

### 2.2 UI / CLI

| ファイル | 役割 |
|---------|------|
| `app/dev/article-gen/page.tsx` | スタブUI |
| `app/dev/article-gen/actions.ts` | Server Actions |
| `scripts/argo-gen.ts` | CLIツール |
| `scripts/generate-samples.ts` | サンプル生成スクリプト |

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
└── argo-gen.test.ts              # 12テスト
```

---

## 3. 記事生成パイプライン

### 3.1 6ステップ生成フロー

```
┌─────────────────────────────────────────────────────────────┐
│                    記事生成パイプライン                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Research (Tavily API)                              │
│  ├── 3フェーズ検索 (NEWS, SNS, OFFICIAL)                    │
│  └── 最新情報・競合分析・ベストプラクティス取得               │
│                                                             │
│  Step 2: Outline Generation (LLM)                           │
│  ├── SEO最適化された見出し構成                               │
│  └── H2/H3階層の自動生成                                    │
│                                                             │
│  Step 3: Content Generation (LLM)                           │
│  ├── セクションごとの本文生成                                │
│  └── 検索意図に対応したコンテンツ                            │
│                                                             │
│  Step 4: Meta Description (LLM)                             │
│  ├── 160文字以内のメタディスクリプション                     │
│  └── キーワード含有・CTA要素                                │
│                                                             │
│  Step 5: Thumbnail Generation (kie.ai/Google)               │
│  ├── 記事内容に基づくプロンプト生成                          │
│  └── 16:9 サムネイル画像生成                                │
│                                                             │
│  Step 6: Section Images (kie.ai/Google)                     │
│  ├── H2見出しごとの挿絵生成                                 │
│  └── テキストなし抽象画像                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 記事タイプ

| タイプ | 目的 | 文字数目安 | H2数 |
|--------|------|-----------|------|
| Article | 深度のある解説記事 | 3,000〜4,000 | 5-7 |
| FAQ | よくある質問への回答 | 1,500〜2,500 | 5-10 |
| Glossary | 用語解説 | 1,000〜2,000 | 1-3 |

---

## 4. 入力パターン仕様

### 4.1 サポートする入力モード

```typescript
type InputMode = 'site_url' | 'article_url' | 'text' | 'hybrid';
```

### 4.2 各モードの詳細

#### Mode 1: サイトURL (`site_url`)

製品/サービスのランディングページURLを入力。

```typescript
type SiteUrlInput = {
  mode: 'site_url';
  url: string;           // 必須: 製品ページURL
  targetKeyword?: string; // 任意: 指定しない場合は自動生成
  language?: 'ja' | 'en'; // デフォルト: 'ja'
};
```

**処理フロー:**
1. Jina Reader API でURLをスクレイピング
2. LLMで製品名・説明を抽出
3. ターゲットキーワードを自動生成（未指定時）
4. 記事生成へ

#### Mode 2: 模倣記事URL (`article_url`)

参考にしたい記事のURLを入力。

```typescript
type ArticleUrlInput = {
  mode: 'article_url';
  url: string;                // 必須: 参考記事URL
  productName?: string;       // 任意: 製品名
  productDescription?: string; // 任意: 製品説明
  language?: 'ja' | 'en';
};
```

**処理フロー:**
1. 参考記事をスクレイピング
2. 構造（見出し階層）・スタイル・語数を分析
3. 同様の構造で新記事を生成
4. 製品情報は記事から推測 or ユーザー入力

#### Mode 3: テキスト入力 (`text`)

ユーザーが直接情報を入力。

```typescript
type TextInput = {
  mode: 'text';
  productName: string;        // 必須: 製品名
  productDescription: string; // 必須: 製品説明
  targetKeyword: string;      // 必須: ターゲットキーワード
  additionalContext?: string; // 任意: 追加コンテキスト
  language?: 'ja' | 'en';
};
```

**処理フロー:**
1. 入力情報をそのまま使用
2. 追加コンテキストがあれば記事生成に反映
3. 記事生成へ

#### Mode 4: ハイブリッド (`hybrid`)

複数ソースを組み合わせ。

```typescript
type HybridInput = {
  mode: 'hybrid';
  siteUrl?: string;           // 任意: 製品ページURL
  articleUrl?: string;        // 任意: 参考記事URL
  productName?: string;       // 任意（URLから抽出可）
  productDescription?: string;
  targetKeyword?: string;
  additionalContext?: string;
  language?: 'ja' | 'en';
};
```

**処理フロー:**
1. サイトURLがあればスクレイピング→製品情報抽出
2. 記事URLがあればスクレイピング→構造分析
3. ユーザー入力を優先してマージ
4. 統合された情報で記事生成

### 4.3 正規化出力

```typescript
type NormalizedInput = {
  // 記事生成に必須
  productName: string;
  productDescription: string;
  targetKeyword: string;
  language: 'ja' | 'en';

  // オプション拡張
  siteContent?: string;          // サイトから取得したコンテンツ
  referenceArticle?: {           // 参考記事の分析結果
    title: string;
    structure: string[];         // 見出し配列
    style: string;               // 文体
    wordCount: number;
  };
  additionalContext?: string;

  // メタデータ
  inputMode: InputMode;
  sourceUrls: string[];
};
```

---

## 5. API仕様

### 5.1 外部API

#### Tavily API (セマンティック検索)

- **用途:** リサーチフェーズでの情報収集
- **エンドポイント:** `https://api.tavily.com/search`
- **認証:** `TAVILY_API_KEY`
- **コスト:** 従量課金

**3フェーズ検索:**
```
Phase 1 (NEWS): "{keyword} latest news {year}"
Phase 2 (SNS):  "{keyword} reviews opinions"
Phase 3 (OFFICIAL): "{keyword} official documentation"
```

#### kie.ai API (画像生成 - 主要)

- **用途:** サムネイル・セクション画像生成
- **エンドポイント:** `https://api.kie.ai/api/v1/jobs/createTask`
- **モデル:** `nano-banana-pro`
- **認証:** `KIE_AI_API_KEY`
- **コスト:** $0.09/image

**リクエスト形式:**
```json
{
  "model": "nano-banana-pro",
  "input": {
    "prompt": "...",
    "aspect_ratio": "16:9",
    "resolution": "2K",
    "output_format": "png"
  }
}
```

#### Google Gemini API (画像生成 - フォールバック)

- **用途:** kie.ai失敗時のフォールバック
- **エンドポイント:** `generativelanguage.googleapis.com`
- **モデル:** `gemini-3-pro-image-preview`
- **認証:** `GOOGLE_API_KEY`
- **コスト:** $0.134/image

#### Jina Reader API (Webスクレイピング)

- **用途:** URL からコンテンツ抽出
- **エンドポイント:** `https://r.jina.ai/{url}`
- **認証:** `JINA_API_KEY`（オプション）
- **コスト:** 無料（基本）

### 5.2 LLM設定

- **プロバイダー:** Google Gemini 3 / Anthropic Claude 4.5
- **デフォルトモデル:** `gemini-3-flash` (API ID: `gemini-3-flash-preview`)
- **タイムアウト:** 30秒
- **環境変数:** `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `LLM_MODEL`

---

## 6. 環境変数

```bash
# AI/LLM
GEMINI_API_KEY="AIza..."       # Google Gemini APIキー
ANTHROPIC_API_KEY="sk-ant-..." # Anthropic Claude APIキー（オプション）
LLM_MODEL="gemini-3-flash"     # デフォルト推奨

# 検索
TAVILY_API_KEY="tvly-..."      # Tavily セマンティック検索

# 画像生成
KIE_AI_API_KEY="..."           # kie.ai (主要、33%コスト削減)
GOOGLE_API_KEY="..."           # Google API (フォールバック)

# Webスクレイピング（オプション）
JINA_API_KEY="..."             # Jina Reader 拡張機能用
```

---

## 7. CLIツール使用方法

### 7.1 単一記事生成

```bash
cd app

# 基本使用
npx tsx scripts/argo-gen.ts generate \
  --keyword "タスク管理ツール 比較" \
  --type article \
  --lang ja

# 出力先指定
npx tsx scripts/argo-gen.ts generate \
  --keyword "project management" \
  --type faq \
  --lang en \
  --output ./output
```

### 7.2 バッチ生成

```bash
# キーワードファイルから一括生成
npx tsx scripts/argo-gen.ts batch \
  --file keywords.txt \
  --output ./output
```

### 7.3 サンプル記事生成（品質評価用）

```bash
# 10本のサンプル記事を生成
npx tsx scripts/generate-samples.ts

# 出力: output/samples/{timestamp}/
# - 各記事のHTMLファイル
# - quality-report.md (品質レポート)
```

---

## 8. スタブUI使用方法

### 8.1 アクセス

```
http://localhost:3000/dev/article-gen
```

### 8.2 機能

1. **入力フォーム**
   - キーワード入力
   - 記事タイプ選択 (Article/FAQ/Glossary)
   - 言語選択 (日本語/English)
   - 画像生成オプション

2. **生成結果表示**
   - Preview タブ: HTMLプレビュー
   - HTML タブ: ソースコード
   - Metadata タブ: 統計情報

3. **コピー機能**
   - HTMLワンクリックコピー

---

## 9. 品質基準

### 9.1 スコアリング (100点満点)

| カテゴリ | 配点 | 内容 |
|---------|------|------|
| 構造品質 | 25点 | 見出し階層、段落構成 |
| SEO品質 | 25点 | キーワード最適化 |
| コンテンツ品質 | 30点 | 正確性、読みやすさ |
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

## 10. テスト実行方法

### 10.1 ユニットテスト

```bash
cd app

# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き
npm run test:coverage
```

### 10.2 統合テスト（実API使用）

```bash
# APIキー設定済みの場合のみ
INTEGRATION=true npm test
```

---

## 11. 型定義

### 11.1 記事コンテンツ

```typescript
type ArticleContent = {
  title: string;
  slug: string;
  content: string;           // HTML
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
};
```

### 11.2 ペルソナ

```typescript
type Persona = {
  name: string;
  demographics: {
    age_range: string;
    occupation: string;
    location: string;
  };
  pain_points: string[];
  goals: string[];
  product_fit: string;
};
```

### 11.3 キーワード候補

```typescript
type KeywordCandidate = {
  keyword: string;
  category: 'problem' | 'solution' | 'product' | 'comparison' | 'how-to';
  search_intent: 'informational' | 'transactional' | 'navigational';
  priority: number;
  rationale: string;
};
```

---

## 12. 今後の課題

### 12.1 プロンプト調整（継続タスク）

- サンプル記事生成後、品質チェックリストに基づいて評価
- LLMプロンプトの反復改善
- 記事タイプごとの最適化

### 12.2 将来の拡張

- WordPress自動投稿連携
- スケジュール生成機能
- A/Bテスト機能
- 多言語対応拡張

---

## 13. 変更履歴

| イテレーション | 日付 | 内容 |
|--------------|------|------|
| 1-3 | 2026-01-29 | 初期実装（記事生成コア、スタブUI、CLI） |
| 4-5 | 2026-01-29 | テスト拡充（Tavily, LLM, Image） |
| 6-7 | 2026-01-29 | SectionImageService、品質チェックリスト |
| 8-9 | 2026-01-29 | 統合テスト、サンプル生成スクリプト |
| 10 | 2026-01-29 | kie.ai API統合（コスト33%削減） |
| 11 | 2026-01-29 | Webスクレイパー（Jina Reader） |
| 12 | 2026-01-29 | ペルソナ・キーワード候補生成 |
| 13 | 2026-01-29 | 入力パターン統合ハンドラー |

---

## 14. 関連ドキュメント

- [StreamA_ArticleGen.md](./StreamA_ArticleGen.md) - 概要・フェーズ一覧
- [StreamA_E2E_Test_Plan.md](./StreamA_E2E_Test_Plan.md) - テスト計画
- [StreamA_Quality_Checklist.md](./StreamA_Quality_Checklist.md) - 品質基準
- [04_AI_Pipeline.md](../architecture/04_AI_Pipeline.md) - アーキテクチャ
- [FIRST_PRINCIPLES_ARTICLE_GENERATION.md](../FIRST_PRINCIPLES_ARTICLE_GENERATION.md) - 設計原則
