# Stream 02 - タスク管理表

> **関連ドキュメント:** [Stream02_Spec.md](./Stream02_Spec.md) - 単体開発仕様
> **最終更新:** 2026-01-30
> **状態:** 🔄 Milestone 1 進行中（Hetzner身分証明書承認待ち）、Milestone 4 Cloudflare設定完了

---

## 凡例

| アイコン | 意味 |
|---------|------|
| 🧑 | **人間が実行**（Webサイト操作、アカウント作成など） |
| 🤖 | **CLI/MCP自動化可能**（Claude Codeが実行支援可能） |
| 📋 | 計画（未着手） |
| 🔄 | 進行中 |
| ✅ | 完了 |
| ⏸️ | 待機（前タスクの完了待ち） |

---

## 1. マイルストーン概要

```
Milestone 1: VPS + SSH接続
├── 人間: Hetznerアカウント作成、API Token発行
└── 自動化: hcloud CLIでVPS作成、SSHキー登録
    ✓ テスト: ssh root@<IP> で接続成功
                    ↓
Milestone 2: WordPress Multisite（IPアドレス直接）
├── 人間: なし（全自動化可能）
└── 自動化: SSH経由でスクリプト実行
    ✓ テスト: http://<IP>/wp-admin/ でログイン成功
                    ↓
Milestone 3: Stream02 接続テスト
├── 人間: .env.local編集（値のコピペ）
└── 自動化: Base64エンコード、キー生成
    ✓ テスト: Stub UI で Connection Test 成功
                    ↓
Milestone 4: ドメイン + Cloudflare SSL
├── 人間: ドメイン購入、Cloudflareアカウント作成、NS変更
└── 自動化: DNS設定、証明書配置、Nginx更新
    ✓ テスト: Site Create → 記事投稿 まで完走
```

---

## 2. Milestone 1: VPS + SSH接続

**目標:** VPSを作成し、SSH接続できる状態にする
**所要時間目安:** 15-30分

### 2.1 Hetzner アカウント・API設定

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M1-1 | Hetzner アカウント作成 | 🧑 | 1. https://accounts.hetzner.com/signUp にアクセス<br>2. メールアドレス、パスワードを入力<br>3. メール認証を完了<br>4. 住所・支払い情報を登録<br>**状況:** 身分証明書承認待ち | 🔄 |
| M1-2 | プロジェクト作成 | 🧑 | 1. https://console.hetzner.cloud/ にログイン<br>2. 「+ New Project」をクリック<br>3. プロジェクト名を入力（例: `argo-note`）<br>4. 「Add project」をクリック | 📋 |
| M1-3 | API Token 発行 | 🧑 | 1. プロジェクトを選択<br>2. 左メニュー「Security」→「API Tokens」<br>3. 「Generate API Token」をクリック<br>4. 名前入力（例: `stream02-token`）<br>5. 権限: **Read & Write** を選択<br>6. 「Generate API Token」をクリック<br>7. **トークンをコピーして安全な場所に保存**（一度しか表示されない） | 📋 |

### 2.2 ローカル環境セットアップ

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M1-4 | hcloud CLI インストール | 🤖 | `brew install hcloud` | 📋 |
| M1-5 | hcloud 認証設定 | 🤖 | `hcloud context create stream02`<br>→ API Tokenを入力（M1-3で取得したもの） | ⏸️ |

### 2.3 SSHキー作成・登録

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M1-6 | ED25519キー作成 | 🤖 | `ssh-keygen -t ed25519 -C "stream02-vps" -f ~/.ssh/stream02_ed25519 -N ""` | 📋 |
| M1-7 | 公開鍵をHetznerに登録 | 🤖 | `hcloud ssh-key create --name stream02-key --public-key-from-file ~/.ssh/stream02_ed25519.pub` | ⏸️ |

### 2.4 VPS作成

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M1-8 | VPS作成 | 🤖 | ```hcloud server create --name wp-multisite-01 --type cx21 --image ubuntu-24.04 --ssh-key stream02-key --location fsn1``` | ⏸️ |
| M1-9 | IPアドレス取得 | 🤖 | `hcloud server ip wp-multisite-01` | ⏸️ |

