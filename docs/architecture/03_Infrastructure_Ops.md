# 03. インフラ・WordPress実行基盤アーキテクチャ

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [マスターアーキテクチャ](./00_Master_Architecture.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [Multisite検討](./06_Multisite_feasibility.md) | [**Multisiteガイド**](./07_WordPress_Multisite_Guide.md)
> **実装フェーズ:** [Phase 1: Infrastructure](../phases/Phase1_Infrastructure.md), [Phase 6: MVP Launch](../phases/Phase6_MVPLaunch.md), [Phase 8: Custom Domain](../phases/Phase8_CustomDomain.md)

本サービスのコアコンピタンスである「WordPressの自動構築・運用」を担うインフラ層の設計です。

**最大懸念リスク:** WordPress Multisiteの保守運用におけるトラブル（CONCEPT_DECISIONS.md I3参照）

## 実行環境 (Hosting)

**Platform:** DigitalOcean VPS (Droplets)

- **理由:** コストパフォーマンスが最も良く、詳細な制御が可能。

## アーキテクチャ: WordPress Multisite

> **詳細ガイド:** [WordPress Multisite実装ガイド](./07_WordPress_Multisite_Guide.md)
> ドメイン戦略、セキュリティ設計、スケーリング方針の詳細を参照

**採用理由:**
- 1つのWordPressインストールで複数サイトを管理（効率的）
- サイト作成が即座（0.1秒）に完了
- バージョン管理・セキュリティパッチが一元管理
- リソース効率が高い（共有メモリ + キャッシュ）

## スケーリングロードマップ

### Phase 1: MVP (0-100 Users)

- **Infrastructure:** Single VPS (DigitalOcean Droplet - $24/mo)
- **Spec:** 2 vCPU / 4GB RAM / 80GB SSD
- **構成:**
  - Nginx + PHP-FPM + WordPress Multisite
  - MariaDB (同一サーバー)
  - Redis Object Cache（オプション）
- **メリット:** 運用コスト最小、構成シンプル
- **監視:**
  - UptimeRobot（サイト稼働、1分間隔）
  - DigitalOcean Monitoring（CPU/メモリ/ディスク）
  - Sentry（エラー検知）
- **バックアップ:** DigitalOcean Backups（週次自動）
- **復旧目標:** 4時間以内（手動）

### Phase 2: Growth (100-500 Users)

- **Strategy:** Vertical Scaling（スケールアップ）
- **Infrastructure:** Single VPS (Resize -> $48 or $96/mo)
- **Spec:** 4 vCPU / 8GB RAM / 160GB SSD
- **追加対応:**
  - Redis Object Cache必須化
  - Cloudflare Full Cacheの活用
  - データベース最適化

### Phase 3: Scale (500+ Users)

- **Strategy:** Horizontal Scaling（スケールアウト）
- **Infrastructure:** Multi-VPS Strategy
- **構成:**
  - **Node A (既存):** 500ユーザーを収容。これ以上増やさない。
  - **Node B (新規):** 新規ユーザー501人目からはこちらにデプロイ。
- **Network:**
  - Cloudflare DNS → 各NodeのIPへ直接ルーティング
  - 各Node内でNginxがサブドメインをMultisiteにルーティング

## サイト作成フロー

```bash
# WP-CLIで新規サイトを即座に作成
wp site create --slug=newclient --title="New Client Blog" --email=admin@example.com
```

所要時間: **0.1秒以下**

## セキュリティと隔離

- **論理的隔離:** Multisite内の各サイトはDB上で論理分離
- **ネットワーク:** 外部からは Cloudflare (Proxy) 経由の443ポートのみ許可
- **WAF:** Cloudflare WAFを標準適用
- **WordPress強化:**
  - プラグイン最小化（必要最低限のみ）
  - 自動アップデート有効化
  - 管理画面へのIP制限（オプション）

## "Exit Strategy" のためのエクスポート機能

ユーザーが離脱する際、以下のデータをエクスポート可能:

1. **WordPress標準エクスポート:** 「ツール > エクスポート」でXML形式
2. **Migrationプラグイン:** All-in-One WP Migrationでシングルサイトとして移行可能

**結論:** Multisite方式でも十分に移行可能。ロックインにはならない。

## 自動構築フロー

1. バックエンドAPIから「作成リクエスト」を受信
2. SSH経由でVPSに接続、WP-CLIを実行
3. `wp site create --slug=xxx` で新規サイト作成
4. Cloudflare API でDNSレコード（A record）を追加
5. 初期設定（テーマ適用、プラグイン有効化）

## Nginxサーバー設定

```nginx
server {
    listen 443 ssl http2;
    server_name *.argonote.app;

    ssl_certificate /etc/letsencrypt/live/argonote.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/argonote.app/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/argonote;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }

    # Deny access to sensitive files
    location ~ /\.(htaccess|htpasswd|git) {
        deny all;
    }
}
```
