# Rapid-Note2 コード流用タスク一覧

> **作成日:** 2026年1月27日
> **最終更新:** 2026年1月27日 ✅ **全タスク完了**
> **目的:** Rapid-Note2フォルダ内の流用可能なコードをApp（Autoblog）に統合し、より良い実装を実現する
> **参照:** [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) J8（既存資産の活用）
> **完了レポート:** [RAPID_NOTE_INTEGRATION_SUMMARY.md](./RAPID_NOTE_INTEGRATION_SUMMARY.md)

---

## 実装完了サマリー

### App内（/app）の実装状況

| モジュール | ファイル | 状況 | 詳細 |
|-----------|---------|------|------|
| **LLM Client** | `llm-client.ts` | ✅ 実装済み | Gemini 2.0 Flash via LiteLLM |
| **Tavily検索** | `tavily-client.ts` | ✅ **強化完了** | 3段階マルチフェーズ検索（NEWS/SNS/OFFICIAL）実装 |
| **記事生成** | `article-generator.ts` | ✅ **統合完了** | 6ステップパイプライン（画像生成含む） |
| **プロダクト分析** | `product-analyzer.ts` | ✅ 実装済み | Phase A-E |
| **画像生成** | `image-generator.ts` | ✅ **新規実装** | NanoBanana Pro（gemini-3-pro-image-preview） |
| **セクション画像** | `section-image-service.ts` | ✅ **新規実装** | H2/H3見出しごとの画像自動挿入 |

### Rapid-Note2の流用可能な機能

| 機能 | ファイル | 流用価値 | 詳細 |
|------|---------|---------|------|
| **Tavily 3段階検索** | `src/research.py` | **高** | NEWS/SNS/OFFICIAL の3フェーズ検索 |
| **NanoBanana Pro画像生成** | `thumbnail_service.py` | **高** | サムネイル・日本語テロップ対応 |
| **セクション別画像生成** | `section_image_service.py` | **高** | H2/H3見出しごとの画像挿入 |
| **Claude統合** | `claude_generator.py` | **中** | 高品質記事生成（オプション） |

---

## 改善ポイント詳細

### 1. Tavily検索の強化

**現状の問題:**
- App内のtavily-client.tsは単純な検索のみ
- 関連度スコアフィルタリングなし
- time_range、ドメインフィルタリング未対応

**Rapid-Note2の優位点:**
```
1. 3段階検索（NEWS → SNS → OFFICIAL）
2. 関連度スコア閾値（min_relevance_score: 0.6）
3. Tavily AI Summary（answer）の活用
4. time_range対応（day, week, month, year）
5. include_domains / exclude_domains対応
6. country設定（japan等）
```

### 2. 画像生成機能

**現状の問題:**
- App内に画像生成機能が存在しない
- 型定義（NanobanaRequest, NanobanaResponse）のみ

**Rapid-Note2の実装:**
```
1. NanoBanana Pro（gemini-3-pro-image-preview）使用
2. 日本語テロップ対応
3. 参照画像（キャラクター維持）対応
4. プロンプトテンプレートのDB管理
5. セクション別画像の自動挿入
```

### 3. LLM記事生成の強化

**現状:**
- Gemini 2.0 Flash via LiteLLM
- 基本的なプロンプトテンプレート

**改善案:**
- Rapid-Note2のClaudeプロンプト設計を参考に
- より詳細な日本語対応
- ユーザープロフィールに基づくカスタマイズ

---

## タスク一覧

### Phase 1: Tavily検索の強化 ✅ 完了

| # | タスク | 詳細 | 流用ファイル | 状態 |
|---|-------|------|-------------|------|
| 1.1 | 3段階検索ロジックの移植 | NEWS/SNS/OFFICIALフェーズ | `research.py` | ✅ |
| 1.2 | 関連度スコアフィルタリング追加 | min_relevance_score: 0.6 | `research.py` | ✅ |
| 1.3 | Tavily AI Summary活用 | answerフィールドの優先抽出 | `research.py` | ✅ |
| 1.4 | time_range対応 | day/week/month/year | `research.py` | ✅ |
| 1.5 | ドメインフィルタリング対応 | include/exclude_domains | `research.py` | ✅ |
| 1.6 | country設定対応 | japan等の国別検索 | `research.py` | ✅ |

**実装ファイル:** `app/src/lib/ai/tavily-client.ts`

---

### Phase 2: NanoBanana Pro画像生成の実装 ✅ 完了

| # | タスク | 詳細 | 流用ファイル | 状態 |
|---|-------|------|-------------|------|
| 2.1 | 画像生成クライアント作成 | gemini-3-pro-image-preview API | `thumbnail_service.py` | ✅ |
| 2.2 | プロンプト生成ロジック移植 | LLMによる最終プロンプト生成 | `thumbnail_service.py` | ✅ |
| 2.3 | サムネイル生成機能実装 | 記事タイトル・本文から生成 | `thumbnail_service.py` | ✅ |
| 2.4 | プロンプトテンプレート管理 | ハードコード（将来DB対応予定） | `thumbnail_service.py` | ✅ |
| 2.5 | 参照画像対応 | キャラクター維持機能 | `thumbnail_service.py` | ✅ |

