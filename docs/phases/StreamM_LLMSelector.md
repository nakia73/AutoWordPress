# Stream M: LLMモデル選択UIモジュール 実装計画

> **ステータス:** 計画中
> **作成日:** 2026-01-29
> **関連:** [Stream A仕様書](../architecture/04_StreamA_Specification.md), [Claude Batch API仕様書](../architecture/05_Claude_Batch_API.md)

---

## 1. 概要

### 1.1 目的

ユーザーがダッシュボード上でLLMモデルを選択・切り替えできるUIモジュールを実装する。現在の環境変数（`.env`）による設定から、ユーザーごとの動的な設定に移行する。

### 1.2 要件

- ユーザーがUI上でLLMモデルを選択可能
- 選択したモデルはユーザーごとに永続化
- 各プロバイダー（Google/Anthropic）のAPI仕様差異を吸収
- APIキーのセキュアな管理

### 1.3 Claude API方針：Batch API標準採用

**重要:** Claude APIを使用する場合、**1記事の生成でも複数記事でも、常にBatch APIを使用**します。

詳細は[Claude Batch API仕様書](../architecture/05_Claude_Batch_API.md)を参照。

| 項目 | 詳細 |
|------|------|
| **コスト削減** | 標準APIの**50%割引**（1記事でも適用） |
| **処理能力** | 最大100,000リクエスト/バッチ |
| **処理時間** | 通常数分〜1時間（最大24時間） |
| **適用対象** | **すべてのClaude API呼び出し** |

### 1.4 API選択方針

| API種別 | 使用 | 理由 |
|--------|------|------|
| **Message Batches API** | ✅ 標準採用 | 50%コスト削減、非同期処理に最適 |
| Messages API（同期） | ❌ 不使用 | コストが2倍、Batch APIで代替可能 |
| Messages API（ストリーミング） | ❌ 不使用 | リアルタイム応答は不要（記事生成はバックグラウンド処理） |

**設計思想:** Argo Noteはリアルタイムチャットアプリではなく、バックグラウンドで記事を生成するサービスです。ユーザーは生成完了を待つ必要がないため、ストリーミングAPIは不要です。処理時間がかかっても、コストを50%削減する方が合理的です。

---

## 2. サポートモデル一覧（最新世代のみ - 2026年1月現在）

### 2.1 Google Gemini 3 シリーズ

| 選択キー | API モデルID | 表示名 | 特徴 | 価格 (入力/出力 $/M) |
|---------|-------------|--------|------|---------------------|
| `gemini-3-flash` | `gemini-3-flash-preview` | Gemini 3 Flash | 高速・低コスト（デフォルト） | $0.50 / $3.00 |
| `gemini-3-pro` | `gemini-3-pro-preview` | Gemini 3 Pro | 高品質・高度な推論 | $2.00 / $12.00 (<200k), $4.00 / $18.00 (>200k) |

### 2.2 Google Gemini 3 Pro Image（画像生成）

| API モデルID | 表示名 | 特徴 | 価格 |
|-------------|--------|------|------|
| `gemini-3-pro-image-preview` | Gemini 3 Pro Image | 最高品質の画像生成 | $2.00 (入力) / $0.134 (画像出力) |

### 2.3 Anthropic Claude 4.5 シリーズ

| 選択キー | API モデルID | 表示名 | 特徴 | 標準価格 ($/M) | Batch価格 ($/M) |
|---------|-------------|--------|------|----------------|-----------------|
| `claude-haiku-4.5` | `claude-haiku-4-5` | Claude Haiku 4.5 | 高速・低コスト | $0.80 / $4.00 | $0.50 / $2.50 |
| `claude-sonnet-4.5` | `claude-sonnet-4-5` | Claude Sonnet 4.5 | バランス型 | $3.00 / $15.00 | $1.50 / $7.50 |
| `claude-opus-4.5` | `claude-opus-4-5` | Claude Opus 4.5 | 最高品質 | $15.00 / $75.00 | $7.50 / $37.50 |

