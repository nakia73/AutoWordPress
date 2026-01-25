# 04. AIパイプライン・ジョブシステム

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [シーケンス図](./05_Sequence_Diagrams.md)
> **実装フェーズ:** [Phase 2: Core AI](../phases/Phase2_CoreAI.md), [Phase 4: Automation](../phases/Phase4_Automation.md), [Phase 7: Visual](../phases/Phase7_Visual.md), [Phase 10: GSC連携](../phases/Phase10_GSCIntegration.md)

ブログ記事の品質と継続性を担保するAI処理系の設計です。

**ジョブ実行基盤:** Inngest（長時間処理・自動リトライ対応）

## 基本フロー (The Pipeline)

**実行環境:** Inngest（ステップ単位で実行、失敗時自動リトライ）

1.  **Analyst (分析) - 複数入力方式対応:**
    - **Input:** 以下のいずれか（ユーザーが選択）
      - **A. URLクロール方式:** プロダクトURLを入力 → Firecrawl/Jina Readerで情報取得
      - **B. インタラクティブ方式:** ユーザーへの質問形式で情報収集（明確なプロダクトがない場合）
      - **C. 競合調査方式:** Tavily Search APIで市場調査 → LLMで解釈・整理
    - **Tool:**
      - 方式A: **Firecrawl**（プライマリ）/ **Jina Reader**（フォールバック）+ LLM
      - 方式B: LLMによる対話的質問生成 + ユーザー入力
      - 方式C: **Tavily Search API** → LLM解釈（必須フロー）
    - **Output:** ターゲットペルソナ、競合分析、キーワード戦略、記事クラスター案
    - **フォールバック:** 方式Aで両API失敗時は方式Bに自動切り替え

2.  **Researcher (競合・市場調査) - NEW:**
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
    - **Tool:** **Gemini 3.0 Pro**（ソフトコーディング、ユーザー変更可）
    - **Output:** 本文（Markdown/HTML）、メタディスクリプション

5.  **Editor (推敲・校正):**
    - **Input:** 初稿
    - **Tool:** LLM（設定に従う）
    - **Output:** HTMLタグの整合性チェック、プロダクト導線の自然さチェック
    - **注意:** Fact Checkはユーザー責任（利用規約に明記）

5.  **Illustrator (画像):**
    - **Input:** 記事タイトル・要約
    - **Tool:** **Unsplash/Pexels API**（MVP）→ DALL-E 3（Phase 7）
    - **Output:** アイキャッチ画像 (URL)

## LLMモデル戦略（確定）

**重要設計原則: ソフトコーディング**
LLMモデルは**ハードコードしてはならない**。環境変数または設定ファイルによりモデルを後から切り替えられる設計とする。これにより、モデルの性能向上・価格変更・新モデルリリースに柔軟に対応可能。

**LiteLLMプロキシ**を使用し、モデル切り替えを容易化。

- **Gemini 3.0 Pro（標準採用）:**
  - **役割:** 全フェーズのメインライター
  - **選定理由:** 長文生成品質、日本語能力、コストパフォーマンス、高速応答
  - **設定:** `LLM_MODEL=gemini-3.0-pro`

**モデル設定例（環境変数）:**
```env
LLM_MODEL=gemini-3.0-pro
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
- タイムアウト：10分/記事
- リトライ回数：最大3回
- リトライ間隔：指数バックオフ（1分→5分→15分）
- 最終失敗時：メール通知 + ダッシュボード表示

## プロンプト管理

**MVP:** `config/prompts/*.yaml` + Git管理
**Phase 2以降:** Langfuse（A/Bテスト、品質モニタリング）

## コンテキスト管理 (RAG的な要素)

過去に書いた記事の内容と重複しないように、または内部リンクを貼るために、過去記事のメタデータ（タイトル、Slug、要約）をVector Store (pgvector on Supabase) に保存することも検討します（Future）。
MVPでは、「直近10記事のタイトルリスト」をプロンプトに含める簡易的な重複防止策をとります。
