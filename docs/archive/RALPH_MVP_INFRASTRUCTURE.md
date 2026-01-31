# Argo Note MVP Infrastructure Implementation - Ralph Loop Prompt

> **目的:** MVPリリースに向けたインフラ実装のギャップを解消する
> **参照:** `docs/architecture/10_Comprehensive_Critical_Issues_Report.md` Block 8
> **完了条件:** 全チェックリストが✅になり、統合テストが成功すること

---

## 実行指示

このプロンプトを受け取ったら、以下の手順で作業を進めてください：

1. **現在の進捗状況を確認** - `docs/phases/Phase1_Infrastructure.md` のチェックリストを読み取る
2. **次の未完了タスクを特定** - ⬜マークのタスクを見つける
3. **タスクを実行** - 手動作業はユーザーに確認、開発タスクは実装
4. **チェックリストを更新** - 完了したタスクを✅に変更
5. **次のイテレーションへ** - 全タスク完了まで繰り返す

---

## Phase 1: 手動作業の確認（ユーザー対話）

### Step 1.1: VPS環境確認

以下をユーザーに質問してください：

```
【VPS環境確認】
1. DigitalOcean Dropletは作成済みですか？
   - 未作成の場合: $24/moプラン（2 vCPU / 4GB RAM / 80GB SSD）を推奨

2. VPSのIPアドレスを教えてください: _______________

3. SSHアクセスは可能ですか？
   - SSH秘密鍵のパスを教えてください: _______________
   - SSHユーザー名（通常root）: _______________
```

**完了条件:** IPアドレスとSSH情報を取得

### Step 1.2: WordPress Multisite確認

```
【WordPress Multisite確認】
1. WordPress Multisiteはインストール済みですか？
   - Yes → Step 1.3へ
   - No → インストール手順を案内

2. WP-CLIはインストール済みですか？
   - Yes → `wp site list` の出力を確認
   - No → インストール手順を案内

3. WordPress管理者のApplication Passwordは作成済みですか？
```

### Step 1.3: ドメイン・Cloudflare確認

```
【ドメイン・Cloudflare確認】
1. `argonote.app`（または使用ドメイン）は取得済みですか？
   - 取得済みドメイン名: _______________

2. Cloudflareに追加済みですか？
   - Zone ID: _______________
   - Account ID: _______________

3. ワイルドカードDNS (*.argonote.app → VPS IP) は設定済みですか？

4. SSL設定（Full Strict）は有効ですか？
```

---

## Phase 2: 環境変数の設定

### Step 2.1: .env ファイルの確認と更新

`app/.env` を読み取り、以下の環境変数が設定されているか確認：

```bash
# 必須: VPS接続
VPS_HOST="xxx.xxx.xxx.xxx"          # ← 確認
VPS_SSH_PRIVATE_KEY="base64-key"    # ← 確認
VPS_SSH_USER="root"                 # ← 確認

# 必須: WordPress
WP_DOMAIN="argonote.app"            # ← 確認
ENCRYPTION_KEY="64-char-hex"        # ← 確認（なければ生成）

# 必須: Cloudflare
CLOUDFLARE_API_TOKEN="..."          # ← 確認
CLOUDFLARE_ZONE_ID="..."            # ← 確認
CLOUDFLARE_ACCOUNT_ID="..."         # ← 確認
```

**未設定の場合:** ユーザーに入力を求めるか、生成コマンドを案内

```bash
# ENCRYPTION_KEY生成 (AES-256-GCM用 32バイト=64文字hex)
openssl rand -hex 32
```

---

## Phase 3: アプリケーション実装

### Step 3.1: ssh2ライブラリ導入

**チェック方法:**
```bash
grep "ssh2" app/package.json
```

**未導入の場合:**
```bash
cd app && npm install ssh2 @types/ssh2
```

**完了後:** `docs/phases/Phase1_Infrastructure.md` の該当タスクを✅に更新

### Step 3.2: SSH接続クライアント実装

**ファイル:** `app/src/lib/vps/ssh-client.ts`

**実装内容:**
```typescript
// SSH接続を確立し、コマンドを実行するクライアント
// - connect(): SSH接続確立
// - execute(command): コマンド実行
// - disconnect(): 接続切断
```

**チェック方法:**
1. ファイルが存在するか
2. 主要関数（connect, execute, disconnect）が実装されているか
3. 環境変数（VPS_HOST, VPS_SSH_*）を使用しているか

### Step 3.3: WP-CLI実行ラッパー実装

**ファイル:** `app/src/lib/vps/wp-cli.ts`

**実装内容:**
```typescript
// WP-CLIコマンドを実行するラッパー
// - createSite(slug, title, email): wp site create
// - getSiteList(): wp site list
// - installTheme(theme): wp theme install/activate
// - createApplicationPassword(user): アプリケーションパスワード生成
```

### Step 3.4: provision-blog.ts 完成

**ファイル:** `app/src/lib/inngest/functions/provision-blog.ts`

**現状確認:**
```bash
grep -n "TODO" app/src/lib/inngest/functions/provision-blog.ts
```

**実装すべきフロー:**
1. `update-status-provisioning` - ステータス更新
2. `create-wordpress-site` - SSH経由でWP-CLI実行
3. `generate-application-password` - WP API認証用パスワード生成
4. `configure-theme` - テーマ設定
5. `update-status-active` - 完了ステータス更新
6. **追加:** `onFailure` - 失敗時に `provision_failed` ステータスに更新

