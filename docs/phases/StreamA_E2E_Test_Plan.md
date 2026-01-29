# Stream A: E2E Test Plan

> **最終更新:** 2026-01-29 (イテレーション14)
> **テスト実行状況:** 127/127 テストパス (+10 統合テスト)
> **品質チェックリスト:** [StreamA_Quality_Checklist.md](./StreamA_Quality_Checklist.md)

---

## 1. テスト概要

### 1.1 テスト対象

| コンポーネント | ファイル | テスト状態 | カバレッジ |
|---------------|----------|-----------|-----------|
| ArticleGenerator | `article-generator.ts` | ✅ 14テスト合格 | 90.74% |
| TavilyClient | `tavily-client.ts` | ✅ 19テスト合格 | 98.21% |
| LLMClient | `llm-client.ts` | ✅ 15テスト合格 | 94.28% |
| ImageGenerator | `image-generator.ts` | ✅ 20テスト合格 | 98.55% |
| SectionImageService | `section-image-service.ts` | ✅ 19テスト合格 | 100% |
| WebScraper | `web-scraper.ts` | ✅ 14テスト合格 | - |
| ArticleInputHandler | `article-input-handler.ts` | ✅ 13テスト合格 | - |

### 1.2 テスト構成

```
app/src/lib/ai/__tests__/
├── article-generator.test.ts       # 14テスト
├── tavily-client.test.ts           # 19テスト
├── llm-client.test.ts              # 15テスト
├── image-generator.test.ts         # 20テスト
├── section-image-service.test.ts   # 19テスト
├── web-scraper.test.ts             # 14テスト
├── article-input-handler.test.ts   # 13テスト
└── integration.test.ts             # 10テスト (API必要、通常スキップ)

app/scripts/__tests__/
└── argo-gen.test.ts                # 12テスト
```

---

## 2. テストケース一覧

### 2.1 ArticleGenerator.generate()

| ID | テスト名 | 検証内容 | 状態 |
|----|---------|---------|------|
| G-01 | should generate a complete article without images | 画像なしで完全な記事生成 | ✅ |
| G-02 | should generate an article with images when includeImages is true | 画像あり記事生成 | ✅ |
| G-03 | should handle Japanese language | 日本語対応 | ✅ |
| G-04 | should generate FAQ type article | FAQ形式記事生成 | ✅ |
| G-05 | should generate Glossary type article | Glossary形式記事生成 | ✅ |

### 2.2 ArticleGenerator メソッド

| ID | テスト名 | 検証内容 | 状態 |
|----|---------|---------|------|
| M-01 | research() should return research context | リサーチ結果取得 | ✅ |
| M-02 | generateOutline() should generate article outline | アウトライン生成 | ✅ |
| M-03 | generateMetaDescription() should generate under 160 chars | メタディスクリプション生成 | ✅ |

### 2.3 出力検証

| ID | テスト名 | 検証内容 | 状態 |
|----|---------|---------|------|
| O-01 | should produce valid HTML structure | HTML構造検証 | ✅ |
| O-02 | should include all required ArticleContent fields | 必須フィールド検証 | ✅ |

### 2.4 TavilyClient テスト

| ID | テスト名 | 検証内容 | 状態 |
|----|---------|---------|------|
| T-01 | should make a search request with correct parameters | 検索リクエスト検証 | ✅ |
| T-02 | should handle 401 unauthorized error | 認証エラー処理 | ✅ |
| T-03 | should handle 429 rate limit error | レートリミット処理 | ✅ |
| T-04 | should handle 432 insufficient credits error | クレジット不足処理 | ✅ |
| T-05 | should filter results by minimum score | スコアフィルタ検証 | ✅ |
| T-06 | should use default minimum score | デフォルトスコア検証 | ✅ |
| T-07 | should format results with section title | 結果フォーマット検証 | ✅ |
| T-08 | should limit to 3 results | 結果数制限検証 | ✅ |
| T-09 | should execute 3-phase search | マルチフェーズ検索検証 | ✅ |
| T-10 | should handle individual phase failures gracefully | 部分的障害対応検証 | ✅ |
| T-11 | should use multi-phase search for article research | 記事リサーチ検証 | ✅ |

### 2.5 LLMClient テスト

| ID | テスト名 | 検証内容 | 状態 |
|----|---------|---------|------|
| L-01 | should use provided options | カスタムオプション検証 | ✅ |
| L-02 | should use default values when options not provided | デフォルト値検証 | ✅ |
| L-03 | should make a completion request with correct parameters | 完了リクエスト検証 | ✅ |
| L-04 | should use custom temperature and maxTokens | パラメータカスタム検証 | ✅ |
| L-05 | should handle API errors | APIエラー処理 | ✅ |
| L-06 | should return empty string when no content | 空レスポンス処理 | ✅ |
| L-07 | should format messages correctly | メッセージフォーマット検証 | ✅ |
| L-08 | should parse valid JSON response | JSON解析検証 | ✅ |
| L-09 | should strip markdown code blocks | コードブロック除去検証 | ✅ |
| L-10 | should strip generic code blocks | 汎用コードブロック除去検証 | ✅ |
| L-11 | should throw error on invalid JSON | JSON解析エラー検証 | ✅ |
| L-12 | should include JSON instruction in system prompt | JSONインストラクション検証 | ✅ |
| L-13 | ARTICLE_PROMPTS.OUTLINE check | プロンプト定数検証 | ✅ |
| L-14 | ARTICLE_PROMPTS.CONTENT check | プロンプト定数検証 | ✅ |
| L-15 | ARTICLE_PROMPTS.META_DESCRIPTION check | プロンプト定数検証 | ✅ |

---

## 3. テスト実行方法

