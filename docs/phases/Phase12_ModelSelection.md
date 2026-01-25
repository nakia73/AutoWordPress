# Phase 12: Model Selection - LLMモデル選択機能

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [AIパイプライン](../architecture/04_AI_Pipeline.md) | [マスターアーキテクチャ](../architecture/00_Master_Architecture.md)
> **優先度:** 低（成長フェーズ後半）

## 概要

ユーザーが使用するLLMモデルを自分で選択・変更できる機能を提供します。

**背景:**
- MVPではGemini 3.0 Proを標準採用（ソフトコーディング）
- フォールバックは設けず、エラー時はユーザーに通知
- 本Phaseで、ユーザーが別モデルを選択できるUIを提供

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

初期対応：
- Gemini 3.0 Pro（標準）
- Gemini 3.0 Flash

将来対応（ユーザー要望に応じて）：
- Claude系
- GPT系
- その他

**注:** 対応モデルの追加はユーザーフィードバックに基づいて判断

## 技術仕様

### データモデル

```sql
-- usersテーブルに追加
ALTER TABLE users ADD COLUMN llm_model VARCHAR(50) DEFAULT 'gemini-3.0-pro';
```

### API設計

```typescript
// モデル変更API
PUT /api/users/settings/llm-model
Body: { model: "gemini-3.0-flash" }

// 利用可能モデル取得API
GET /api/llm/available-models
Response: {
  models: [
    { id: "gemini-3.0-pro", name: "Gemini 3.0 Pro", description: "...", default: true },
    { id: "gemini-3.0-flash", name: "Gemini 3.0 Flash", description: "..." }
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