> **Note**: Batch APIは標準価格の50%割引が適用されます。詳細は[Claude Batch API仕様書](../architecture/05_Claude_Batch_API.md)参照。

---

## 3. API仕様差異と統一化

### 3.1 Google Gemini 3 API

**エンドポイント:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
```

**リクエスト形式:**
```typescript
interface GeminiRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;        // 0.0 - 2.0
    maxOutputTokens?: number;    // 最大64k
    topP?: number;
    topK?: number;
  };
  // Gemini 3 新機能
  thinkingConfig?: {
    thinkingLevel: 'minimal' | 'low' | 'medium' | 'high';  // デフォルト: high
  };
}
```

**レスポンス形式:**
```typescript
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}
```

**Gemini 3 固有パラメータ:**
- `thinkingLevel`: 推論の深さを制御（minimal/low/medium/high）
  - `minimal`: Flash専用。最小限の思考
  - `low`: レイテンシ・コスト重視
  - `high`: 品質重視（デフォルト）
- `mediaResolution`: 画像/動画の解像度制御

### 3.2 Anthropic Claude API

**エンドポイント:**
```
POST https://api.anthropic.com/v1/messages
```

**ヘッダー:**
```
x-api-key: {API_KEY}
anthropic-version: 2023-06-01
Content-Type: application/json
```

**リクエスト形式:**
```typescript
interface ClaudeRequest {
  model: string;
  max_tokens: number;           // 必須
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  system?: string;              // システムプロンプト（別パラメータ）
  temperature?: number;         // 0.0 - 1.0
  // Claude 4.5 拡張思考
  thinking?: {
    type: 'enabled';
    budget_tokens: number;      // 最小1024
  };
}
```

**レスポンス形式:**
```typescript
interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

**Claude 4.5 固有パラメータ:**
- `thinking`: 拡張思考（Extended Thinking）を有効化
  - `budget_tokens`: 思考に使用するトークン数（最小1024）

### 3.3 統一インターフェース設計

```typescript
// 統一されたモデル設定
interface LLMModelConfig {
  id: string;                    // 内部識別子 (gemini-3-flash, claude-sonnet-4.5)
  provider: 'google' | 'anthropic';
  displayName: string;           // UI表示名
  apiModelId: string;            // 実際のAPI呼び出しID

  // 共通パラメータ
  defaultTemperature: number;
  maxTemperature: number;
  maxOutputTokens: number;

  // プロバイダー固有設定
  providerConfig: GeminiConfig | ClaudeConfig;

  // 価格情報
  pricing: {
    inputPer1M: number;
    outputPer1M: number;
  };
}

// Gemini固有設定
interface GeminiConfig {
  type: 'gemini';
  supportedThinkingLevels: ('minimal' | 'low' | 'medium' | 'high')[];
  defaultThinkingLevel: string;
}

// Claude固有設定
interface ClaudeConfig {
  type: 'claude';
  supportsExtendedThinking: boolean;
  minThinkingBudget: number;
}
```

---

## 4. データベース設計

### 4.1 ユーザー設定テーブル

```prisma
model UserLLMSettings {
  id                String   @id @default(cuid())
  userId            String   @unique

  // 選択モデル
  selectedModel     String   @default("gemini-3-flash")  // 選択キー（API IDではない）

  // APIキー（暗号化）
  geminiApiKey      String?  // AES-256-GCM暗号化
  anthropicApiKey   String?  // AES-256-GCM暗号化

  // モデル固有設定
  temperature       Float    @default(0.7)
  maxTokens         Int      @default(4096)

  // Gemini設定
  geminiThinkingLevel String? @default("high")

  // Claude設定
  claudeExtendedThinking Boolean @default(false)
  claudeThinkingBudget   Int?    @default(1024)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
}
```

---

## 5. UI設計

### 5.1 モデル選択コンポーネント

