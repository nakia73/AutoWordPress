# Phase 1: Infrastructure + Auth（基盤構築 + 認証）

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [インフラ仕様](../architecture/03_Infrastructure_Ops.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [Multisite検討](../architecture/06_Multisite_feasibility.md)
> **前のフェーズ:** [← Phase 0: Mockup](./Phase0_Mockup.md) | **次のフェーズ:** [Phase 2: Core AI →](./Phase2_CoreAI.md)
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

- DigitalOcean での Droplet 構築（$24/mo）
- `argonote.app` を取得し、ワイルドカードDNS（`*.argonote.app` → VPS IP）を設定

### Step 2: Security & Wildcard SSL

- Cloudflare を使用した**ワイルドカードSSL証明書の自動発行・更新**
- どのサブドメインが生成されても、即座に「鍵マーク（HTTPS）」がついた状態でアクセス可能
- **WAF (Cloudflare):** DDoS攻撃や一般的なWeb攻撃からサイトを保護

### Step 3: WordPress Multisite

- 一つのWordPressから無限にサブドメイン（サイト）を切り出せる「Multisite」の構築
- WP-CLI を組み込み、バックエンドからプログラムでサイトを即時作成できる状態にする

### Step 4: 認証基盤（追加）

- **Supabase Auth** のセットアップ
- **Google OAuth** 対応（MVP必須 - 認知負荷軽減）
- Email/Password 認証（オプション）
- セッション管理

### Step 5: 監視・バックアップ

- UptimeRobot（サイト稼働監視）
- DigitalOcean Monitoring（リソース監視）
- DigitalOcean Backups（週次自動バックアップ）

---

## 3. 成功基準

- サーバー上でコマンド一つ叩けば、`https://demo.argonote.app` が SSL 有効な状態で一瞬で立ち上がること
- Supabase Authでユーザー登録・ログインができること
- Google OAuth でワンクリックログインができること
- セキュリティ設定（Firewall等）が正しく施されていること
- 監視・バックアップが正常に動作していること
