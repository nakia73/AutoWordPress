# Stream02 セットアップガイド

> **本ドキュメントは開発者向けの設定手順書です。**
>
> Stream02を動作させるために必要な外部サービス登録、VPS設定、環境変数の設定方法を説明します。

---

## 確定した技術スタック

| コンポーネント | サービス | 備考 |
|--------------|---------|------|
| VPS | **Hetzner Cloud** | CX21以上推奨 |
| DNS/CDN | **Cloudflare**（無料プラン） | ワイルドカードSSL対応 |
| SSL | **Cloudflare SSL** + Origin Certificate | VPS側はOrigin Certificate |
| ドメイン | `example.com`（仮名） | 実際のドメイン確定後に置換 |

---

## 目次

1. [サービス登録・初期設定](#1-サービス登録初期設定)
2. [Hetzner Cloud（VPS）](#2-hetzner-cloudvps)
3. [Cloudflare（DNS/SSL）](#3-cloudflarednsssl)
4. [VPS初期設定](#4-vps初期設定)
5. [WordPressセットアップ](#5-wordpressセットアップ)
6. [環境変数の設定](#6-環境変数の設定)
7. [ローカル開発環境](#7-ローカル開発環境)
8. [動作確認](#8-動作確認)

---

## 1. サービス登録・初期設定

### 1.1 必要なアカウント

| サービス | URL | 用途 |
|---------|-----|------|
| Hetzner Cloud | https://accounts.hetzner.com/signUp | VPSホスティング |
| Cloudflare | https://dash.cloudflare.com/sign-up | DNS/CDN/SSL |
| ドメインレジストラ | 任意（お名前.com、Google Domains等） | ドメイン取得 |

### 1.2 ドメイン取得

1. 任意のレジストラで `.com` ドメインを取得
2. ネームサーバーはCloudflareに変更するため、レジストラ側のDNS設定は不要

---

## 2. Hetzner Cloud（VPS）

### 2.1 プロジェクト作成

1. Hetzner Cloud Console にログイン
2. 「New Project」でプロジェクト作成（例: `argo-note`）

### 2.2 SSHキーの登録

**ローカルでキー作成:**
```bash
# ED25519キーを作成
ssh-keygen -t ed25519 -C "stream02-vps" -f ~/.ssh/stream02_ed25519

# 公開鍵の内容をコピー
cat ~/.ssh/stream02_ed25519.pub
```

**Hetznerに登録:**
1. Cloud Console → Security → SSH Keys
2. 「Add SSH Key」で公開鍵を貼り付け
3. Name: `stream02-key`

### 2.3 サーバー作成

| 設定項目 | 推奨値 |
|---------|-------|
| Location | Falkenstein (eu-central) または Ashburn (us-east) |
| Image | Ubuntu 24.04 |
| Type | CX21（2 vCPU, 4GB RAM, 40GB SSD） |
| SSH Key | 登録したキーを選択 |
| Name | `wp-multisite-01` |

**作成後、IPアドレスをメモ:**
```
IPv4: xxx.xxx.xxx.xxx  ← VPS_HOST に設定
```

### 2.4 秘密鍵のBase64エンコード

環境変数用にBase64エンコード:
```bash
base64 -i ~/.ssh/stream02_ed25519 | tr -d '\n'
```

出力を `VPS_SSH_PRIVATE_KEY` に設定します。

---

## 3. Cloudflare（DNS/SSL）

### 3.1 サイト追加

1. Cloudflare Dashboard → 「Add a Site」
2. ドメイン名を入力（例: `example.com`）
3. プラン: **Free** を選択
4. 「Continue」

### 3.2 ネームサーバー変更

Cloudflareが指示するネームサーバーをドメインレジストラで設定:
```
例:
  ns1.cloudflare.com
  ns2.cloudflare.com
```

**反映確認（最大48時間）:**
```bash
dig NS example.com
```

### 3.3 DNSレコード設定

Cloudflare Dashboard → DNS → Records で以下を追加:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `xxx.xxx.xxx.xxx`（VPS IP） | Proxied (orange) |
| A | `*` | `xxx.xxx.xxx.xxx`（VPS IP） | Proxied (orange) |

**重要:** Proxy を「Proxied」（オレンジ雲）にすることでCloudflare経由のSSL終端が有効になります。

### 3.4 SSL/TLS設定

**SSL/TLS → Overview:**
- Encryption mode: **Full (strict)**

**SSL/TLS → Origin Server:**
1. 「Create Certificate」をクリック
2. 設定:
   - Private key type: RSA (2048)
   - Hostnames: `example.com`, `*.example.com`
   - Certificate Validity: 15 years
3. 「Create」

**証明書と秘密鍵をVPSに保存:**
```bash
# VPSにSSH接続
ssh root@xxx.xxx.xxx.xxx

# ディレクトリ作成
mkdir -p /etc/ssl/cloudflare

# 証明書を保存（Cloudflareの画面からコピー）
nano /etc/ssl/cloudflare/cert.pem
# Origin Certificate の内容を貼り付け

# 秘密鍵を保存
nano /etc/ssl/cloudflare/key.pem
# Private Key の内容を貼り付け

# 権限設定
chmod 600 /etc/ssl/cloudflare/key.pem
chmod 644 /etc/ssl/cloudflare/cert.pem
```

### 3.5 追加のセキュリティ設定（推奨）

**SSL/TLS → Edge Certificates:**
- Always Use HTTPS: ON
- Automatic HTTPS Rewrites: ON
- Minimum TLS Version: TLS 1.2

**Security → Settings:**
- Security Level: Medium
- Challenge Passage: 30 minutes

---

## 4. VPS初期設定

### 4.1 システム更新

```bash
ssh root@xxx.xxx.xxx.xxx

# システム更新
apt update && apt upgrade -y

# タイムゾーン設定
timedatectl set-timezone Asia/Tokyo
```

### 4.2 必要パッケージのインストール

```bash
# Nginx
apt install -y nginx

# PHP 8.3 + 必要な拡張
apt install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd \
  php8.3-intl php8.3-mbstring php8.3-soap php8.3-xml php8.3-zip \
  php8.3-imagick php8.3-bcmath

# MariaDB
apt install -y mariadb-server

# その他ツール
apt install -y curl unzip git
```

### 4.3 WP-CLIインストール

```bash
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# 動作確認
wp --info
```

### 4.4 MariaDBセキュリティ設定

```bash
mysql_secure_installation
```

プロンプトに応答:
- Enter current password for root: （空欄でEnter）
- Switch to unix_socket authentication: n
- Change the root password: Y → 強力なパスワードを設定
- Remove anonymous users: Y
- Disallow root login remotely: Y
- Remove test database: Y
- Reload privilege tables: Y

### 4.5 WordPress用データベース作成

```bash
mysql -u root -p
```

```sql
CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 5. WordPressセットアップ

### 5.1 WordPressダウンロード

```bash
mkdir -p /var/www/wordpress
cd /var/www/wordpress

wp core download --allow-root
```

### 5.2 wp-config.php作成

```bash
wp config create \
  --dbname=wordpress \
  --dbuser=wp_user \
  --dbpass=YOUR_STRONG_PASSWORD \
  --dbhost=localhost \
  --dbcharset=utf8mb4 \
  --allow-root

# Multisite用の定数を追加
wp config set WP_ALLOW_MULTISITE true --raw --allow-root
```

### 5.3 WordPressインストール

```bash
wp core install \
  --url="https://example.com" \
  --title="Site Network" \
  --admin_user=admin \
  --admin_password=YOUR_ADMIN_PASSWORD \
  --admin_email=admin@example.com \
  --allow-root
```

### 5.4 Multisite有効化

```bash
wp core multisite-convert --subdomains --allow-root
```

**wp-config.php に以下が追加されていることを確認:**
```php
define( 'MULTISITE', true );
define( 'SUBDOMAIN_INSTALL', true );
define( 'DOMAIN_CURRENT_SITE', 'example.com' );
define( 'PATH_CURRENT_SITE', '/' );
define( 'SITE_ID_CURRENT_SITE', 1 );
define( 'BLOG_ID_CURRENT_SITE', 1 );
```

### 5.5 Nginx設定

`/etc/nginx/sites-available/wordpress`:

```nginx
server {
    listen 80;
    server_name example.com *.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com *.example.com;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    root /var/www/wordpress;
    index index.php;

    # Cloudflareからの接続のみ許可（オプション）
    # set_real_ip_from 103.21.244.0/22;
    # set_real_ip_from 103.22.200.0/22;
    # ... (Cloudflare IP ranges)
    # real_ip_header CF-Connecting-IP;

    # WordPress Multisite rewrites
    if (!-e $request_filename) {
        rewrite /wp-admin$ $scheme://$host$uri/ permanent;
        rewrite ^(/[^/]+)?(/wp-.*) $2 last;
        rewrite ^(/[^/]+)?(/.*\.php) $2 last;
    }

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires max;
        log_not_found off;
    }

    # wp-config.phpへのアクセス禁止
    location = /wp-config.php {
        deny all;
    }

    # .htaccessへのアクセス禁止
    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# 有効化
ln -s /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# テスト & 再起動
nginx -t && systemctl restart nginx
```

### 5.6 ファイル権限

```bash
chown -R www-data:www-data /var/www/wordpress
find /var/www/wordpress -type d -exec chmod 755 {} \;
find /var/www/wordpress -type f -exec chmod 644 {} \;
chmod 600 /var/www/wordpress/wp-config.php
```

### 5.7 動作確認

ブラウザで `https://example.com/wp-admin/` にアクセスし、ログインできることを確認。

---

## 6. 環境変数の設定

### 6.1 環境変数一覧

| 変数名 | 必須 | 説明 | 例 |
|--------|:----:|------|-----|
| `VPS_HOST` | ✅ | VPSのIPアドレス | `123.45.67.89` |
| `VPS_SSH_USER` | | SSHユーザー（デフォルト: root） | `root` |
| `VPS_SSH_PRIVATE_KEY` | ✅ | Base64エンコードされたSSH秘密鍵 | `LS0tLS1CRUdJTi...` |
| `VPS_SSH_PORT` | | SSHポート（デフォルト: 22） | `22` |
| `WP_DOMAIN` | ✅ | WordPressベースドメイン | `example.com` |
| `WP_PATH` | | WordPressパス（デフォルト: /var/www/wordpress） | `/var/www/wordpress` |
| `ENCRYPTION_KEY` | ✅ | AES-256暗号化キー（64文字HEX） | `a1b2c3...` |

### 6.2 暗号化キーの生成

```bash
openssl rand -hex 32
```

### 6.3 .env.local作成

```bash
cd stream-02
cp .env.example .env.local
```

`.env.local`:
```env
# VPS Connection
VPS_HOST="xxx.xxx.xxx.xxx"
VPS_SSH_USER="root"
VPS_SSH_PRIVATE_KEY="LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBV..."
VPS_SSH_PORT="22"

# WordPress
WP_DOMAIN="example.com"
WP_PATH="/var/www/wordpress"

# Encryption
ENCRYPTION_KEY="a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890"
```

---

## 7. ローカル開発環境

### 7.1 依存関係インストール

```bash
cd stream-02
npm install
```

### 7.2 開発サーバー起動

```bash
npm run dev -- --webpack -p 3001
```

http://localhost:3001 にアクセス

---

## 8. 動作確認

### 8.1 接続テスト

1. http://localhost:3001 → 「Connection Test」
2. 確認項目:
   - SSH接続: ✅ Connected
   - WP-CLI: ✅ Available

### 8.2 サイト作成テスト

1. 「Site Setup」→ サイト情報を入力
2. 「Create Site」
3. 結果確認:
   - Site URL: `https://test-001.example.com`
   - Application Password: 発行されること

### 8.3 記事投稿テスト

1. 「Article Post Test」
2. 発行された認証情報を入力
3. 「Post Test Article」
4. 結果確認:
   ```json
   {
     "success": true,
     "data": {
       "postId": 123,
       "postUrl": "https://test-001.example.com/?p=123"
     }
   }
   ```

---

## トラブルシューティング

### Cloudflare 520/521/522 エラー

| エラー | 原因 | 対処 |
|-------|------|------|
| 520 | Webサーバーが不正なレスポンス | Nginxログ確認 |
| 521 | Webサーバーがダウン | `systemctl status nginx` |
| 522 | 接続タイムアウト | ファイアウォール確認 |

### SSH接続エラー

```bash
# デバッグモードで接続テスト
ssh -vvv root@xxx.xxx.xxx.xxx
```

### WP-CLIエラー

```bash
# VPSで直接確認
cd /var/www/wordpress
wp core version --allow-root
```

---

## セキュリティチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] VPSのファイアウォールで22, 80, 443のみ開放
- [ ] WordPressの管理者パスワードが強力
- [ ] MariaDBのrootパスワードが設定済み
- [ ] Cloudflare SSL設定が「Full (strict)」

---

## 関連ドキュメント

- [README.md](./README.md) - Stream02概要
- [../docs/phases/Stream02_Spec.md](../docs/phases/Stream02_Spec.md) - 仕様書
- [../docs/phases/Stream02_WordPress.md](../docs/phases/Stream02_WordPress.md) - 技術詳細
