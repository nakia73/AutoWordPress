# Phase 12: Model Selection - LLMモデル選択機能

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [AIパイプライン](../architecture/04_AI_Pipeline.md) | [マスターアーキテクチャ](../architecture/00_Master_Architecture.md)
> **優先度:** 低（成長フェーズ後半）

## 概要

ユーザーが使用するLLMモデルを自分で選択・変更できる機能を提供します。

**背景:**
- MVPではGemini 3 Flashを標準採用（ソフトコーディング）
- フォールバックは設けず、エラー時はユーザーに通知
- 本Phaseで、ユーザーが別モデルを選択できるUIを提供

> **注意:** 本ドキュメントは [StreamM_LLMSelector.md](./StreamM_LLMSelector.md) に統合されました。最新の実装計画はそちらを参照してください。

## 機能要件

### 1. エラー時のモデル変更促進

APIエラー発生時の挙動：

1. ユーザーにエラーを明確に表示
2. 「別のモデルを試す」オプションを提示
3. モデル選択画面へ誘導

```
エラー: 記事生成に失敗しました
原因: Gemini API レート制限 (429)

[別のモデルで再試行] [後で再試行] [キャンセル]
```

### 2. モデル選択UI

ダッシュボードの設定画面にモデル選択セクションを追加：

- 利用可能なモデル一覧表示
- 各モデルの特徴・コスト目安の説明
- 現在選択中のモデルの表示
- モデル変更時の確認ダイアログ

### 3. 対応モデル（段階的拡張）

初期対応（最新世代のみ）：

**Google Gemini 3:**
- `gemini-3-flash-preview` - Gemini 3 Flash（デフォルト、高速・低コスト）
- `gemini-3-pro-preview` - Gemini 3 Pro（高品質）

**Anthropic Claude 4.5:**
- `claude-haiku-4-5` - Claude Haiku 4.5（高速・低コスト）
- `claude-sonnet-4-5` - Claude Sonnet 4.5（バランス型）
- `claude-opus-4-5` - Claude Opus 4.5（最高品質）

**注:** 旧世代モデル（Gemini 2.x, Claude 3.x/4.0）は使用不可

## 技術仕様

### データモデル

```sql
-- usersテーブルに追加
ALTER TABLE users ADD COLUMN llm_model VARCHAR(50) DEFAULT 'gemini-3-flash-preview';
```

### API設計

```typescript
// モデル変更API
PUT /api/users/settings/llm-model
Body: { model: "gemini-3-pro-preview" }

// 利用可能モデル取得API
GET /api/llm/available-models
Response: {
  models: [
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", description: "...", default: true },
    { id: "gemini-3-pro-preview", name: "Gemini 3 Pro", description: "..." },
    { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", description: "..." }
  ]
}
```

### LiteLLM設定の動的切り替え

```typescript
// 記事生成時にユーザー設定を参照
const userModel = await getUserLLMModel(userId);
const response = await litellm.completion({
  model: userModel, // ユーザー選択モデルを使用
  messages: [...],
});
```

## 実装タスク

1. [ ] usersテーブルにllm_modelカラム追加
2. [ ] モデル設定変更API実装
3. [ ] 利用可能モデル一覧API実装
4. [ ] ダッシュボードにモデル選択UI追加
5. [ ] エラー時のモデル変更促進UI実装
6. [ ] 記事生成処理でユーザー設定モデルを参照するよう修正

## 成功指標

- モデル変更機能の利用率
- エラー後のモデル変更による再試行成功率
- ユーザーからのモデル追加リクエスト数

## 注意事項

- 本Phaseは優先度が低く、MVPおよび初期成長フェーズ完了後に実装
- ユーザーフィードバックに基づき、対応モデルを段階的に拡張
- モデル追加時はコスト・品質のバランスを検証してから提供
