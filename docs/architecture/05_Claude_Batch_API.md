# Claude Message Batches API 仕様書

> **ステータス:** 標準採用（通常フロー）
> **作成日:** 2026-01-29
> **関連:** [StreamM_LLMSelector.md](../phases/StreamM_LLMSelector.md), [04_AI_Pipeline.md](./04_AI_Pipeline.md)

---

## 1. 概要

### 1.1 基本方針

**重要:** Argo NoteではClaude Message Batches APIを**通常の記事生成フローで標準採用**します。

ストリーミングAPIや同期APIは使用せず、すべてのClaude API呼び出しはバッチAPIを経由します。これにより、1記事の生成であっても**50%のコスト削減**を実現します。

### 1.2 採用理由

1. **コスト効率**: 標準APIの**50%割引**で利用可能（1記事でも適用）
2. **非同期処理との親和性**: Inngestワーカーによるバックグラウンド処理と相性が良い
3. **ストリーミング不要**: 記事生成は即座の応答が不要なユースケース
4. **シンプルな設計**: 同期API/ストリーミングAPIを使用しないことで実装を簡素化

### 1.3 API選択方針

| API種別 | 使用 | 理由 |
|--------|------|------|
| **Message Batches API** | ✅ 標準採用 | 50%コスト削減、非同期処理に最適 |
| Messages API（同期） | ❌ 不使用 | コストが2倍、Batch APIで代替可能 |
| Messages API（ストリーミング） | ❌ 不使用 | リアルタイム応答は不要 |

### 1.4 適用範囲

| 処理 | Batch API使用 | 備考 |
|------|--------------|------|
| 単一記事生成 | ✅ | 1リクエストでもBatch APIを使用 |
| 複数記事生成 | ✅ | 複数リクエストをまとめて送信 |
| アウトライン生成 | ✅ | 記事構成案の生成 |
| メタディスクリプション生成 | ✅ | SEOメタ情報の生成 |
| プロダクト分析 | ✅ | LLM推論が必要な分析処理 |

---

## 2. API仕様

### 2.1 エンドポイント

| 操作 | メソッド | エンドポイント |
|------|---------|---------------|
| バッチ作成 | POST | `https://api.anthropic.com/v1/messages/batches` |
| バッチ取得 | GET | `https://api.anthropic.com/v1/messages/batches/{batch_id}` |
| バッチ一覧 | GET | `https://api.anthropic.com/v1/messages/batches` |
| 結果取得 | GET | `{results_url}` |
| バッチキャンセル | POST | `https://api.anthropic.com/v1/messages/batches/{batch_id}/cancel` |

### 2.2 認証ヘッダー

```
x-api-key: {ANTHROPIC_API_KEY}
anthropic-version: 2023-06-01
Content-Type: application/json
```

### 2.3 バッチ作成リクエスト

```typescript
interface BatchCreateRequest {
  requests: BatchRequest[];
}

interface BatchRequest {
  custom_id: string;  // 一意の識別子（結果照合用）
  params: {
    model: string;    // claude-haiku-4-5, claude-sonnet-4-5, claude-opus-4-5
    max_tokens: number;
    messages: Message[];
    system?: string | SystemBlock[];
    temperature?: number;
    // その他のMessages APIパラメータ
  };
}
```

**リクエスト例:**

```json
{
  "requests": [
    {
      "custom_id": "article-001",
      "params": {
        "model": "claude-haiku-4-5",
        "max_tokens": 4096,
        "system": "あなたはSEO記事を生成する専門家です。",
        "messages": [
          {"role": "user", "content": "キーワード「React入門」で2000文字の記事を生成してください。"}
        ]
      }
    },
    {
      "custom_id": "article-002",
      "params": {
        "model": "claude-haiku-4-5",
        "max_tokens": 4096,
        "system": "あなたはSEO記事を生成する専門家です。",
        "messages": [
          {"role": "user", "content": "キーワード「TypeScript基礎」で2000文字の記事を生成してください。"}
        ]
      }
    }
  ]
}
```

### 2.4 バッチ作成レスポンス