### 2.5 テスト

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M1-10 | SSH接続テスト | 🤖 | `ssh -i ~/.ssh/stream02_ed25519 root@<VPS_IP>` | ⏸️ |

**✓ 成功条件:** rootプロンプトが表示される

### 自動化スクリプト（M1-4〜M1-10）

```bash
#!/bin/bash
# 前提: M1-1〜M1-3 が完了していること
# 使用法: HCLOUD_TOKEN="your-token" ./setup-vps.sh

set -e

# 1. hcloud インストール確認
if ! command -v hcloud &> /dev/null; then
    echo "Installing hcloud..."
    brew install hcloud
fi

# 2. 認証設定
echo "Setting up hcloud context..."
echo "$HCLOUD_TOKEN" | hcloud context create stream02 --token -

# 3. SSHキー作成
SSH_KEY_PATH="$HOME/.ssh/stream02_ed25519"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "Creating SSH key..."
    ssh-keygen -t ed25519 -C "stream02-vps" -f "$SSH_KEY_PATH" -N ""
fi

# 4. SSHキー登録
echo "Registering SSH key with Hetzner..."
hcloud ssh-key create --name stream02-key --public-key-from-file "${SSH_KEY_PATH}.pub" 2>/dev/null || true

# 5. VPS作成
echo "Creating VPS..."
hcloud server create \
    --name wp-multisite-01 \
    --type cx21 \
    --image ubuntu-24.04 \
    --ssh-key stream02-key \
    --location fsn1

# 6. IPアドレス取得
VPS_IP=$(hcloud server ip wp-multisite-01)
echo ""
echo "================================"
echo "VPS Created Successfully!"
echo "IP Address: $VPS_IP"
echo "================================"
echo ""
echo "Test connection with:"
echo "  ssh -i ~/.ssh/stream02_ed25519 root@$VPS_IP"
```

---

## 3. Milestone 2: WordPress Multisite（IPアドレス直接）

**目標:** VPS上でWordPress Multisiteが動作する状態にする
**所要時間目安:** 10-15分
**前提:** Milestone 1 完了

### 3.1 WordPress セットアップ（全自動）

| ID | タスク | 実行者 | 詳細 | 状態 |
|----|--------|:------:|------|------|
| M2-1 | セットアップスクリプト転送 | 🤖 | SCPでスクリプトをVPSに転送 | ⏸️ |
| M2-2 | スクリプト実行 | 🤖 | SSH経由でスクリプト実行 | ⏸️ |

### 3.2 実行内容（スクリプト内部）

スクリプトが自動で以下を実行:

| 順序 | 内容 | コマンド例 |
|:----:|------|-----------|
| 1 | システム更新 | `apt update && apt upgrade -y` |
| 2 | Nginx インストール | `apt install -y nginx` |
| 3 | PHP 8.3 インストール | `apt install -y php8.3-fpm php8.3-mysql ...` |
| 4 | MariaDB インストール | `apt install -y mariadb-server` |
| 5 | MariaDB セキュリティ設定 | SQL直接実行（非対話） |
| 6 | WordPress用DB作成 | SQL直接実行 |
| 7 | WP-CLI インストール | `curl + chmod + mv` |
| 8 | WordPress ダウンロード | `wp core download` |
| 9 | wp-config.php 作成 | `wp config create` |
| 10 | WordPress インストール | `wp core install` |
| 11 | Multisite 有効化 | `wp core multisite-convert` |
| 12 | ファイル権限設定 | `chown + chmod` |
| 13 | Nginx 設定 | 設定ファイル作成 + リロード |

### 3.3 テスト

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M2-3 | WordPress動作確認 | 🤖 | `curl -I http://<VPS_IP>/wp-admin/` | ⏸️ |
| M2-4 | ブラウザ確認 | 🧑 | ブラウザで `http://<VPS_IP>/wp-admin/` にアクセス<br>→ ログイン画面が表示されることを確認 | ⏸️ |

