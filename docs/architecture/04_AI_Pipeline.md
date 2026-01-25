# 04. AIパイプライン・ジョブシステム

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [シーケンス図](./05_Sequence_Diagrams.md)
> **実装フェーズ:** [Phase 2: Core AI](../phases/Phase2_CoreAI.md), [Phase 4: Automation](../phases/Phase4_Automation.md), [Phase 7: Visual](../phases/Phase7_Visual.md), [Phase 10: GSC連携](../phases/Phase10_GSCIntegration.md)

ブログ記事の品質と継続性を担保するAI処理系の設計です。

**ジョブ実行基盤:** Inngest（長時間処理・自動リトライ対応）

## 基本フロー (The Pipeline)

**実行環境:** Inngest（ステップ単位で実行、失敗時自動リトライ）

1.  **Analyst (分析):**
    - **Input:** プロダクトURL
    - **Tool:** **Firecrawl**（プライマリ）/ **Jina Reader**（フォールバック）+ Claude
    - **Output:** ターゲットペルソナ、競合分析、キーワード戦略、記事クラスター案
    - **フォールバック:** 両API失敗時はユーザー手動入力を依頼

2.  **Planner (構成):**
    - **Input:** 記事テーマ（キーワード）
    - **Tool:** Tavily API (検索) + Claude
    - **Output:** 記事構成案（H2, H3見出し）、参照すべきURLリスト、**参照ソース明示**

3.  **Writer (執筆):**
    - **Input:** 構成案 + 参照情報
    - **Tool:** **Claude 3.5 Sonnet**（GPT-4o-miniフォールバック）
    - **Output:** 本文（Markdown/HTML）、メタディスクリプション

4.  **Editor (推敲・校正):**
    - **Input:** 初稿
    - **Tool:** Claude
    - **Output:** HTMLタグの整合性チェック、プロダクト導線の自然さチェック
    - **注意:** Fact Checkはユーザー責任（利用規約に明記）

5.  **Illustrator (画像):**
    - **Input:** 記事タイトル・要約
    - **Tool:** **Unsplash/Pexels API**（MVP）→ DALL-E 3（Phase 7）
    - **Output:** アイキャッチ画像 (URL)

## LLMモデル戦略（確定）

**LiteLLMプロキシ**を使用し、複数LLMの切り替えを容易化。

- **Claude 3.5 Sonnet（メイン）:**
  - **役割:** 全フェーズのメインライター
  - **選定理由:** 長文生成品質、日本語能力、コストバランス
- **GPT-4o-mini（フォールバック）:**
  - **役割:** Claude APIダウン時またはレート制限時の代替
  - **選定理由:** 低コスト、高速、品質も許容範囲

**フォールバック条件:**
- Claude APIエラー（5xx）
- レート制限（429）
- タイムアウト（30秒）

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
