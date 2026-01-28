# Phase 1: Infrastructure + Auth（基盤構築 + 認証）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [インフラ仕様](../architecture/03_Infrastructure_Ops.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [Multisite検討](../architecture/06_Multisite_feasibility.md) | [**Multisiteガイド**](../architecture/07_WordPress_Multisite_Guide.md)
> **前のフェーズ:** [← Phase 0.5: MVP Branding](./Phase0.5_MVPBranding.md) | **次のフェーズ:** [Phase 2: Core AI →](./Phase2_CoreAI.md)
>
> **実施週:** Week 1

**テーマ:** Foundation Building
**ゴール:** ユーザーが登録した瞬間に、HTTPS対応のブログURL（`xxx.argonote.app`）が即座に発行されるインフラ基盤と、認証システムを完成させる。

---

## 1. 目的

集客したユーザーが「今すぐ試したい」と思った時、一秒も待たせずに環境を提供するための技術的基盤です。**「SSL (HTTPS) 必須」** を原則とし、2026年の標準に準拠したセキュアな環境を提供します。

**認証基盤をこのフェーズで構築**することで、Phase 2以降のAI機能開発時にユーザー識別が可能になります。

## 2. 実装項目

### Step 1: VPS & ドメイン基盤

- Hetzner Cloud での VPS 構築（CX21: €4.49/mo ≈ $5/mo）→ [選定理由](../architecture/11_VPS_Provider_Selection.md)
- `argonote.app` を取得し、ワイルドカードDNS（`*.argonote.app` → VPS IP）を設定

### Step 2: Security & Wildcard SSL

- Cloudflare を使用した**ワイルドカードSSL証明書の自動発行・更新**
- どのサブドメインが生成されても、即座に「鍵マーク（HTTPS）」がついた状態でアクセス可能
- **WAF (Cloudflare):** DDoS攻撃や一般的なWeb攻撃からサイトを保護

### Step 3: WordPress Multisite

- 一つのWordPressから無限にサブドメイン（サイト）を切り出せる「Multisite」の構築
- WP-CLI を組み込み、バックエンドからプログラムでサイトを即時作成できる状態にする
- **詳細:** [WordPress Multisite実装ガイド](../architecture/07_WordPress_Multisite_Guide.md)（ドメイン戦略・セキュリティ設計含む）

### Step 4: 認証基盤（追加）

- **Supabase Auth** のセットアップ
- **Google OAuth** 対応（MVP必須 - 認知負荷軽減）
- Email/Password 認証（オプション）
- セッション管理

### Step 5: 監視・バックアップ

