# Phase 6: Automation（スケジュール自動化）詳細仕様書

**テーマ:** Hands-Free Operation
**ゴール:** ユーザー定義スケジュールで記事を自動生成・公開する仕組みを構築
**前提:** Phase 5（MVP Launch）完了後、Betaフィードバックに基づき優先度決定

---

## 1. 目的

MVPでは手動で「記事生成」ボタンを押す必要があります。
本フェーズで**完全自動運用**を実現し、ユーザーは設定後は何もしなくても記事が増え続ける状態を作ります。

---

## 2. 機能要件

### 2.1 スケジュール設定

| 項目 | 説明 | 例 |
|------|------|-----|
| 頻度 | 記事生成の間隔 | 毎日、週3回、週1回 |
| 時刻 | 生成・公開する時刻 | 09:00 |
| 記事数 | 1回あたりの生成数 | 1記事、3記事 |
| 公開モード | 自動公開 or 下書き | 自動公開 |
| 一時停止 | スケジュールの有効/無効 | 有効 |

### 2.2 通知システム

| イベント | 通知内容 |
|---------|---------|
| 記事生成完了 | 「新しい記事が公開されました」+ 記事タイトル + URL |
| 生成失敗 | 「記事生成に失敗しました」+ エラー概要 |
| 週次サマリー | 「今週は5記事を公開しました」+ PV概況 |
| クォータ警告 | 「今月の生成上限に近づいています」 |

**通知チャネル:** Email（必須）、Slack Webhook（オプション）

---

## 3. 技術実装

### 3.1 アーキテクチャ

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Vercel Cron    │────▶│  Redis Queue │────▶│  Worker Process │
│  (トリガー)      │     │  (BullMQ)    │     │  (記事生成)      │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                      │
                              ┌───────────────────────┼───────────────────────┐
                              ▼                       ▼                       ▼
                       ┌────────────┐          ┌────────────┐          ┌────────────┐
                       │  LLM API   │          │  WordPress │          │  通知送信   │
                       │  (生成)    │          │  (投稿)    │          │  (Email)   │
                       └────────────┘          └────────────┘          └────────────┘
```

### 3.2 データベーススキーマ

```sql
-- スケジュール設定
CREATE TABLE schedules (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  cron_expression VARCHAR(50),      -- "0 9 * * 1,3,5" (月水金9時)
  articles_per_run INTEGER DEFAULT 1,
  publish_mode VARCHAR(20) DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  next_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ジョブ履歴
CREATE TABLE schedule_jobs (
  id UUID PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id),
  status VARCHAR(20),               -- queued, running, completed, failed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  articles_generated INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Cron設定例

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-schedules",
      "schedule": "*/5 * * * *"  // 5分ごとにチェック
    }
  ]
}
```

---

## 4. セキュリティ & 実用性の考慮

- **レート制限:** 1ユーザーあたりの同時実行ジョブ数を制限
- **リトライ:** 失敗時は指数バックオフでリトライ（最大3回）
- **冪等性:** ジョブIDで重複実行を防止
- **タイムアウト:** 長時間実行ジョブの強制終了

---

## 5. 成功基準

| 指標 | 目標 |
|------|------|
| スケジュール実行成功率 | 99%以上 |
| 通知到達率 | 99%以上 |
| 設定ユーザー率 | Betaユーザーの50%以上 |
| 平均遅延時間 | 設定時刻から5分以内 |

---

## 6. 実装優先度

Betaフィードバックで「自動化がほしい」という要望が多い場合に優先実装。
ユーザーの手間を大幅に削減できるため、PMFを高める重要機能。