```typescript
interface MessageBatch {
  id: string;                    // msgbatch_xxx
  type: "message_batch";
  processing_status: "in_progress" | "canceling" | "ended";
  request_counts: {
    processing: number;
    succeeded: number;
    errored: number;
    canceled: number;
    expired: number;
  };
  ended_at: string | null;
  created_at: string;
  expires_at: string;            // 作成から24時間後
  cancel_initiated_at: string | null;
  results_url: string | null;    // 処理完了後に設定
}
```

### 2.5 結果取得（JSONL形式）

```typescript
interface BatchResult {
  custom_id: string;
  result: {
    type: "succeeded" | "errored" | "canceled" | "expired";
    message?: {              // type === "succeeded" の場合
      id: string;
      content: ContentBlock[];
      usage: Usage;
      // ...
    };
    error?: {                // type === "errored" の場合
      type: string;
      message: string;
    };
  };
}
```

---

## 3. 制限事項

### 3.1 バッチ制限

| 項目 | 制限 |
|------|------|
| 最大リクエスト数 | 100,000リクエスト/バッチ |
| 最大サイズ | 256 MB/バッチ |
| 処理時間上限 | 24時間（超過で期限切れ） |
| 結果保持期間 | 作成後29日間 |
| 典型的な処理時間 | 1時間以内（多くのケース） |

### 3.2 レート制限

- Batches API HTTPリクエストに適用
- 処理待ちバッチ内のリクエスト数に適用
- Messages APIのレート制限とは独立

### 3.3 サポートモデル

| モデル | Batch入力 | Batch出力 | 標準比 |
|--------|----------|----------|--------|
| claude-haiku-4-5 | $0.50/MTok | $2.50/MTok | 50%OFF |
| claude-sonnet-4-5 | $1.50/MTok | $7.50/MTok | 50%OFF |
| claude-opus-4-5 | $7.50/MTok | $37.50/MTok | 50%OFF |

---

## 4. 処理フロー

### 4.1 基本フロー

```
┌─────────────────┐
│  1. バッチ作成   │
│  POST /batches  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. ステータス確認 │ ◄──┐
│ GET /batches/id │    │ ポーリング
└────────┬────────┘    │ (60秒間隔)
         │             │
         ▼             │
    processing_status  │
    == "ended" ? ──────┘
         │ Yes
         ▼
┌─────────────────┐
│  3. 結果取得    │
│ GET results_url │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. 結果処理    │
│ JSONL解析・保存 │
└─────────────────┘
```

### 4.2 エラーハンドリング

| 結果タイプ | 説明 | 対応 |
|-----------|------|------|
| `succeeded` | 成功 | 結果を保存 |
| `errored` | エラー発生 | エラー内容確認、必要に応じて再送信 |
| `canceled` | キャンセル済み | 再送信検討 |
| `expired` | 24時間超過 | 再送信 |

---

## 5. Argo Noteでの実装方針

### 5.1 標準フロー

**すべてのClaude API呼び出しはBatch APIを経由します。**

```
┌─────────────────────────────────────────────────────────┐
│  記事生成リクエスト（1記事でも複数記事でも同じフロー）     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ClaudeBatchClient.createBatch()                        │
│  - 1リクエストでもバッチとして送信                        │
│  - 50%コスト削減が自動適用                               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  waitForCompletion() - ポーリング待機                    │
│  - 典型的な処理時間: 数分〜1時間                         │
│  - Inngestワーカーでバックグラウンド処理                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  結果取得・保存                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.2 実装コンポーネント

```
lib/ai/
├── llm-client.ts           # Gemini用（同期API）
├── claude-batch-client.ts  # Claude用（Batch API専用）
└── article-generator.ts    # 記事生成パイプライン
```

**注意:** Claude APIへのアクセスはすべて`claude-batch-client.ts`を経由します。同期APIやストリーミングAPIは使用しません。

### 5.3 データベース設計

```prisma
model BatchJob {
  id              String   @id @default(cuid())
  batchId         String   @unique  // Anthropic batch ID (msgbatch_xxx)
  status          String   @default("pending")  // pending, processing, completed, failed
  requestCount    Int
  successCount    Int      @default(0)
  errorCount      Int      @default(0)
  resultsUrl      String?
  createdAt       DateTime @default(now())
  completedAt     DateTime?
  expiresAt       DateTime

  // リレーション
  articles        Article[]
}