- UptimeRobot（サイト稼働監視）
- Hetzner Cloud Console（リソース監視）
- Cloudflare R2 + cronスクリプト（日次自動バックアップ）→ [バックアップ戦略](../architecture/11_VPS_Provider_Selection.md#5-バックアップ戦略)

---

## 3. 実装チェックリスト（2026-01-27 追加）

### Step 1: VPS & ドメイン基盤

| タスク | 状態 | 備考 |
|--------|------|------|
| Hetzner Cloud VPS作成 | ⬜ 未完了 | CX21: €4.49/mo |
| Ubuntu 22.04 LTS インストール | ⬜ 未完了 | |
| `argonote.app` ドメイン取得 | ⬜ 未完了 | |
| Cloudflareへドメイン追加 | ⬜ 未完了 | |
| ワイルドカードDNS設定 (`*.argonote.app`) | ⬜ 未完了 | |

### Step 2: Security & Wildcard SSL

| タスク | 状態 | 備考 |
|--------|------|------|
| Cloudflare SSL設定（Full Strict） | ⬜ 未完了 | |
| オリジン証明書の発行・設置 | ⬜ 未完了 | |
| Cloudflare WAF有効化 | ⬜ 未完了 | |
| VPSファイアウォール設定 | ⬜ 未完了 | 443, 22のみ許可 |

### Step 3: WordPress Multisite

| タスク | 状態 | 備考 |
|--------|------|------|
| Nginx インストール・設定 | ⬜ 未完了 | |
| PHP-FPM インストール・設定 | ⬜ 未完了 | PHP 8.2+ |
| MariaDB インストール・設定 | ⬜ 未完了 | |
| WordPress インストール | ⬜ 未完了 | |
| Multisite有効化 | ⬜ 未完了 | サブドメイン方式 |
| WP-CLI インストール | ⬜ 未完了 | |
| `wp site create` 動作確認 | ⬜ 未完了 | |

### Step 4: 認証基盤

| タスク | 状態 | 備考 |
|--------|------|------|
| Supabase プロジェクト作成 | ✅ 完了 | |
| Supabase Auth 設定 | ✅ 完了 | `app/src/lib/supabase/` |
| Google OAuth 設定 | ✅ 完了 | |
| セッション管理 | ✅ 完了 | middleware.ts |
| ログインUI | ✅ 完了 | `app/src/app/(auth)/login/` |

### Step 5: アプリケーション統合

| タスク | 状態 | 備考 |
|--------|------|------|
| `ssh2` ライブラリ導入 | ✅ 完了 | `npm install ssh2 @types/ssh2` (2026-01-27) |
| SSH接続クライアント実装 | ✅ 完了 | `app/src/lib/vps/ssh-client.ts` |
| WP-CLI実行関数実装 | ✅ 完了 | `app/src/lib/vps/wp-cli.ts` |
| Cloudflare APIクライアント実装 | ⏭️ スキップ | ワイルドカードDNS使用で不要 |
| `provision-blog.ts` 完成 | ✅ 完了 | WP-CLI経由でサイト作成・テーマ設定 |
| `provision_failed` ステータス遷移実装 | ✅ 完了 | `onFailure` ハンドラー実装済み |

### Step 6: 監視・バックアップ

| タスク | 状態 | 備考 |
|--------|------|------|
| UptimeRobot 設定 | ⬜ 未完了 | |
| Hetzner Cloud Console 監視設定 | ⬜ 未完了 | |
| R2バックアップスクリプト設定 | ⬜ 未完了 | cron + rclone |
| Sentry 統合 | ⬜ 未完了 | 環境変数定義済み・未使用 |
| PostHog 統合 | ⬜ 未完了 | 環境変数定義済み・未使用 |

---

## 4. 必要な環境変数

```bash
# VPS接続
VPS_HOST="xxx.xxx.xxx.xxx"
VPS_SSH_PRIVATE_KEY="base64-encoded-key"
VPS_SSH_USER="root"

# WordPress
WP_DOMAIN="argonote.app"
# Encryption (AES-256-GCM)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="64-char-hex-string"

# Cloudflare
CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_ZONE_ID="..."
CLOUDFLARE_ACCOUNT_ID="..."

# 監視
SENTRY_DSN="https://..."
POSTHOG_KEY="phc_..."
```

---

## 5. 成功基準

- サーバー上でコマンド一つ叩けば、`https://demo.argonote.app` が SSL 有効な状態で一瞬で立ち上がること
- Supabase Authでユーザー登録・ログインができること
- Google OAuth でワンクリックログインができること
- セキュリティ設定（Firewall等）が正しく施されていること
- 監視・バックアップが正常に動作していること

---

## 6. 関連Issue

| Issue ID | 問題 | 重大度 | ステータス |
|----------|------|--------|-----------|
| IR-NEW-021 | provision-blog実装未完了（TODO状態） | 🔴 Critical | ✅ **解決** (2026-01-27) |
| IR-NEW-025 | WordPress VPS環境変数未使用 | 🟡 Low | ✅ **解決** - ssh-client.ts/wp-cli.tsで使用 |
| IR-NEW-026 | Cloudflare環境変数未使用 | 🟡 Low | ⏭️ スキップ - ワイルドカードDNS使用 |
| IR-NEW-028 | 監視機能未実装（Sentry/PostHog） | 🟡 Low | ⬜ 未完了 - MVP後対応 |

詳細は [10_Comprehensive_Critical_Issues_Report.md](../architecture/10_Comprehensive_Critical_Issues_Report.md) を参照