**✓ 成功条件:** WordPressログイン画面が表示され、admin/設定したパスワードでログインできる

### セットアップスクリプト

```bash
#!/bin/bash
# wordpress-setup.sh
# VPS上で実行するWordPressセットアップスクリプト

set -e

# ============================================
# 設定値（必要に応じて変更）
# ============================================
DB_ROOT_PASS="ChangeMe_RootPass_$(openssl rand -hex 8)"
DB_NAME="wordpress"
DB_USER="wp_user"
DB_PASS="ChangeMe_WpPass_$(openssl rand -hex 8)"
WP_ADMIN_USER="admin"
WP_ADMIN_PASS="ChangeMe_AdminPass_$(openssl rand -hex 8)"
WP_ADMIN_EMAIL="admin@example.com"
VPS_IP=$(hostname -I | awk '{print $1}')

# ============================================
# インストール開始
# ============================================
echo "Starting WordPress Multisite Setup..."
echo "VPS IP: $VPS_IP"

export DEBIAN_FRONTEND=noninteractive

# 1. システム更新
echo "[1/13] System update..."
apt update && apt upgrade -y

# 2. Nginx
echo "[2/13] Installing Nginx..."
apt install -y nginx

# 3. PHP 8.3
echo "[3/13] Installing PHP 8.3..."
apt install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd \
    php8.3-intl php8.3-mbstring php8.3-soap php8.3-xml php8.3-zip \
    php8.3-imagick php8.3-bcmath

# 4. MariaDB
echo "[4/13] Installing MariaDB..."
apt install -y mariadb-server curl unzip

# 5-6. MariaDB設定
echo "[5-6/13] Configuring MariaDB..."
mysql << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_ROOT_PASS}';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

# 7. WP-CLI
echo "[7/13] Installing WP-CLI..."
curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp

# 8-11. WordPress
echo "[8-11/13] Installing WordPress..."
mkdir -p /var/www/wordpress && cd /var/www/wordpress
wp core download --allow-root
wp config create --dbname=${DB_NAME} --dbuser=${DB_USER} --dbpass=${DB_PASS} --allow-root
wp config set WP_ALLOW_MULTISITE true --raw --allow-root
wp core install --url="http://${VPS_IP}" --title="Site Network" \
    --admin_user=${WP_ADMIN_USER} --admin_password=${WP_ADMIN_PASS} \
    --admin_email=${WP_ADMIN_EMAIL} --allow-root
wp core multisite-convert --subdomains --allow-root

# 12. ファイル権限
echo "[12/13] Setting permissions..."
chown -R www-data:www-data /var/www/wordpress
find /var/www/wordpress -type d -exec chmod 755 {} \;
find /var/www/wordpress -type f -exec chmod 644 {} \;

# 13. Nginx設定
echo "[13/13] Configuring Nginx..."
cat > /etc/nginx/sites-available/wordpress << 'NGINX'
server {
    listen 80;
    server_name _;
    root /var/www/wordpress;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location = /wp-config.php { deny all; }
    location ~ /\.ht { deny all; }
}
NGINX

ln -sf /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ============================================
# 完了
# ============================================
echo ""
echo "========================================"
echo "WordPress Multisite Setup Complete!"
echo "========================================"
echo ""
echo "Access URL: http://${VPS_IP}/wp-admin/"
echo ""
echo "Credentials (SAVE THESE!):"
echo "  Admin User:     ${WP_ADMIN_USER}"
echo "  Admin Password: ${WP_ADMIN_PASS}"
echo "  DB Root Pass:   ${DB_ROOT_PASS}"
echo "  DB User:        ${DB_USER}"
echo "  DB Password:    ${DB_PASS}"
echo ""
```

### 実行コマンド（ローカルから）

```bash
# スクリプトをVPSに転送して実行
VPS_IP="<your-vps-ip>"
scp -i ~/.ssh/stream02_ed25519 wordpress-setup.sh root@$VPS_IP:/root/
ssh -i ~/.ssh/stream02_ed25519 root@$VPS_IP "chmod +x /root/wordpress-setup.sh && /root/wordpress-setup.sh"
```