model Article {
  // 既存フィールド...
  batchJobId      String?
  batchCustomId   String?  // バッチ内での識別子
  batchJob        BatchJob? @relation(fields: [batchJobId], references: [id])
}
```

### 5.4 プロンプトキャッシング

バッチ処理でプロンプトキャッシングを活用してコストをさらに削減：

```typescript
// 同一システムプロンプトにcache_controlを設定
const systemPrompt = [
  {
    type: "text",
    text: "あなたはSEO最適化された記事を生成する専門家です...",
    cache_control: { type: "ephemeral" }
  }
];
```

**期待されるキャッシュヒット率**: 30%〜98%（トラフィックパターンによる）

---

## 6. コスト比較

### 6.1 月間100記事生成の試算

| 項目 | 標準API | Batch API | 削減額 |
|------|---------|-----------|--------|
| 入力トークン（500K） | $0.40 | $0.20 | $0.20 |
| 出力トークン（2M） | $10.00 | $5.00 | $5.00 |
| **合計** | **$10.40** | **$5.20** | **$5.20 (50%)** |

※ claude-haiku-4-5使用時

### 6.2 キャッシング併用時

| 項目 | Batch API | +キャッシング(50%ヒット) | 追加削減 |
|------|-----------|------------------------|---------|
| 入力トークン | $0.20 | $0.10 | $0.10 |
| 出力トークン | $5.00 | $5.00 | $0.00 |
| **合計** | **$5.20** | **$5.10** | **$0.10** |

---

## 7. 実装例

### 7.1 バッチ作成

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function createArticleBatch(articles: ArticleRequest[]) {
  const requests = articles.map((article, index) => ({
    custom_id: `article-${article.id}`,
    params: {
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: ARTICLE_SYSTEM_PROMPT,
      messages: [{
        role: "user" as const,
        content: `キーワード「${article.keyword}」で記事を生成してください。`
      }]
    }
  }));

  const batch = await client.messages.batches.create({ requests });
  return batch;
}
```

### 7.2 ステータスポーリング

```typescript
async function waitForBatchCompletion(batchId: string): Promise<MessageBatch> {
  while (true) {
    const batch = await client.messages.batches.retrieve(batchId);

    if (batch.processing_status === "ended") {
      return batch;
    }

    console.log(`Batch ${batchId}: ${batch.request_counts.processing} processing...`);
    await new Promise(resolve => setTimeout(resolve, 60000)); // 60秒待機
  }
}
```

### 7.3 結果取得

```typescript
async function* getBatchResults(batchId: string) {
  for await (const result of client.messages.batches.results(batchId)) {
    yield result;
  }
}

// 使用例
for await (const result of getBatchResults(batchId)) {
  if (result.result.type === 'succeeded') {
    const content = result.result.message?.content[0];
    if (content?.type === 'text') {
      await saveArticle(result.custom_id, content.text);
    }
  } else {
    console.error(`Failed: ${result.custom_id}`, result.result);
  }
}
```

---

## 8. ベストプラクティス

### 8.1 推奨事項

1. **意味のあるcustom_id**: 結果照合のため、記事IDなど追跡可能な値を使用
2. **定期的なポーリング**: 60秒間隔でステータス確認
3. **エラーハンドリング**: 各結果タイプに対する適切な処理を実装
4. **バッチサイズ最適化**: 大きすぎるデータセットは複数バッチに分割

### 8.2 注意事項

1. **結果順序**: 結果は入力順序と一致しない可能性あり（custom_idで照合）
2. **期限切れ対策**: 24時間以内に完了しないリクエストは再送信
3. **結果取得期限**: 29日以内に結果をダウンロード

---

## 9. 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-29 | 初版作成、Batch API採用決定 |
| 2026-01-29 | 通常フローでの標準採用に方針変更（大量生成時のみ→常時使用） |