**実装ファイル:** `app/src/lib/ai/image-generator.ts`

---

### Phase 3: セクション別画像生成の実装 ✅ 完了

| # | タスク | 詳細 | 流用ファイル | 状態 |
|---|-------|------|-------------|------|
| 3.1 | HTML見出し抽出ロジック | h2/h3タグの検出（正規表現ベース） | `section_image_service.py` | ✅ |
| 3.2 | セクション画像生成 | 見出し内容に基づく画像生成 | `section_image_service.py` | ✅ |
| 3.3 | HTMLへの画像挿入 | figure/imgタグの自動挿入 | `section_image_service.py` | ✅ |
| 3.4 | WordPress画像アップロード | WP Media APIとの連携 | `client.ts` | ✅ |

**実装ファイル:** `app/src/lib/ai/section-image-service.ts`

---

### Phase 4: 記事生成パイプラインへの統合 ✅ 完了

| # | タスク | 詳細 | 状態 |
|---|-------|------|------|
| 4.1 | article-generator.tsに画像生成を統合 | includeImages オプションの実装 | ✅ |
| 4.2 | Inngest関数の更新 | generate-article.ts への画像生成ステップ追加 | ✅ |
| 4.3 | WordPress投稿時のメディア処理 | GeneratedImageテーブルへのメタデータ保存 | ✅ |

**実装ファイル:**
- `app/src/lib/ai/article-generator.ts`（6ステップパイプライン）
- `app/src/lib/inngest/functions/generate-article.ts`

---

### Phase 5: 品質改善（優先度: 中）

| # | タスク | 詳細 | 流用ファイル |
|---|-------|------|-------------|
| 5.1 | 日本語プロンプト改善 | より自然な日本語生成 | `claude_generator.py` |
| 5.2 | ユーザープロフィール対応 | スタイル・トーン・文体設定 | `WORKFLOW_INTEGRATION_DESIGN.md` |
| 5.3 | A/Bテスト基盤 | プロンプト効果測定 | - |

---

## 実装完了フロー

```
Phase 1（Tavily強化）          ✅ 完了
    ↓
Phase 2（画像生成実装）        ✅ 完了
    ↓
Phase 3（セクション画像）      ✅ 完了
    ↓
Phase 4（パイプライン統合）    ✅ 完了
    ↓
Phase 5（品質改善）            🔜 将来実装予定
```

**実装結果:**
1. ✅ Tavily強化 - 3段階マルチフェーズ検索、スコアフィルタリング実装
2. ✅ 画像生成 - NanoBanana Pro（gemini-3-pro-image-preview）統合
3. ✅ セクション画像 - H2/H3見出しへの自動画像挿入
4. ✅ パイプライン統合 - 6ステップ記事生成フロー完成
5. 🔜 品質改善 - Phase 5として継続的に実施予定

---

## 技術的考慮事項

### TypeScript vs Python

| 項目 | App (TypeScript) | Rapid-Note2 (Python) |
|------|------------------|---------------------|
| **Tavily** | fetch API | requests |
| **画像生成** | fetch (REST API) | requests (REST API) |
| **HTMLパース** | cheerio | BeautifulSoup |
| **非同期処理** | async/await | asyncio |

**変換方針:**
- ロジックは同一を維持
- 言語固有のAPIに変換（requests → fetch）
- エラーハンドリングパターンを統一

### 環境変数

```bash
# 追加が必要な環境変数
GOOGLE_API_KEY=...  # NanoBanana Pro用（既存のGemini APIキーで可）
```

### DB変更（将来）

```sql
-- プロンプトテンプレートテーブル（Phase 2以降）
CREATE TABLE thumbnail_prompt_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  prompt_template TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 参照ドキュメント

| ドキュメント | 場所 | 内容 |
|-------------|------|------|
| CONCEPT_DECISIONS.md | `/docs/` | コア設計・J8（既存資産活用） |
| USER_INPUT_LOG.md | `/docs/` | ユーザー要件（#005: 既存コード流用） |
| Tavily_Search_API_Guide.md | `Rapid-Note2/archive/reports/` | Tavily API完全仕様 |
| WORKFLOW_INTEGRATION_DESIGN.md | `Rapid-Note2/archive/reports/` | 統合設計 |

---

## 完了サマリー（2026年1月27日）

**実装完了項目:**
1. ✅ Phase 1: Tavily検索の3段階マルチフェーズ化
2. ✅ Phase 2: NanoBanana Pro画像生成サービス
3. ✅ Phase 3: セクション別画像自動挿入
4. ✅ Phase 4: 記事生成パイプラインへの統合
5. ✅ 型定義の誤字修正（Nanobana → NanoBanana）
6. ✅ アーキテクチャ仕様書の更新

**今後のアクション:**
1. Phase 5: 日本語プロンプト品質改善（将来）
2. プロンプトテンプレートのDB管理機能（将来）
3. A/Bテスト基盤の構築（将来）
