# Stream A: Article Generation（記事生成モジュール）

> **上位ドキュメント:** [開発哲学](../DEVELOPMENT_PHILOSOPHY.md) - 本モジュールはこの思想に従う
>
> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [AIパイプライン仕様](../architecture/04_AI_Pipeline.md) | [ファーストプリンシプル分析](../FIRST_PRINCIPLES_ARTICLE_GENERATION.md)
> **詳細実装計画:** [StreamA_Implementation_Plan.md](./StreamA_Implementation_Plan.md)
> **E2Eテスト計画:** [StreamA_E2E_Test_Plan.md](./StreamA_E2E_Test_Plan.md)
> **品質チェックリスト:** [StreamA_Quality_Checklist.md](./StreamA_Quality_Checklist.md)
>
> **依存関係:** なし（スタンドアローン）
> **統合先:** `/app/src/lib/ai/`
> **コードベース:** `/stream-a/`
> **最終更新:** 2026-01-30

**テーマ:** Intelligent Engine
**目的:** 統合を前提として、AI記事生成エンジンを単体で構築・テスト

---

## 設計方針

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stream A: スタンドアローン構成                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  入力                     処理                      出力         │
│  ──────                 ──────                   ──────         │
│  - プロダクトURL    →   AI記事生成エンジン    →   - 記事HTML     │
│  - 商品情報                                      - メタデータJSON │
│  - キーワード                                    - 画像（後続）   │
│                                                                 │
│  ──────────────────────────────────────────────────────────────  │
│                                                                 │
│  検証用UI（スタブ）                                               │
│  - 入力フォーム                                                  │
│  - 生成結果プレビュー                                             │
│  - CLIツール                                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**重要:** このストリームはWordPress連携なしで動作確認できる状態を目指す

---

## フェーズ一覧

### A-1: プロダクト分析エンジン

**ゴール:** URL/テキストから商品情報を抽出

| タスク | 成果物 | 状態 |
|--------|--------|------|
| URL入力→情報抽出ロジック | `analyze-product.ts` | ✅ 完了 |
| Jina Reader統合 | スクレイピング機能 (`web-scraper.ts`) | ✅ 完了 |
| ペルソナ・キーワード候補生成 | LLM呼び出し (`product-analyzer.ts`) | ✅ 完了 |

**出力例:**
```json
{
  "product_name": "TaskFlow",
  "target_persona": {
    "role": "スタートアップのプロダクトマネージャー",
    "pain_points": ["タスク管理の煩雑さ", "チーム間の情報共有"]
  },
  "keyword_clusters": [
    { "pillar": "タスク管理ツール比較", "articles": ["Notion vs TaskFlow"] }
  ]
}
```

---

### A-2: 記事生成コア

**ゴール:** 商品情報→ブログ記事HTMLを生成

| タスク | 成果物 | 状態 |
|--------|--------|------|
| Tavily APIでリサーチ | 最新情報取得 | ✅ 完了 (78.57%カバレッジ) |
| LLM記事生成ロジック | `article-generator.ts` | ✅ 完了 (90.74%カバレッジ) |
| 3種類フォーマット対応 | Article/FAQ/Glossary | ✅ 完了 |
| 見出し画像生成（kie.ai + Googleフォールバック） | 画像生成統合 | ✅ 完了 |

**記事タイプ:**
| タイプ | 目的 | 文字数目安 |
|--------|------|-----------|
| Article | 深度のある解説記事 | 3,000〜4,000 |
| FAQ | 検索ユーザーの直接的な疑問に回答 | 1,500〜2,500 |
| Glossary | 業界用語の解説 | 1,000〜2,000 |

---

### A-3: スタブUI作成

**ゴール:** 生成結果を確認できるシンプルなUIを作成

| タスク | 成果物 | 状態 |
|--------|--------|------|
| 入力フォーム | URL/テキスト入力 | ✅ 完了 |
| 生成結果プレビュー | HTMLレンダリング | ✅ 完了 |
| メタデータ表示 | JSON表示 | ✅ 完了 |

**アクセス:** `http://localhost:3000/dev/article-gen`

**実装ファイル:**
- `app/src/app/dev/article-gen/page.tsx`
- `app/src/app/dev/article-gen/actions.ts`