```
┌─────────────────────────────────────────────────────────────────┐
│  LLMモデル設定                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  プロバイダー選択                                            ││
│  │  ┌───────────────┐  ┌───────────────┐                      ││
│  │  │ ○ Google     │  │ ● Anthropic  │                      ││
│  │  │   Gemini 3   │  │   Claude 4.5 │                      ││
│  │  └───────────────┘  └───────────────┘                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  モデル選択                                                  ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │ ● Claude Sonnet 4.5                                     │││
│  │  │   バランス型。コーディングとエージェントタスクに最適     │││
│  │  ├─────────────────────────────────────────────────────────┤││
│  │  │ ○ Claude Haiku 4.5                                      │││
│  │  │   高速・低コスト。チャットや大量処理に最適               │││
│  │  ├─────────────────────────────────────────────────────────┤││
│  │  │ ○ Claude Opus 4.5                                       │││
│  │  │   最高品質。複雑な推論タスクに最適                       │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  詳細設定                                                    ││
│  │                                                              ││
│  │  Temperature: [━━━━━━━●━━━] 0.7                              ││
│  │  └ 低い = 一貫性重視 / 高い = 創造性重視                     ││
│  │                                                              ││
│  │  最大トークン数: [ 4096 ▼ ]                                  ││
│  │                                                              ││
│  │  ☑ 拡張思考を有効化 (Claude 4.5)                            ││
│  │    └ 思考バジェット: [ 2048 ] トークン                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  APIキー設定                                                 ││
│  │                                                              ││
│  │  Anthropic API Key: [••••••••••••••••••••] [変更]            ││
│  │  └ ✅ 接続確認済み                                           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                      [ キャンセル ] [ 保存 ]    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 コンポーネント構成

```
components/
├── llm-settings/
│   ├── LLMSettingsModal.tsx       # メイン設定モーダル
│   ├── ProviderSelector.tsx       # プロバイダー選択
│   ├── ModelSelector.tsx          # モデル選択
│   ├── AdvancedSettings.tsx       # 詳細設定
│   │   ├── TemperatureSlider.tsx
│   │   ├── MaxTokensSelect.tsx
│   │   ├── GeminiThinkingLevel.tsx
│   │   └── ClaudeExtendedThinking.tsx
│   ├── ApiKeyManager.tsx          # APIキー管理
│   └── ConnectionTest.tsx         # 接続テスト
```

---

## 6. API設計

### 6.1 エンドポイント

```typescript
// GET /api/user/llm-settings
// ユーザーのLLM設定を取得
interface GetLLMSettingsResponse {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  geminiThinkingLevel?: string;
  claudeExtendedThinking?: boolean;
  claudeThinkingBudget?: number;
  hasGeminiKey: boolean;      // キーの有無のみ返す
  hasAnthropicKey: boolean;
}

// PUT /api/user/llm-settings
// LLM設定を更新
interface UpdateLLMSettingsRequest {
  selectedModel?: string;
  temperature?: number;
  maxTokens?: number;
  geminiThinkingLevel?: string;
  claudeExtendedThinking?: boolean;
  claudeThinkingBudget?: number;
}

// POST /api/user/llm-settings/api-key
// APIキーを設定
interface SetApiKeyRequest {
  provider: 'google' | 'anthropic';
  apiKey: string;
}

// POST /api/user/llm-settings/test-connection
// 接続テスト
interface TestConnectionRequest {
  provider: 'google' | 'anthropic';
}
interface TestConnectionResponse {
  success: boolean;
  message?: string;
  latencyMs?: number;
}
```

---

## 7. LLMクライアント拡張

### 7.1 ユーザー設定対応

```typescript
// lib/ai/llm-client.ts の拡張

export class LLMClient {
  // ユーザー設定からクライアントを生成
  static async fromUserSettings(userId: string): Promise<LLMClient> {
    const settings = await prisma.userLLMSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      // デフォルト設定を使用
      return new LLMClient({ model: 'gemini-3-flash' });
    }

