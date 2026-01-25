# 04. AIパイプライン・ジョブシステム

ブログ記事の品質と継続性を担保するAI処理系の設計です。

## 基本フロー (The Pipeline)

1.  **Analyst (分析):**
    - **Input:** プロダクトURL
    - **Tool:** Firecrawl (Web Scraper) + LLM
    - **Output:** ターゲットペルソナ、競合分析、キーワード戦略、記事クラスター案

2.  **Planner (構成):**
    - **Input:** 記事テーマ（キーワード）
    - **Tool:** Tavily API (検索) + LLM
    - **Output:** 記事構成案（H2, H3見出し）、参照すべきURLリスト

3.  **Writer (執筆):**
    - **Input:** 構成案 + 参照情報
    - **Tool:** LLM (Gemini / Claude / GPT)
    - **Output:** 本文（Markdown/HTML）、メタディスクリプション

4.  **Editor (推敲・校正):**
    - **Input:** 初稿
    - **Tool:** LLM
    - **Output:** HTMLタグの整合性チェック、プロダクト導線の自然さチェック

5.  **Illustrator (画像):**
    - **Input:** 記事タイトル・要約
    - **Tool:** DALL-E 3 / NanoBananaPro
    - **Output:** アイキャッチ画像 (URL)

## LLMモデル戦略 (Soft-coded)

特定のモデルに依存しない「アダプターパターン」を採用します。

- **Gemini 1.5 Pro/Flash:**
  - **役割:** デフォルトのメインライター。コストパフォーマンスと長文耐性が高い。
- **Claude 3.5 Sonnet:**
  - **役割:** 構成案作成、推敲（日本語の自然さ、論理構成に強いため）。
- **OpenAI GPT-4o:**
  - **役割:** バックアップ、または特定タスク（Function Calling等）で精度が必要な場合。

## スケジューリングシステム (MVP重視)

「毎日定時」だけでなく、ユーザー定義の柔軟なスケジュールに対応します。

- **Custom Schedule:** `Cron Expression` をユーザーごとに生成してDBに保存。
- **Batch Processing:** 1時間に1回、その時間に投稿すべきジョブがあるかをスキャンしてキューに積む方式（Polling Dispatcher）。
  - これにより、個別のCronタスクを大量に登録する必要がなくなる。

## コンテキスト管理 (RAG的な要素)

過去に書いた記事の内容と重複しないように、または内部リンクを貼るために、過去記事のメタデータ（タイトル、Slug、要約）をVector Store (pgvector on Neon) に保存することも検討します（Future）。
MVPでは、「直近10記事のタイトルリスト」をプロンプトに含める簡易的な重複防止策をとります。