---

### A-4: CLIツール

**ゴール:** コマンドラインから記事生成を実行

| タスク | 成果物 | 状態 |
|--------|--------|------|
| CLI実装 | `npx tsx scripts/argo-gen.ts` | ✅ 完了 |
| 出力オプション | --output html/json | ✅ 完了 |
| バッチ処理 | 複数URL一括生成 | ✅ 完了 |

**実装ファイル:** `app/scripts/argo-gen.ts`

**使用例:**
```bash
# 単一URL
npx argo-gen https://example.com/product --output ./output

# バッチ処理
npx argo-gen --batch urls.txt --output ./output
```

---

### A-5: 品質検証

**ゴール:** 生成記事の品質評価・調整

| タスク | 成果物 | 状態 |
|--------|--------|------|
| ユニットテスト作成 | Vitest | ✅ 完了 (127テスト) |
| E2Eテスト計画 | テスト計画書 | ✅ 完了 |
| TavilyClient テスト | 19テスト | ✅ 完了 |
| LLMClient テスト | 15テスト | ✅ 完了 |
| ArticleGenerator テスト | 14テスト | ✅ 完了 |
| ImageGenerator テスト | 20テスト | ✅ 完了 |
| 統合テスト | 10テスト (APIキー必要) | ✅ 完了 |
| SectionImageService テスト | 19テスト | ✅ 完了 |
| CLI テスト | 12テスト | ✅ 完了 |
| サンプル記事10本生成 | 評価用記事 | ✅ スクリプト準備完了 |
| 品質チェックリスト作成 | 評価基準 | ✅ 完了 |
| プロンプト調整 | 品質改善 | ⬜ 未完了 |

**テスト実行:** `cd app && npm test`

**統合テスト実行:** `cd app && INTEGRATION=true npm test`

**サンプル記事生成:**
```bash
# 10本のサンプル記事を生成（APIキー必要）
cd app && npx tsx scripts/generate-samples.ts

# キーワードファイル: scripts/sample-keywords.txt
# 出力先: output/samples/<timestamp>/
# 品質レポート: quality-report.md
```

**カバレッジ結果:**
| ファイル | カバレッジ |
|---------|-----------|
| article-generator.ts | 90.74% |
| llm-client.ts | 94.28% |
| tavily-client.ts | 98.21% |
| image-generator.ts | 98.55% |
| section-image-service.ts | 100% |

**品質チェック項目:**
- [ ] 適切な見出し構造（H2/H3）
- [ ] リスト・表の適切な使用
- [ ] 参照URLの明示
- [ ] ハルシネーションがないか
- [ ] 読みやすさ（文字数、段落分け）

---

## 技術スタック

| コンポーネント | 技術 | 状態 |
|---------------|------|------|
| Runtime | Node.js / TypeScript | ✅ |
| LLM | Gemini 2.0 Flash (via LiteLLM) | ✅ |
| Semantic Search | Tavily API | ✅ |
| Web Scraping | Jina Reader API | ✅ |
| Image Generation | kie.ai NanoBanana Pro (primary) + Google API (fallback) | ✅ |
| Testing | Vitest | ✅ |

---

## 成功基準

1. **スタンドアローン動作:** WordPress接続なしで記事生成が完了する
2. **品質:** 「読んで価値のある」記事が生成される
3. **速度:** 1記事あたり5分以内に生成完了
4. **再現性:** 同じ入力で一貫した品質の出力

---

## 出力仕様

### 記事HTML
```html
<article>
  <h1>タイトル</h1>
  <p>リード文...</p>
  <h2>見出し1</h2>
  <p>本文...</p>
  ...
</article>
```

### メタデータJSON
```json
{
  "title": "記事タイトル",
  "slug": "article-slug",
  "excerpt": "要約文",
  "keywords": ["キーワード1", "キーワード2"],
  "type": "article",
  "word_count": 3500,
  "sources": ["https://source1.com", "https://source2.com"],
  "generated_at": "2026-01-29T12:00:00Z"
}
```

---

## 旧ドキュメントとの対応

| 旧Phase | 対応 |
|---------|------|
| [Phase 2: Core AI](./Phase2_CoreAI.md) | A-1, A-2 |
