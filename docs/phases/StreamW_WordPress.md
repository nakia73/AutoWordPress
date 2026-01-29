# Stream W: WordPress Setup（WordPressセットアップ）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [インフラ仕様](../architecture/03_Infrastructure_Ops.md) | [VPSプロバイダー選定](../architecture/11_VPS_Provider_Selection.md) | [Multisiteガイド](../architecture/07_WordPress_Multisite_Guide.md)
>
> **依存関係:** なし（スタンドアローン）

**テーマ:** Infrastructure Automation
**目的:** VPS・WordPress環境の自動構築をスタンドアローンで構築・検証

---

## 設計方針

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stream W: スタンドアローン構成                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  入力                     処理                      出力         │
│  ──────                 ──────                   ──────         │
│  - ユーザー情報     →   VPS/WP自動構築       →   - サブドメインURL │
│  - サイト名                                      - WP REST API    │
│  - テーマ設定                                    - 管理者認証情報  │
│                                                                 │
│  ──────────────────────────────────────────────────────────────  │
│                                                                 │
│  検証方法                                                        │
│  - CLIツールで手動実行                                           │
│  - curlでREST API動作確認                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**重要:** このストリームはNext.jsアプリなしで動作確認できる状態を目指す

---

## フェーズ一覧

### W-1: VPSプロビジョニング

**ゴール:** Hetzner APIでサーバー自動作成

| タスク | 成果物 | 状態 |
|--------|--------|------|
| Hetzner Cloud API統合 | API クライアント | ⬜ 未完了 |
| VPS自動作成スクリプト | `create-vps.ts` | ⬜ 未完了 |
| 初期セットアップスクリプト | cloud-init / shell | ⬜ 未完了 |
| SSH接続クライアント | `ssh-client.ts` | ✅ 完了 |

**MVP構成:**
- 単一VPS（CX21: €4.49/mo）に全ユーザーを収容
- WordPress Multisite でサブドメイン分離

---

### W-2: WordPress Multisite

**ゴール:** WordPress Multisiteの自動インストール

| タスク | 成果物 | 状態 |
|--------|--------|------|
| Nginx設定テンプレート | nginx.conf | ⬜ 未完了 |
| PHP-FPM設定 | php-fpm.conf | ⬜ 未完了 |
| MariaDB設定 | my.cnf | ⬜ 未完了 |
| WordPress自動インストール | WP-CLI | ⬜ 未完了 |
| Multisite有効化 | WP-CLI | ⬜ 未完了 |

**構成:**
```
*.argonote.app
   ├── user1.argonote.app (Site 1)
   ├── user2.argonote.app (Site 2)
   └── user3.argonote.app (Site 3)
```

---

### W-3: サイト作成API

**ゴール:** 新規ユーザー用サブサイトの自動作成

| タスク | 成果物 | 状態 |
|--------|--------|------|
| WP-CLI実行関数 | `wp-cli.ts` | ✅ 完了 |
| サイト作成関数 | `wp site create` | ✅ 完了 |
| テーマ設定関数 | `wp theme activate` | ✅ 完了 |
| 管理者ユーザー作成 | `wp user create` | ⬜ 未完了 |
| REST API Application Password発行 | `wp user application-password add` | ⬜ 未完了 |

**CLIでの動作確認:**
```bash
# サイト作成
node scripts/create-site.js --slug user1 --title "User1のブログ"

# 確認
curl https://user1.argonote.app/wp-json/wp/v2/posts
```

---

### W-4: 記事投稿API

**ゴール:** 外部から記事を投稿する機能

| タスク | 成果物 | 状態 |
|--------|--------|------|
| REST API認証設定 | Application Password | ⬜ 未完了 |
| 記事投稿関数 | `post-article.ts` | ⬜ 未完了 |
| 画像アップロード関数 | `upload-media.ts` | ⬜ 未完了 |
| 投稿確認スクリプト | テスト用 | ⬜ 未完了 |

**REST API使用例:**
```typescript
const response = await fetch(`https://${slug}.argonote.app/wp-json/wp/v2/posts`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${base64(username:appPassword)}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: article.title,
    content: article.content,
    status: 'publish'
  })
});
```

---

### W-5: 動作検証

**ゴール:** E2Eテスト、信頼性確認

| タスク | 成果物 | 状態 |
|--------|--------|------|
| サイト作成E2Eテスト | テストスクリプト | ⬜ 未完了 |
| 記事投稿E2Eテスト | テストスクリプト | ⬜ 未完了 |
| エラーハンドリング検証 | 異常系テスト | ⬜ 未完了 |
| 同時作成テスト | 並行性テスト | ⬜ 未完了 |

**成功基準:**
- サイト作成が60秒以内に完了
- 作成したサイトにHTTPSでアクセス可能
- REST APIで記事投稿が成功

---

## 技術スタック

| コンポーネント | 技術 | 状態 |
|---------------|------|------|
| VPS | Hetzner Cloud | ⬜ |
| OS | Ubuntu 22.04 LTS | ⬜ |
| Web Server | Nginx | ⬜ |
| PHP | PHP 8.2 + PHP-FPM | ⬜ |
| Database | MariaDB | ⬜ |
| WordPress | Multisite (サブドメイン) | ⬜ |
| SSL | Cloudflare (ワイルドカード) | ⬜ |
| Automation | SSH + WP-CLI | ✅ |

---

## 環境変数

```bash
# VPS接続
VPS_HOST="xxx.xxx.xxx.xxx"
VPS_SSH_PRIVATE_KEY="base64-encoded-key"
VPS_SSH_USER="root"

# WordPress
WP_DOMAIN="argonote.app"

# 暗号化 (AES-256-GCM)
ENCRYPTION_KEY="64-char-hex-string"

# Cloudflare (参照用)
CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_ZONE_ID="..."
```

---

## 成功基準

1. **スタンドアローン動作:** Next.jsアプリなしでサイト作成が完了する
2. **速度:** サイト作成が60秒以内に完了
3. **信頼性:** 10回連続でサイト作成が成功する
4. **セキュリティ:** HTTPS有効、WAF保護下で動作

---

## 出力仕様

### サイト作成結果
```json
{
  "site_id": 2,
  "url": "https://user1.argonote.app",
  "admin_url": "https://user1.argonote.app/wp-admin",
  "rest_api": "https://user1.argonote.app/wp-json/wp/v2",
  "credentials": {
    "username": "admin_user1",
    "application_password": "xxxx xxxx xxxx xxxx"
  },
  "created_at": "2026-01-29T12:00:00Z"
}
```

---

## 旧ドキュメントとの対応

| 旧Phase | 対応 |
|---------|------|
| [Phase 1: Infrastructure](./Phase1_Infrastructure.md) | W-1, W-2, W-3 |
