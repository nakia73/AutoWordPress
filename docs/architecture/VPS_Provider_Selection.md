# 11. VPSプロバイダー選定 - Hetzner採用決定

> **作成日:** 2026-01-27
> **決定事項:** Hetznerを採用（DigitalOceanから変更）
> **関連ドキュメント:** [インフラアーキテクチャ](./03_Infrastructure_Ops.md) | [コスト分析](../business/Cost_Revenue_Analysis.md)

---

## 1. 決定事項

**VPSプロバイダー: Hetzner**

DigitalOceanからHetznerへ変更。コスト効率を最優先とした決定。

---

## 2. 選定理由

### 2.1 コスト比較

| スペック | DigitalOcean | Hetzner | 削減率 |
|----------|-------------|---------|--------|
| 4GB / 2CPU / 80GB | $24/月 | €4.5 (~$5)/月 | **79%** |
| 8GB / 4CPU / 160GB | $48/月 | €8.5 (~$9)/月 | **81%** |
| 16GB / 8CPU / 320GB | $96/月 | €15 (~$16)/月 | **83%** |
| 32GB / 8CPU / 640GB | $192/月 | €29 (~$31)/月 | **84%** |

### 2.2 スケール時のコスト差（年間）

| ユーザー規模 | DigitalOcean | Hetzner | 年間削減額 |
|-------------|-------------|---------|-----------|
| 100人 | $346 | $72 | **$274** |
| 500人 | $691 | $130 | **$561** |
| 2,000人 | $2,909 | $564 | **$2,345** |
| 5,000人 | $6,874 | $1,620 | **$5,254** |
| 10,000人 | $13,603 | $2,988 | **$10,615** |

### 2.3 5年間の累積コスト差

```
10,000ユーザー運用時:
├─ DigitalOcean: $68,015
├─ Hetzner:      $14,940
└─ 差額: $53,075（約800万円）
```

---

## 3. レイテンシとCloudflareによるカバー

### 3.1 Hetznerデータセンター位置

- **Falkenstein（ドイツ）**
- **Nuremberg（ドイツ）**
- **Helsinki（フィンランド）**

日本からの直接アクセス: 約250ms

### 3.2 Cloudflareによるカバー

```
読者アクセス（記事閲覧）:
日本ユーザー → Cloudflare東京POP (20-30ms) → キャッシュヒット
                                           ↓ キャッシュミス時のみ
                                    Hetzner (250ms)

結論: 読者向けは問題なし（CDNキャッシュで解決）
```

| ケース | レイテンシ | 影響 |
|--------|-----------|------|
| 記事閲覧（読者） | 20-30ms | ✅ 問題なし（CDNキャッシュ） |
| 画像・CSS・JS | 20-30ms | ✅ 問題なし（CDNキャッシュ） |
| WordPress管理画面 | 250-300ms | ⚠️ 許容範囲 |
| 記事投稿API（Inngest経由） | 250-300ms | ✅ 非同期のため影響なし |

### 3.3 WordPress管理画面の遅延について

**許容とする理由:**
1. ユーザーの主要操作画面はVercel側のNext.jsアプリ
2. 「放置OK」コンセプトのため、WP管理画面へのアクセス頻度は極めて低い
3. 管理画面を使うのは主に運営者のみ

---

## 4. アプリケーション整合性

### 4.1 影響分析

| コンポーネント | 通信経路 | 影響 |
|---------------|---------|------|
| Vercel → VPS | Inngest経由（非同期） | ✅ 変更不要 |
| Supabase → VPS | 直接通信なし | ✅ 変更不要 |
| Inngest → VPS | SSH/HTTP | ✅ 変更不要 |
| Cloudflare DNS | Aレコード変更のみ | ✅ 設定変更のみ |
| Cloudflare CDN | オリジンIP変更 | ✅ 設定変更のみ |
| WP-CLI/SSH | IPアドレス変更 | ✅ 環境変数変更のみ |

### 4.2 必要な変更

```
環境変数の変更:
├─ VPS_HOST: 新しいHetzner IPアドレス
└─ VPS_SSH_PRIVATE_KEY: 新サーバー用の鍵

Cloudflare設定:
└─ Aレコード: argonote.app → 新しいHetzner IP

コード変更: なし
```

---

## 5. バックアップ戦略

### 5.1 DigitalOceanとの違い

| 項目 | DigitalOcean | Hetzner |
|------|-------------|---------|
| 自動バックアップ | Droplet Backups (+20%) | なし（手動スナップショット） |
| スナップショット | あり | あり（€0.01/GB/月） |
| 外部連携 | あり | あり |

