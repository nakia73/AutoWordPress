# Phase 1: Infrastructure（基盤構築）詳細仕様書

**テーマ:** Foundation Building
**ゴール:** サービス基盤（VPS・SSL・Multisite）を構築し、HTTPS対応のブログURLを即座に発行できる状態にする。
**期間:** Week 3-4

---

## 1. なぜこのフェーズが必要か？

ユーザーにブログを提供するには、それを動かすサーバー環境が必要です。
そして、2026年において**HTTPS (SSL) 対応は必須条件**です。

HTTPのみのサイトは:

- ブラウザが「安全ではありません」と警告する
- Googleが検索順位を下げる
- ユーザーが信頼しない

したがって、このフェーズで**ワイルドカードSSL証明書**を設定し、全ユーザーのブログがHTTPSで動く状態を作ります。

---

## 2. 達成する状態

**「コマンド1つで、HTTPS対応のブログURL（`xxx.productblog.com`）が即座に発行される」**

---

## 3. 実装内容

### 3.1 VPSセットアップ

**プロバイダ:** DigitalOcean
**スペック:** Basic Droplet (2GB RAM / 1 vCPU / 50GB SSD) - $12/月
**OS:** Ubuntu 22.04 LTS

**初期設定:**

```bash
# 1. 非rootユーザー作成
adduser productblog
usermod -aG sudo productblog

# 2. SSH鍵認証設定
mkdir -p /home/productblog/.ssh
# 公開鍵をauthorized_keysに追加

# 3. パスワード認証無効化
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no

# 4. UFWファイアウォール
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 5. Fail2ban
sudo apt install fail2ban -y
```

### 3.2 ドメイン取得とDNS設定

**ドメイン:** `productblog.com` （または類似）
**レジストラ:** Cloudflare Registrar 推奨

**DNS設定:**
| タイプ | 名前 | 値 |
|:---|:---|:---|
| A | @ | VPS IP |
| A | \* | VPS IP |

**ワイルドカード設定により、`*.productblog.com` の全てのサブドメインがVPSに向く。**

### 3.3 Nginx + SSL設定

**Nginx インストール:**

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
```

**Let's Encrypt ワイルドカード証明書:**

```bash
sudo apt install certbot python3-certbot-dns-cloudflare -y

# Cloudflare API認証ファイル作成
sudo nano /etc/letsencrypt/cloudflare.ini
# dns_cloudflare_api_token = YOUR_API_TOKEN

# 証明書取得（DNS認証）
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d "productblog.com" \
  -d "*.productblog.com"

# 自動更新設定
sudo systemctl enable certbot.timer
```

**Nginx SSL設定:**

```nginx
server {
    listen 443 ssl http2;
    server_name *.productblog.com;

    ssl_certificate /etc/letsencrypt/live/productblog.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/productblog.com/privkey.pem;

    # WordPress Multisiteへプロキシ（後で設定）
    root /var/www/productblog;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }
}

server {
    listen 80;
    server_name *.productblog.com;
    return 301 https://$host$request_uri;
}
```

### 3.4 WordPress Multisite構築

**LAMP スタック:**

```bash
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd php8.2-mbstring php8.2-xml php8.2-zip -y
sudo apt install mariadb-server -y
sudo mysql_secure_installation
```

**WordPress ダウンロード:**

```bash
cd /var/www
sudo wget https://wordpress.org/latest.tar.gz
sudo tar -xzf latest.tar.gz
sudo mv wordpress productblog
sudo chown -R www-data:www-data productblog
```

**データベース作成:**

```sql
CREATE DATABASE productblog_wp;
CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON productblog_wp.* TO 'wp_user'@'localhost';
FLUSH PRIVILEGES;
```

**Multisite有効化 (wp-config.php):**

```php
/* Multisite */
define('WP_ALLOW_MULTISITE', true);
```

WP管理画面で「ネットワークの設置」を完了後:

```php
define('MULTISITE', true);
define('SUBDOMAIN_INSTALL', true);
define('DOMAIN_CURRENT_SITE', 'productblog.com');
define('PATH_CURRENT_SITE', '/');
define('SITE_ID_CURRENT_SITE', 1);
define('BLOG_ID_CURRENT_SITE', 1);
```

**WP-CLI インストール:**

```bash
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
```

---

## 4. 成功基準

| テスト                         | 期待結果                                  |
| :----------------------------- | :---------------------------------------- |
| `https://productblog.com`      | SSL有効でアクセス可能                     |
| `https://test.productblog.com` | SSL有効でアクセス可能（Wildcard確認）     |
| `wp site create --slug=demo`   | `demo.productblog.com` が即座に作成される |
| HTTP→HTTPS                     | 自動リダイレクトされる                    |

---

## 5. 次のステップ

インフラが整ったら、**Phase 2: Core AI** でAI分析・記事生成機能を実装する。