---

## 4. Milestone 3: Stream02 接続テスト

**目標:** Stream02のStub UIからVPSに接続できる状態にする
**所要時間目安:** 5-10分
**前提:** Milestone 2 完了

### 4.1 環境変数の準備

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M3-1 | 秘密鍵をBase64エンコード | 🤖 | `base64 -i ~/.ssh/stream02_ed25519 \| tr -d '\n'` | ⏸️ |
| M3-2 | ENCRYPTION_KEY生成 | 🤖 | `openssl rand -hex 32` | ⏸️ |
| M3-3 | .env.local 作成 | 🧑 | 1. `stream-02/.env.example` をコピーして `.env.local` を作成<br>2. 各値を設定（下記参照） | ⏸️ |

### 4.2 .env.local の設定内容

```env
# VPS接続情報
VPS_HOST="<M1-9で取得したIPアドレス>"
VPS_SSH_USER="root"
VPS_SSH_PRIVATE_KEY="<M3-1で生成したBase64文字列>"
VPS_SSH_PORT="22"

# WordPress（Milestone 3ではドメイン無し）
WP_DOMAIN=""
WP_PATH="/var/www/wordpress"

# 暗号化キー
ENCRYPTION_KEY="<M3-2で生成した64文字のHEX>"
```

### 4.3 動作確認

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M3-4 | 依存関係インストール | 🤖 | `cd stream-02 && npm install` | ⏸️ |
| M3-5 | 開発サーバー起動 | 🤖 | `npm run dev -- --webpack -p 3001` | ⏸️ |
| M3-6 | Connection Test実行 | 🧑 | 1. ブラウザで http://localhost:3001 にアクセス<br>2. 「Connection Test」をクリック<br>3. 結果を確認 | ⏸️ |

**✓ 成功条件:**
- SSH接続: ✅ Connected
- WP-CLI: ✅ Available（バージョン番号表示）

---

## 5. Milestone 4: ドメイン + Cloudflare SSL

**目標:** HTTPS対応し、Site Create → 記事投稿まで完走する
**所要時間目安:** 30-60分（DNS反映待ち含む）
**前提:** Milestone 3 完了

### 5.1 ドメイン取得

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M4-1 | ドメイン購入 | 🧑 | 任意のレジストラ（お名前.com、Google Domains、Cloudflare Registrar等）で`.com`ドメインを購入<br>**注意:** Cloudflareでネームサーバーを変更するので、レジストラ側のDNS設定は不要<br>**実績:** 既存ドメインを利用 | ✅ |

### 5.2 Cloudflare アカウント作成

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M4-2 | アカウント作成 | 🧑 | 1. https://dash.cloudflare.com/sign-up にアクセス<br>2. メールアドレス、パスワードを入力<br>3. メール認証を完了 | ✅ |

### 5.3 Cloudflare サイト追加

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M4-3 | サイト追加 | 🧑 | 1. Dashboard → 「Add a Site」<br>2. ドメイン名を入力（例: `example.com`）<br>3. プラン: **Free** を選択<br>4. 「Continue」 | ✅ |
| M4-4 | ネームサーバー変更 | 🧑 | 1. Cloudflareが表示するネームサーバー（例: `ns1.cloudflare.com`）をメモ<br>2. ドメインレジストラの管理画面にログイン<br>3. ネームサーバーをCloudflareのものに変更<br>4. 反映まで最大48時間（通常は数分〜数時間） | ✅ |

### 5.4 Cloudflare API Token 発行

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M4-5 | API Token 発行 | 🧑 | 1. Dashboard → 右上プロフィール → 「My Profile」<br>2. 「API Tokens」タブ<br>3. 「Create Token」<br>4. 「Edit zone DNS」テンプレートを使用<br>5. Zone Resources: 対象ドメインを選択<br>6. 「Continue to summary」→「Create Token」<br>7. **トークンをコピーして安全な場所に保存**<br>**実績:** .env.localに設定済み | ✅ |