    const apiKey = settings.selectedModel.startsWith('gemini')
      ? await decrypt(settings.geminiApiKey)
      : await decrypt(settings.anthropicApiKey);

    return new LLMClient({
      model: settings.selectedModel,
      apiKey,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      // プロバイダー固有設定
      providerOptions: getProviderOptions(settings),
    });
  }
}

function getProviderOptions(settings: UserLLMSettings) {
  if (settings.selectedModel.startsWith('gemini')) {
    return {
      thinkingLevel: settings.geminiThinkingLevel || 'high',
    };
  } else {
    return {
      extendedThinking: settings.claudeExtendedThinking,
      thinkingBudget: settings.claudeThinkingBudget,
    };
  }
}
```

### 7.2 プロバイダー固有パラメータの適用

```typescript
// Gemini 3 呼び出し
private async callGemini(messages, options) {
  const body = {
    contents: this.formatGeminiMessages(messages),
    generationConfig: {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
    },
  };

  // Gemini 3 固有: thinkingLevel
  if (options.providerOptions?.thinkingLevel) {
    body.thinkingConfig = {
      thinkingLevel: options.providerOptions.thinkingLevel,
    };
  }

  return fetch(/* ... */);
}

// Claude 4.5 呼び出し
private async callClaude(messages, options) {
  const body = {
    model: this.model,
    max_tokens: options.maxTokens,
    messages: this.formatClaudeMessages(messages),
    system: this.getSystemPrompt(messages),
    temperature: options.temperature,
  };

  // Claude 4.5 固有: Extended Thinking
  if (options.providerOptions?.extendedThinking) {
    body.thinking = {
      type: 'enabled',
      budget_tokens: options.providerOptions.thinkingBudget || 1024,
    };
  }

  return fetch(/* ... */);
}
```

---

## 8. 実装フェーズ

### Phase 1: バックエンド基盤（1-2日）

1. **データベーススキーマ追加**
   - `UserLLMSettings` テーブル作成
   - マイグレーション実行

2. **API実装**
   - `/api/user/llm-settings` CRUD
   - APIキー暗号化・復号化
   - 接続テスト機能

3. **LLMクライアント拡張**
   - `fromUserSettings()` メソッド追加
   - プロバイダー固有パラメータ対応

### Phase 2: フロントエンドUI（2-3日）

1. **コンポーネント実装**
   - プロバイダー選択
   - モデル選択
   - 詳細設定（Temperature, Max Tokens等）
   - APIキー管理

2. **状態管理**
   - React Query でサーバー状態管理
   - 楽観的更新の実装

3. **バリデーション**
   - 入力値の検証
   - APIキー形式チェック

### Phase 3: 統合・テスト（1日）

1. **記事生成フローへの統合**
   - `ArticleGenerator` でユーザー設定を使用
   - フォールバック処理

2. **テスト**
   - ユニットテスト
   - 統合テスト
   - E2Eテスト

---

## 9. セキュリティ考慮事項

### 9.1 APIキー管理

- **保存時:** AES-256-GCM で暗号化
- **使用時:** メモリ上でのみ復号化
- **表示:** UI上では `••••••••` でマスク
- **ログ:** APIキーは絶対にログ出力しない

### 9.2 レート制限

- APIキー設定: 1分あたり5回まで
- 接続テスト: 1分あたり10回まで

---

## 10. 今後の拡張

- **プリセット機能:** 用途別の設定プリセット（高速モード、高品質モード等）
- **コスト見積もり:** 選択モデルの推定コスト表示
- **使用量ダッシュボード:** モデル別のトークン使用量表示
- **A/Bテスト:** 複数モデルでの生成比較

---

## 11. 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-29 | 初版作成 |
| 2026-01-29 | モデルID一覧を正式APIモデルIDに更新、選択キーとAPIモデルIDの区別を明確化 |
| 2026-01-29 | Claude Batch API方針を「大量生成時のみ」から「標準採用」に変更 |
