# Phase 9: SSO（シームレスログイン）詳細仕様書

**テーマ:** Seamless Experience
**ゴール:** ダッシュボードからWordPress管理画面へ再ログインなしで遷移できるようにする
**前提:** Phase 5（MVP Launch）完了後、Betaフィードバックに基づき優先度決定

---

## 1. 目的

MVPでは、WordPress管理画面にアクセスするたびに別途ログインが必要です。
本フェーズで**シームレスなログイン体験**を実現します。

**理想の体験:**
ダッシュボードにログイン → WP管理画面リンクをクリック → そのままWP管理画面が開く

---

## 2. 実装方式

### Auto-Login Token（ワンタイムトークン方式）

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ ダッシュボード │────▶│ トークン生成  │────▶│ WPリダイレクト │────▶│ 自動ログイン  │
│ 「WP管理画面」│     │ (バックエンド) │     │ (トークン付き) │     │ (WPプラグイン) │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**フロー詳細:**

1. ダッシュボードで「WP管理画面を開く」クリック
2. バックエンドがワンタイムトークン生成（有効期限30秒）
3. トークン付きURLでWordPressにリダイレクト
4. WordPressプラグインがトークン検証・自動ログイン

---

## 3. 技術実装

### 3.1 トークン生成（Next.js API）

```typescript
// /api/sso/generate-token
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 1000); // 30秒

  await db.insert(ssoTokens).values({
    token,
    userId: session.user.id,
    expiresAt,
    used: false
  });

  const wpUrl = `https://${session.user.siteSlug}.productblog.com/wp-admin`;
  const ssoUrl = `${wpUrl}?sso_token=${token}`;

  return NextResponse.json({ url: ssoUrl });
}
```

### 3.2 WordPressプラグイン

```php
<?php
/**
 * Plugin Name: ProductBlog SSO
 * Description: シームレスログイン機能
 */

add_action('init', 'productblog_sso_check');

function productblog_sso_check() {
    if (!isset($_GET['sso_token'])) return;

    $token = sanitize_text_field($_GET['sso_token']);

    // トークン検証API呼び出し
    $response = wp_remote_post(PRODUCTBLOG_API_URL . '/api/sso/verify', [
        'body' => json_encode(['token' => $token]),
        'headers' => ['Content-Type' => 'application/json']
    ]);

    $result = json_decode(wp_remote_retrieve_body($response), true);

    if ($result['valid'] && $result['user_id']) {
        // WPユーザーとしてログイン
        $wp_user = get_user_by('email', $result['email']);
        if ($wp_user) {
            wp_set_auth_cookie($wp_user->ID);
            wp_redirect(admin_url());
            exit;
        }
    }

    wp_die('Invalid or expired SSO token');
}
```

### 3.3 データベーススキーマ

```sql
-- SSOトークン管理
CREATE TABLE sso_tokens (
  id UUID PRIMARY KEY,
  token VARCHAR(100) UNIQUE,
  user_id UUID REFERENCES users(id),
  site_id UUID REFERENCES sites(id),
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 古いトークンのクリーンアップ（1時間以上前）
CREATE INDEX idx_sso_tokens_expires ON sso_tokens(expires_at);
```

---

## 4. セキュリティ対策

| 対策 | 内容 |
|------|------|
| ワンタイムトークン | 1回使用で即座に無効化 |
| 短い有効期限 | 30秒で失効 |
| HTTPS必須 | 平文での通信を禁止 |
| IP制限（オプション） | トークン生成時のIPとログイン時のIPを照合 |
| レート制限 | 1分間に5回までのトークン生成制限 |
| 監査ログ | 全てのSSO試行を記録 |

---

## 5. 成功基準

| 指標 | 目標 |
|------|------|
| 自動ログイン成功率 | 99%以上 |
| セキュリティインシデント | ゼロ |
| ユーザー満足度 | 90%以上 |
| 平均ログイン時間 | 2秒以内 |

---

## 6. 実装優先度

ユーザー体験向上のための機能。「WPログインが面倒」という声が多い場合に優先実装。
日常的にWP管理画面を使用するユーザーにとって大きな価値がある。
