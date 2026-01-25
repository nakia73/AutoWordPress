# Phase 8: Custom Domain（独自ドメイン接続）詳細仕様書

**テーマ:** Brand Identity
**ゴール:** ユーザーが自分の独自ドメインでブログを運用できるようにする
**前提:** Phase 5（MVP Launch）完了後、Betaフィードバックに基づき優先度決定

---

## 1. 目的

MVPでは `{slug}.productblog.com` のサブドメインを提供。
ブランディングを重視するユーザー向けに**独自ドメイン**での運用を可能にします。

---

## 2. 機能要件

### 2.1 ドメイン接続フロー

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ ドメイン入力  │────▶│  DNS設定案内  │────▶│  検証ボタン   │────▶│  SSL発行     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                                                              │
       ▼                                                              ▼
  ユーザー操作:                                                   ┌──────────────┐
  DNSレコード設定                                                 │  接続完了    │
  (自社DNS管理画面)                                               └──────────────┘
```

### 2.2 DNS設定案内

**サブドメイン接続の場合 (blog.example.com):**

| タイプ | 名前 | 値 |
|--------|------|-----|
| CNAME | blog | {slug}.productblog.com |

**ルートドメイン接続の場合 (example.com):**

| タイプ | 名前 | 値 |
|--------|------|-----|
| A | @ | [VPSのIPアドレス] |
| TXT | _productblog | verify={verification_token} |

### 2.3 SSL自動発行

Let's Encrypt + Certbotで自動発行・更新

---

## 3. 技術実装

### 3.1 検証プロセス

```typescript
// ドメイン検証
async function verifyDomain(domain: string, userId: string): Promise<VerificationResult> {
  // 1. DNS TXTレコード確認
  const txtRecords = await dns.resolveTxt(`_productblog.${domain}`);
  const expectedToken = generateVerificationToken(userId);

  if (!txtRecords.some(r => r.includes(expectedToken))) {
    return { success: false, error: 'TXT_RECORD_NOT_FOUND' };
  }

  // 2. CNAMEまたはA レコード確認
  const resolved = await dns.resolve(domain);
  if (!isPointingToOurServer(resolved)) {
    return { success: false, error: 'DNS_NOT_POINTING' };
  }

  return { success: true };
}
```

### 3.2 SSL発行フロー

```bash
# Certbot自動発行
certbot certonly --nginx -d ${domain} --non-interactive --agree-tos
```

### 3.3 Nginx動的設定

```nginx
# /etc/nginx/sites-available/custom-domains/${domain}.conf
server {
    listen 443 ssl http2;
    server_name ${domain};

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;

    location / {
        proxy_pass http://wordpress;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3.4 データベーススキーマ

```sql
-- カスタムドメイン管理
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  site_id UUID REFERENCES sites(id),
  domain VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',  -- pending, verifying, active, error
  ssl_status VARCHAR(50) DEFAULT 'none', -- none, issuing, active, expired
  verification_token VARCHAR(100),
  ssl_expires_at TIMESTAMP,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. セキュリティ & 実用性の考慮

- **所有権確認:** TXTレコードで確実にドメイン所有者を検証
- **SSL自動更新:** 有効期限30日前に自動更新
- **フォールバック:** SSL発行失敗時は元のサブドメインを維持
- **リダイレクト:** wwwあり/なしの統一設定

---

## 5. 成功基準

| 指標 | 目標 |
|------|------|
| ドメイン接続成功率 | 90%以上 |
| SSL発行成功率 | 99%以上 |
| セットアップ時間 | 30分以内（DNS伝播除く） |
| SSL更新失敗率 | 1%未満 |

---

## 6. 実装優先度

エンタープライズ向けプランの差別化要素として検討。
ブランド重視のユーザーからの強い要望があれば優先実装。
