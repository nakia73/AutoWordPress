# Phase 2: Core AI（AIコア機能）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [AIパイプライン仕様](../architecture/04_AI_Pipeline.md) | [バックエンド仕様](../architecture/02_Backend_Database.md)
> **前のフェーズ:** [← Phase 1: Infrastructure + Auth](./Phase1_Infrastructure.md) | **次のフェーズ:** [Phase 3: User Interface →](./Phase3_UserInterface.md)
>
> **実施週:** Week 2

**テーマ:** Intelligent Engine
**ゴール:** 「プロダクトURLを入力するだけで、適切なターゲットを分析し、最適なSEO記事を生成してWordPressに投稿する」という一連のコアフローを実現する。

---

## 1. 目的

インフラという「器」に対し、サービスの付加価値の源泉である「コンテンツ作成能力」を実装します。単なる文章生成ではなく、**「ビジネスに寄与する戦略的コンテンツ」**を自動で生み出すことが狙いです。

---

## 2. 実装ステップ

### Step 1: プロダクト分析エンジン (Firecrawl + LLM)

- **Firecrawl API**（プライマリ）/ **Jina Reader**（フォールバック）を使用して、ユーザーが入力したURLからサイト全体の文字情報をスクレイピング。
- 取得した情報を **Gemini 3.0 Pro**（ソフトコーディング）に渡し、以下の属性を抽出。
  - **ターゲット像:** 誰がそのプロダクトを使うべきか（ペルソナ）。
  - **キーワード:** どのような検索意図でプロダクトが発見されるべきか。
  - **記事クラスター案:** サイト全体のSEO評価を上げるための関連トピック群。

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

### Step 2: リアルタイム・リサーチ (Tavily API)

- AIが執筆を開始する前に、Tavily API を用いてインターネット上の最新情報を検索。
- 最新のトレンド、統計データ、競合の動向を取り込むことで、ハルシネーション（嘘の生成）を防ぎ、情報の鮮度と信頼性を担保する。

### Step 3: 多角的なコンテンツ生成

記事クラスターに基づき、以下の3種類のフォーマットを生成。

| タイプ | 目的 | 文字数目安 |
|--------|------|-----------|
| **Article** | 深度のある解説記事 | 3,000〜4,000 |
| **FAQ** | 検索ユーザーの直接的な疑問に回答（構造化データ付き） | 1,500〜2,500 |
| **Glossary** | 業界用語の解説、専門用語でのSEO流入 | 1,000〜2,000 |

**品質管理:** 生成した記事に対し、再度LLMで「事実確認（Fact Check）」を行い、根拠となる参照URLを記事末尾に付与。

### Step 4: WordPress REST API 連携

- 生成された記事（HTML形式）を、WordPressのREST API経由で各ユーザーのサイトへ投稿。
- 初期設定として「下書き」状態で投稿し、ユーザーが内容を確認できるようにする。

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

## 3. 技術スタック

| コンポーネント | 技術 |
|---------------|------|
| Web Scraping | **Firecrawl API** (primary) + Jina Reader (fallback) |
| Semantic Search | Tavily API |
| LLM | **Gemini 3.0 Pro** (via LiteLLM) ※ソフトコーディング |
| Worker/Queue | **Inngest** (長時間処理・自動リトライ対応) |
| Database | **Supabase (PostgreSQL)** |

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

- プロダクトURL入力から10分以内に、WordPressに「読んで価値のある」記事が投稿されていること。
- 記事内に適切な見出し、リスト、参照URLが含まれていること。

---

## 7. 次のステップ

AIエンジンが動作したら、**Phase 3: User Interface** でユーザーがこれを操作できる画面を実装する。