### Step 3.5: Cloudflare APIクライアント（オプション）

**ワイルドカードDNS設定済みの場合:** スキップ可能

**個別DNS登録が必要な場合:**
- ファイル: `app/src/lib/cloudflare/client.ts`
- 機能: DNS Aレコードの追加/削除

---

## Phase 4: Inngest設定修正

### Step 4.1: タイムアウト設定追加

**対象ファイル:**
- `app/src/lib/inngest/functions/generate-article.ts`
- `app/src/lib/inngest/functions/analyze-product.ts`
- `app/src/lib/inngest/functions/provision-blog.ts`

**確認コマンド:**
```bash
grep -n "timeoutMs\|cancelOn" app/src/lib/inngest/functions/*.ts
```

**修正内容:**
```typescript
export const generateArticle = inngest.createFunction({
  id: 'generate-article',
  retries: 3,
  // 追加
  cancelOn: [{ event: 'article/cancel', match: 'data.articleId' }],
}, ...)
```

### Step 4.2: リトライ間隔設定

**確認コマンド:**
```bash
grep -n "backoff" app/src/lib/inngest/functions/*.ts
```

**修正内容:**
```typescript
{
  retries: 3,
  backoff: {
    type: 'exponential',
    minDelay: '1m',
    maxDelay: '15m',
  }
}
```

### Step 4.3: 失敗通知実装

**対象:** 全Inngest関数にonFailureハンドラー追加

**実装内容:**
- ジョブ失敗時にメール送信
- ダッシュボードに失敗情報を表示するためのDB更新

---

## Phase 5: execute-schedule.ts 修正

### Step 5.1: 待機時間問題の修正

**ファイル:** `app/src/lib/inngest/functions/execute-schedule.ts`

**現状確認:**
```bash
grep -n "sleep.*5m" app/src/lib/inngest/functions/execute-schedule.ts
```

**問題:** 5分固定の待機時間（記事生成は最大20分かかる）

**修正方法:** ポーリングベースに変更
```typescript
// 修正前
await step.sleep('wait-for-generation', '5m');

// 修正後
await step.run('wait-for-article-completion', async () => {
  const maxWaitMs = 20 * 60 * 1000; // 20分
  const pollIntervalMs = 30 * 1000; // 30秒
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { status: true }
    });

    if (article?.status === 'review' || article?.status === 'published') {
      return true;
    }
    if (article?.status === 'failed') {
      throw new Error('Article generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error('Article generation timed out');
});
```

---

## Phase 6: 統合テスト

### Step 6.1: provision-blog テスト

```bash
# Inngest Dev Serverを起動
cd app && npx inngest-cli@latest dev

# テストイベント送信（別ターミナル）
curl -X POST http://localhost:8288/api/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "blog/provision",
    "data": {
      "siteId": "test-site-id",
      "subdomain": "test",
      "theme": "developer"
    }
  }'
```

**成功条件:**
- VPSでWordPressサイトが作成される
- DBにサイト情報が保存される
- ステータスが`active`になる

### Step 6.2: 記事生成→WordPress投稿テスト

```bash
# テストイベント送信
curl -X POST http://localhost:8288/api/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "article/generate",
    "data": {
      "articleId": "test-article-id",
      "productId": "test-product-id",
      "targetKeyword": "テスト記事"
    }
  }'
```

### Step 6.3: スケジュール実行テスト

```bash
# 手動トリガー
curl -X POST http://localhost:8288/api/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "schedule/trigger-manual",
    "data": {
      "scheduleId": "test-schedule-id"
    }
  }'
```

---

## 完了チェックリスト

以下の全項目が✅になったら、`<promise>MVP_INFRASTRUCTURE_COMPLETE</promise>` を出力：

### 環境
- [ ] VPS（DigitalOcean Droplet）稼働中
- [ ] WordPress Multisite インストール済み
- [ ] WP-CLI インストール済み
- [ ] ドメイン取得・Cloudflare設定済み
- [ ] ワイルドカードSSL有効

### 環境変数
- [ ] VPS_HOST, VPS_SSH_* 設定済み
- [ ] WP_DOMAIN, WP_TOKEN_ENCRYPTION_KEY 設定済み
- [ ] CLOUDFLARE_* 設定済み（必要な場合）

### 実装
- [ ] ssh2 ライブラリ導入済み
- [ ] SSH接続クライアント実装済み
- [ ] WP-CLI実行ラッパー実装済み
- [ ] provision-blog.ts 完成
- [ ] Inngestタイムアウト設定済み
- [ ] Inngestリトライ設定済み
- [ ] execute-schedule.ts 待機時間修正済み

### テスト
- [ ] provision-blog テスト成功
- [ ] 記事生成→WordPress投稿テスト成功
- [ ] スケジュール実行テスト成功

---

## イテレーション記録

各イテレーションで以下を記録：

```
### Iteration N (YYYY-MM-DD HH:MM)
- **確認したタスク:**
- **実行したアクション:**
- **結果:**
- **次のタスク:**
```

---

*このプロンプトはRalph Wiggumループで使用されます。全タスク完了時に `<promise>MVP_INFRASTRUCTURE_COMPLETE</promise>` を出力してください。*
