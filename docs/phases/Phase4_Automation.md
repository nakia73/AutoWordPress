# Phase 4: Automation（スケジュール自動化）【MVP必須】

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [AIパイプライン仕様](../architecture/04_AI_Pipeline.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [バックエンド仕様](../architecture/02_Backend_Database.md)
> **前のフェーズ:** [← Phase 3: User Interface](./Phase3_UserInterface.md) | **次のフェーズ:** [Phase 5: Monetization →](./Phase5_Monetization.md)
>
> **実施週:** Week 3

**テーマ:** Hands-Free Operation
**ゴール:** ユーザー定義スケジュールで記事を自動生成・公開する仕組みを構築
**重要:** 「放置OK」の訴求と機能の整合性を確保するため、**MVP必須機能**として位置づけ

---

## 1. 目的

「自動で資産が積み上がる」「放置でOK」というArgo Noteの核心的価値提案を実現します。
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

**実行基盤:** Inngest（長時間処理・自動リトライ対応）

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Inngest Cron   │────▶│   Inngest    │────▶│  Inngest Worker │
│  (スケジュール)  │     │  (オーケスト) │     │  (記事生成)      │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                      │
                              ┌───────────────────────┼───────────────────────┐
                              ▼                       ▼                       ▼
                       ┌────────────┐          ┌────────────┐          ┌────────────┐
                       │Gemini 3.0  │          │  WordPress │          │  通知送信   │
                       │   Pro      │          │  (投稿)    │          │  (Email)   │
                       └────────────┘          └────────────┘          └────────────┘
```

### 3.2 データベース

本フェーズで追加するテーブル：
- `schedules` - スケジュール設定（Cron式、実行頻度等）
- `schedule_jobs` - スケジュール実行履歴

**詳細スキーマ:** [バックエンド・DB仕様書](../architecture/02_Backend_Database.md#自動化機能phase-4---mvp必須) を参照

### 3.3 Inngest設定例

```typescript
// src/inngest/functions/scheduled-generation.ts
import { inngest } from '../client';

export const scheduledGeneration = inngest.createFunction(
  { id: 'scheduled-article-generation' },
  { cron: 'TZ=Asia/Tokyo 0 9 * * *' }, // 毎日9時（日本時間）
  async ({ event, step }) => {
    // Step 1: 対象ユーザーの取得
    const users = await step.run('fetch-scheduled-users', async () => {
      return await getScheduledUsers();
    });

    // Step 2: 各ユーザーの記事生成（並列実行）
    for (const user of users) {
      await step.run(`generate-for-${user.id}`, async () => {
        return await generateArticle(user);
      });
    }
  }
);
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