### 5.5 DNS設定（CLI自動化可能）

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M4-6 | Zone ID 取得 | 🤖 | `curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=example.com" -H "Authorization: Bearer $CF_TOKEN" \| jq -r '.result[0].id'` | ⏸️ |
| M4-7 | Aレコード追加（@） | 🤖 | ```curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" --data '{"type":"A","name":"@","content":"<VPS_IP>","proxied":true}'``` | ⏸️ |
| M4-8 | Aレコード追加（*） | 🤖 | ```curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" --data '{"type":"A","name":"*","content":"<VPS_IP>","proxied":true}'``` | ⏸️ |

### 5.6 SSL/TLS設定

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M4-9 | SSL/TLS モード設定 | 🧑 | 1. Dashboard → 対象ドメイン → SSL/TLS → Overview<br>2. 「Full (strict)」を選択 | ⏸️ |
| M4-10 | Origin Certificate 作成 | 🧑 | 1. SSL/TLS → Origin Server<br>2. 「Create Certificate」<br>3. Private key type: RSA (2048)<br>4. Hostnames: `example.com`, `*.example.com`<br>5. Certificate Validity: 15 years<br>6. 「Create」<br>7. **Origin Certificate と Private Key をコピー**（一度しか表示されない） | ⏸️ |

### 5.7 VPS SSL設定（CLI自動化可能）

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M4-11 | 証明書ディレクトリ作成 | 🤖 | `ssh root@$VPS_IP "mkdir -p /etc/ssl/cloudflare"` | ⏸️ |
| M4-12 | 証明書配置 | 🧑🤖 | 1. cert.pemファイルを作成（M4-10のOrigin Certificate）<br>2. key.pemファイルを作成（M4-10のPrivate Key）<br>3. `scp cert.pem key.pem root@$VPS_IP:/etc/ssl/cloudflare/` | ⏸️ |
| M4-13 | 権限設定 | 🤖 | `ssh root@$VPS_IP "chmod 600 /etc/ssl/cloudflare/key.pem && chmod 644 /etc/ssl/cloudflare/cert.pem"` | ⏸️ |
| M4-14 | Nginx SSL設定更新 | 🤖 | SSLスクリプト実行（下記参照） | ⏸️ |

### 5.8 WordPress設定更新（CLI自動化可能）

| ID | タスク | 実行者 | コマンド/手順 | 状態 |
|----|--------|:------:|---------------|------|
| M4-15 | サイトURL更新 | 🤖 | `ssh root@$VPS_IP "cd /var/www/wordpress && wp option update siteurl 'https://example.com' --allow-root && wp option update home 'https://example.com' --allow-root"` | ⏸️ |
| M4-16 | wp-config.php更新 | 🤖 | `ssh root@$VPS_IP "cd /var/www/wordpress && wp config set DOMAIN_CURRENT_SITE 'example.com' --allow-root"` | ⏸️ |

### 5.9 Stream02設定更新

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M4-17 | .env.local 更新 | 🧑 | `.env.local` の `WP_DOMAIN` を設定:<br>`WP_DOMAIN="example.com"` | ⏸️ |

### 5.10 E2Eテスト

| ID | タスク | 実行者 | 詳細手順 | 状態 |
|----|--------|:------:|----------|------|
| M4-18 | HTTPS接続確認 | 🤖 | `curl -I https://example.com/wp-admin/` | ⏸️ |
| M4-19 | Site Create テスト | 🧑 | 1. http://localhost:3001 → Site<br>2. サイト情報入力 → Create Site<br>3. 成功を確認 | ⏸️ |
| M4-20 | Article Post テスト | 🧑 | 1. http://localhost:3001 → Article<br>2. 認証情報入力 → Post Test Article<br>3. 成功を確認 | ⏸️ |

**✓ 成功条件:**
- HTTPS経由でWordPress管理画面にアクセス可能
- Site Create でサブサイトが作成される
- Article Post でMock記事が投稿される

