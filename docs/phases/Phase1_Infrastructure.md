# Phase 1: Infrastructure（基盤構築）詳細仕様書

**テーマ:** Foundation Building
**ゴール:** ユーザーが登録した瞬間に、HTTPS対応のブログURL（`xxx.productblog.com`）が即座に発行されるインフラ基盤を完成させる。
**期間:** Week 3-4

---

## 1. 目的

集客したユーザーが「今すぐ試したい」と思った時、一秒も待たせずに環境を提供するための技術的基盤です。**「SSL (HTTPS) 必須」** を原則とし、2026年の標準に準拠したセキュアな環境を提供します。

## 2. 実装項目

### Step 1: VPS & ドメイン基盤

- DigitalOcean での Droplet 構築。
- `productblog.com` を取得し、ワイルドカードDNS（`*.productblog.com` → VPS IP）を設定。

### Step 2: Security & Wildcard SSL

- Cloudflare または Let's Encrypt を使用した、**ワイルドカードSSL証明書の自動発行・更新**。
- どのサブドメインが生成されても、即座に「鍵マーク（HTTPS）」がついた状態でアクセス可能にする。
- **WAF (Cloudflare):** DDoS攻撃や一般的なWeb攻撃からサイトを保護。

### Step 3: WordPress Multisite

- 一つのWordPressから無限にサブドメイン（サイト）を切り出せる「Multisite」の構築。
- WP-CLI を組み込み、バックエンドからプログラムでサイトを即時作成できる状態にする。

---

## 3. 成功基準

- サーバー上でコマンド一つ叩けば、`https://demo.productblog.com` が SSL 有効な状態で一瞬で立ち上がること。
- セキュリティ設定（Firewall等）が正しく施されていること。
