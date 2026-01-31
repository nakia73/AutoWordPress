# Phase 2: Core AI（AIコア機能）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [AIパイプライン仕様](../architecture/04_AI_Pipeline.md) | [ファーストプリンシプル分析](../FIRST_PRINCIPLES_ARTICLE_GENERATION.md) | [バックエンド仕様](../architecture/02_Backend_Database.md)
> **前のフェーズ:** [← Phase 1: Infrastructure + Auth](./Phase1_Infrastructure.md) | **次のフェーズ:** [Phase 3: User Interface →](./Phase3_UserInterface.md)
> **詳細実装:** [Stream A: Article Generation](./StreamA_ArticleGen.md) | [実装報告書](./StreamA_Implementation_Report.md)
>
> **実施週:** Week 2 | **実装状況:** ✅ Stream A 完了（127テスト パス）

**テーマ:** Intelligent Engine
**ゴール:** 「プロダクト情報を入力し、AIが記事を生成してWordPressに投稿する」という一連のコアフローを実現する。

---

## 0. 実装状況サマリー（2026-01-29更新）

> **Stream A: Article Generation** として実装完了

| コンポーネント | 状態 | テスト | カバレッジ |
|---------------|------|--------|-----------|
| article-generator.ts | ✅ 完了 | 14 | 90.74% |
| llm-client.ts | ✅ 完了 | 15 | 94.28% |
| tavily-client.ts | ✅ 完了 | 19 | 98.21% |
| image-generator.ts | ✅ 完了 | 20 | 98.55% |
| section-image-service.ts | ✅ 完了 | 19 | 100% |
| web-scraper.ts | ✅ 完了 | 14 | - |
| article-input-handler.ts | ✅ 完了 | 13 | - |
| **合計** | ✅ | **127テスト** | |

**検証用ツール:**
- スタブUI: `http://localhost:3000/dev/article-gen`
- CLI: `npx tsx scripts/argo-gen.ts`

---

## 1. 目的

インフラという「器」に対し、サービスの付加価値の源泉である「コンテンツ作成能力」を実装します。単なる文章生成ではなく、**「ビジネスに寄与する戦略的コンテンツ」**を自動で生み出すことが狙いです。

---

## 2. 実装ステップ

### Step 1: プロダクト情報入力

**MVP実装:**
- ユーザーがプロダクト情報（名称、概要、ターゲット等）を入力
- 入力情報をもとにLLMでペルソナ・キーワード候補を生成

**採用決定後（MVP内でも適用）:**
- Firecrawl API / Jina Readerを使用したURL自動クロール
- URLからサイト全体の情報を自動抽出

**出力例:**

```json
{
  "product_name": "TaskFlow",
  "target_persona": {
    "role": "スタートアップのプロダクトマネージャー",
    "pain_points": ["タスク管理の煩雑さ", "チーム間の情報共有"]
  },
  "keyword_clusters": [
    { "pillar": "タスク管理ツール比較", "articles": ["Notion vs TaskFlow", "無料タスク管理アプリ"] }
  ]
}
```

### Step 2: リアルタイム・リサーチ (Tavily API) ✅ 実装済み

**3段階マルチフェーズ検索:**
1. **Phase 1 - NEWS:** 最新ニュース（24時間以内）を取得
2. **Phase 2 - SNS:** X/Twitter, Redditでのリアルタイム反応を取得
3. **Phase 3 - OFFICIAL:** 公式・権威あるソースから情報を取得

**実装ファイル:** `app/src/lib/ai/tavily-client.ts`

- スコアフィルタリング（関連度0.6以上のみ採用）
- Tavily AI Summary（answer）の活用
- 最新のトレンド、統計データ、競合の動向を取り込み

### Step 3: 多角的なコンテンツ生成

記事クラスターに基づき、以下の3種類のフォーマットを生成。

| タイプ | 目的 | 文字数目安 |
|--------|------|-----------|
| **Article** | 深度のある解説記事 | 3,000〜4,000 |
| **FAQ** | 検索ユーザーの直接的な疑問に回答（構造化データ付き） | 1,500〜2,500 |
| **Glossary** | 業界用語の解説、専門用語でのSEO流入 | 1,000〜2,000 |

**品質管理:** 参照ソースを明示し、ユーザーが内容を確認・編集できる状態を提供。Fact Checkはユーザー責任（設計決定 2026-01-27）。

### Step 4: WordPress REST API 連携

- 生成された記事（HTML形式）を、WordPressのREST API経由で各ユーザーのサイトへ投稿。
- デフォルトは自動公開で投稿（ユーザー設定で下書きに変更可能）。

```typescript
// WordPress REST API経由で投稿
const response = await fetch(`https://${siteSlug}.argonote.app/wp-json/wp/v2/posts`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${wpToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: article.title,
    content: article.content,
    status: userSettings.autoPublish ? 'publish' : 'draft'
  })
});
```

---

## 3. 技術スタック（実装済み）

| コンポーネント | 技術 | 状態 |
|---------------|------|------|
| Semantic Search | **Tavily API**（3段階マルチフェーズ検索） | ✅ 実装済み |
| LLM | **Gemini 2.0 Flash** (via LiteLLM) | ✅ 実装済み |
| Image Generation | **kie.ai NanoBanana Pro**（主要）+ **Google API**（フォールバック） | ✅ 実装済み |
| Worker/Queue | **Inngest** (長時間処理・自動リトライ対応) | ✅ 実装済み |
| Database | **Supabase (PostgreSQL)** | ✅ 実装済み |
| Web Scraping | **Jina Reader API** | ✅ 実装済み |

---

## 4. データベース

本フェーズで使用するテーブル：
- `products` - プロダクト情報と分析結果
- `article_clusters` - 記事クラスター（キーワード群）
- `articles` - 生成記事データ
- `jobs` - 非同期ジョブ管理

**詳細スキーマ:** [バックエンド・DB仕様書](../architecture/02_Backend_Database.md#詳細スキーマ定義) を参照

---

## 5. セキュリティ & 実用性の考慮

- **APIレート制限:** 同時生成リクエストをInngestで管理し、API制限によるエラーを防ぐ。
- **機密保護:** スクレイピングで取得した情報を学習に利用せず、あくまで解析にのみ使用する。

---

## 6. 成功基準

| 基準 | 目標 | 達成状況 |
|------|------|---------|
| スタンドアローン動作 | WordPress接続なしで記事生成完了 | ✅ 達成 |
| 品質 | 「読んで価値のある」記事が生成される | ✅ 達成 |
| 速度 | 1記事あたり5分以内に生成完了 | ✅ 達成 |
| 再現性 | 同じ入力で一貫した品質の出力 | ✅ 達成 |
| テスト | 127テスト パス | ✅ 達成 |

---

## 7. 次のステップ

AIエンジンが動作したら、**Phase 3: User Interface** でユーザーがこれを操作できる画面を実装する。