```bash
# 全テスト実行（統合テストはスキップ）
cd app && npm test

# ウォッチモード
cd app && npm run test:watch

# カバレッジ付き
cd app && npm run test:coverage

# 統合テスト実行（APIキー必要）
cd app && INTEGRATION=true npm test

# 必要な環境変数
# TAVILY_API_KEY: Tavily APIキー
# GOOGLE_API_KEY: Google API キー（Gemini LLM/画像生成用）
```

---

## 4. モック戦略

### 4.1 外部API モック

```typescript
// Tavily API
vi.mock('../tavily-client', () => ({
  tavilyClient: {
    researchForArticle: vi.fn().mockResolvedValue('...')
  }
}));

// LLM API
vi.mock('../llm-client', () => ({
  llmClient: {
    jsonPrompt: vi.fn().mockResolvedValue({...}),
    complete: vi.fn().mockResolvedValue('...'),
    prompt: vi.fn().mockResolvedValue('...')
  }
}));

// 画像生成
vi.mock('../image-generator', () => ({
  imageGenerator: {
    generateThumbnail: vi.fn().mockResolvedValue({...})
  }
}));
```

### 4.2 モックを使う理由

1. **外部API依存を排除**: Tavily, LLM, NanoBanana APIへの実際の呼び出しを避ける
2. **テスト速度向上**: APIレスポンスを待たずに即座にテスト完了
3. **コスト削減**: API呼び出し料金が発生しない
4. **再現性確保**: 同じ結果を常に得られる

---

## 5. 追加予定テスト

### 5.1 エラーハンドリングテスト

| ID | テスト名 | 優先度 |
|----|---------|--------|
| E-01 | should handle Tavily API failure gracefully | 高 |
| E-02 | should handle LLM API timeout | 高 |
| E-03 | should handle image generation failure | 中 |
| E-04 | should retry on transient errors | 中 |

### 5.2 パフォーマンステスト

| ID | テスト名 | 優先度 |
|----|---------|--------|
| P-01 | should complete generation within 5 minutes | 高 |
| P-02 | should handle concurrent generations | 中 |

### 5.3 統合テスト（実API使用）

| ID | テスト名 | 優先度 | 備考 |
|----|---------|--------|------|
| I-01 | should generate real article with Tavily | 低 | APIキー必要 |
| I-02 | should generate real article with LLM | 低 | APIキー必要 |

---

## 6. スタブUI テスト

### 6.1 手動テスト手順

1. `npm run dev` でサーバー起動
2. `http://localhost:3000/dev/article-gen` にアクセス
3. フォームに入力して「記事を生成」ボタンクリック
4. 結果の確認（Preview / HTML / Metadata タブ）

### 6.2 検証項目

- [ ] 入力フォームが正常に表示される
- [ ] バリデーションが機能する（キーワード必須）
- [ ] ローディング状態が表示される
- [ ] 結果がプレビュータブに表示される
- [ ] HTMLタブでソースが表示される
- [ ] Metadataタブで統計情報が表示される
- [ ] コピーボタンが機能する

---

## 7. CLIツール テスト

### 7.1 コマンドテスト

```bash
# ヘルプ表示
cd app && npx tsx scripts/argo-gen.ts help

# 記事生成（モック環境では動作しない - 実API必要）
cd app && npx tsx scripts/argo-gen.ts generate --keyword "テスト" --type article --lang ja
```

### 7.2 検証項目

- [ ] help コマンドが正常に表示される
- [ ] 引数パースが正常に動作する
- [ ] 出力ファイルが正しく生成される
- [ ] エラーハンドリングが適切

---

## 8. テスト結果サマリー

### 2026-01-29 実行結果（イテレーション8）

```
 Test Files  7 passed (7)
      Tests  100 passed | 10 skipped (110)
   Start at  00:58:37
   Duration  1.33s
```

### テスト内訳

| ファイル | テスト数 | 状態 |
|---------|---------|------|
| article-generator.test.ts | 14 | ✅ |
| tavily-client.test.ts | 19 | ✅ |
| llm-client.test.ts | 15 | ✅ |
| image-generator.test.ts | 20 | ✅ |
| section-image-service.test.ts | 19 | ✅ |
| argo-gen.test.ts | 12 | ✅ |
| integration.test.ts | 1 (+10スキップ) | ✅ |

### カバレッジ目標

| 対象 | 目標 | 現状 |
|------|------|------|
| article-generator.ts | 80% | ✅ 90.74% |
| llm-client.ts | 80% | ✅ 94.28% |
| tavily-client.ts | 80% | ✅ 98.21% |
| image-generator.ts | 80% | ✅ 98.55% |
| section-image-service.ts | 80% | ✅ 100% |
| 統合テスト | 主要フロー100% | ✅ 完了 |
| E2Eテスト | Happy Path 100% | ✅ モック環境完了 |

---

## 9. 今後の改善計画

### 完了項目 (イテレーション6)
- ✅ TavilyClient ユニットテスト追加 (19テスト, 98.21%カバレッジ)
- ✅ LLMClient ユニットテスト追加 (15テスト, 94.28%カバレッジ)
- ✅ ArticleGenerator テスト (14テスト, 90.74%カバレッジ)
- ✅ ImageGenerator テスト追加 (20テスト, 98.55%カバレッジ)
- ✅ SectionImageService テスト追加 (19テスト, 100%カバレッジ)
- ✅ エラーケース追加 (API障害、JSON解析エラー等)
- ✅ 画像生成のフォールバック処理テスト
- ✅ WordPress連携テスト

### 残作業
1. **実API統合テスト**: ✅ 実装完了（`INTEGRATION=true` で実行可能）
2. **パフォーマンス計測**: 生成時間のベンチマーク
3. **サンプル記事生成**: 品質評価用に10本生成