### Nginx SSL設定スクリプト

```bash
#!/bin/bash
# nginx-ssl-setup.sh
# 使用法: DOMAIN="example.com" ./nginx-ssl-setup.sh

set -e

cat > /etc/nginx/sites-available/wordpress << NGINX
server {
    listen 80;
    server_name ${DOMAIN} *.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} *.${DOMAIN};

    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    root /var/www/wordpress;
    index index.php;

    # WordPress Multisite rewrites
    if (!-e \$request_filename) {
        rewrite /wp-admin$ \$scheme://\$host\$uri/ permanent;
        rewrite ^(/[^/]+)?(/wp-.*) \$2 last;
        rewrite ^(/[^/]+)?(/.*\\.php) \$2 last;
    }

    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }

    location ~ \\.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires max;
        log_not_found off;
    }

    location = /wp-config.php { deny all; }
    location ~ /\\.ht { deny all; }
}
NGINX

nginx -t && systemctl restart nginx
echo "Nginx SSL configuration updated!"
```

---

## 6. タスク実行者サマリー

### 人間が実行するタスク（🧑）一覧

| Milestone | タスク | 内容 |
|-----------|--------|------|
| M1 | M1-1〜M1-3 | Hetznerアカウント作成、プロジェクト作成、API Token発行 |
| M2 | M2-4 | ブラウザでWordPress動作確認 |
| M3 | M3-3, M3-6 | .env.local作成、Stub UIで接続テスト |
| M4 | M4-1〜M4-5, M4-9〜M4-10, M4-12, M4-17, M4-19〜M4-20 | ドメイン購入、Cloudflare設定、証明書取得、E2Eテスト |

### CLI/MCP自動化可能タスク（🤖）一覧

| Milestone | タスク | ツール |
|-----------|--------|--------|
| M1 | M1-4〜M1-10 | hcloud CLI |
| M2 | M2-1〜M2-3 | SSH + スクリプト |
| M3 | M3-1〜M3-2, M3-4〜M3-5 | base64, openssl, npm |
| M4 | M4-6〜M4-8, M4-11, M4-13〜M4-16, M4-18 | curl (Cloudflare API), SSH |

---

## 7. MCP設定（任意）

Claude CodeからHetzner/Cloudflareを直接操作したい場合:

### mcp-hetzner

```json
{
  "mcpServers": {
    "hetzner": {
      "command": "uvx",
      "args": ["mcp-hetzner"],
      "env": {
        "HCLOUD_TOKEN": "<M1-3で発行したトークン>"
      }
    }
  }
}
```

### mcp-cloudflare

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/cloudflare-mcp"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "<M4-5で発行したトークン>"
      }
    }
  }
}
```

---

## 8. コードモジュール構成

### コアロジック（stream-02/src/lib/）

| モジュール | ファイル | 責務 | 状態 |
|-----------|----------|------|------|
| **WordPressSetupManager** | `wordpress-setup-manager.ts` | 公開API | ✅ 完了 |
| **SiteManager** | `site-manager.ts` | サイト作成ロジック | ✅ 完了 |
| **ArticlePublisher** | `article-publisher.ts` | 記事投稿ロジック | ✅ 完了 |
| **SSHClient** | `vps/ssh-client.ts` | SSH接続 | ✅ 完了 |
| **WPCLIClient** | `vps/wp-cli.ts` | WP-CLI実行 | ✅ 完了 |
| **HetznerClient** | `vps/hetzner-client.ts` | Hetzner Cloud API | 📋 計画 |
| **VPSProvisioner** | `vps/provisioner.ts` | VPSプロビジョニング | 📋 計画 |

---

## 9. 注意事項

### Stream02に含まないもの

| 機能 | 担当Stream | 理由 |
|------|-----------|------|
| 記事生成 | Stream01 | コンテンツ生成は別責務 |
| Stream01出力を使った投稿 | Stream04 | Stream01とStream02の結合処理 |
| ユーザー認証 | Stream03 | 認証は別責務 |

---

*最終更新: 2026-01-30*