### 5.2 推奨バックアップ構成

```
Hetzner VPS
    ↓ cronジョブ（毎日深夜）
    ↓ WP-CLI: wp db export
    ↓ tar.gz圧縮
    ↓
Cloudflare R2（外部ストレージ）
    ├─ /backups/daily/    → 7日保持
    ├─ /backups/weekly/   → 4週間保持
    └─ /backups/monthly/  → 3ヶ月保持
```

### 5.3 バックアップスクリプト例

```bash
#!/bin/bash
# /opt/scripts/backup.sh

DATE=$(date +%Y-%m-%d)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)

# 1. DBバックアップ
wp db export /tmp/db-$DATE.sql --path=/var/www/wordpress
gzip /tmp/db-$DATE.sql

# 2. wp-contentバックアップ
tar -czf /tmp/wp-content-$DATE.tar.gz /var/www/wordpress/wp-content

# 3. R2にアップロード（rclone使用）
rclone copy /tmp/db-$DATE.sql.gz r2:backups/daily/
rclone copy /tmp/wp-content-$DATE.tar.gz r2:backups/daily/

# 週次バックアップ（日曜日）
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    rclone copy /tmp/db-$DATE.sql.gz r2:backups/weekly/
    rclone copy /tmp/wp-content-$DATE.tar.gz r2:backups/weekly/
fi

# 月次バックアップ（1日）
if [ "$DAY_OF_MONTH" -eq "01" ]; then
    rclone copy /tmp/db-$DATE.sql.gz r2:backups/monthly/
    rclone copy /tmp/wp-content-$DATE.tar.gz r2:backups/monthly/
fi

# 4. ローカル一時ファイル削除
rm /tmp/db-$DATE.sql.gz /tmp/wp-content-$DATE.tar.gz
```

### 5.4 バックアップコスト比較

| 方式 | 500GBあたり月額 |
|------|----------------|
| DO Backups (+20%) | $9.60 |
| Hetzner Snapshots | €5 (~$5.40) |
| **Cloudflare R2** | **$7.50** |

---

## 6. 移行手順

### 6.1 新規構築の場合（推奨）

1. Hetznerアカウント作成
2. CX21（4GB）サーバー作成（Falkenstein推奨）
3. Ubuntu 22.04 LTSインストール
4. WordPress Multisiteセットアップ
5. Cloudflare DNSのAレコード変更
6. 環境変数（VPS_HOST）更新
7. 動作確認

### 6.2 既存環境からの移行

1. 新Hetznerサーバー構築
2. 既存データのエクスポート（wp db export + wp-content）
3. 新サーバーへインポート
4. DNS切り替え（TTLを短くしておく）
5. 動作確認
6. 旧サーバー停止

---

## 7. Hetznerプラン一覧（参考）

### 7.1 推奨プラン

| フェーズ | ユーザー数 | 推奨プラン | 月額 |
|---------|-----------|-----------|------|
| MVP | 0-100 | CX21 (4GB) | €4.49 |
| 成長期 | 100-500 | CX31 (8GB) | €8.49 |
| スケール | 500+ | CX41 (16GB) × N台 | €14.99/台 |

### 7.2 全プラン一覧

| プラン | vCPU | RAM | SSD | 月額 |
|--------|------|-----|-----|------|
| CX21 | 2 | 4GB | 40GB | €4.49 |
| CX31 | 2 | 8GB | 80GB | €8.49 |
| CX41 | 4 | 16GB | 160GB | €14.99 |
| CX51 | 8 | 32GB | 240GB | €28.99 |
| CCX13 | 2 | 8GB | 80GB | €12.99 (Dedicated) |
| CCX23 | 4 | 16GB | 160GB | €24.99 (Dedicated) |

---

## 8. リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 日本語サポートなし | 低 | 英語ドキュメント充実、コミュニティ活発 |
| UI/UXがシンプル | 低 | 機能的には十分 |
| 自動バックアップなし | 中 | R2 + cronスクリプトで代替 |
| 日本リージョンなし | 低 | Cloudflare CDNでカバー |

---

## 9. 決定履歴

| 日付 | 決定事項 | 理由 |
|------|---------|------|
| 2026-01-27 | Hetzner採用決定 | コスト効率（79-84%削減）、Cloudflareでレイテンシカバー可能、アプリ整合性問題なし |

---

*最終更新: 2026-01-27*
