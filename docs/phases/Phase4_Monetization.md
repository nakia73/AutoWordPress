# Phase 4: Monetization（収益化）詳細仕様書

**テーマ:** Business Sustainability
**ゴール:** サブスクリプション決済を導入し、サービスを継続可能なビジネスとして成立させる。

---

## 1. 目的

「素晴らしいツールを無料で提供し続けること」ではなく、「適正な対価を得て、継続的な改善をユーザーに届けること」を実現します。

---

## 2. 実装ステップ

### Step 1: Stripe Checkout 連携

- Stripeを使用したセキュアな決済画面の導入。
- クレジットカード情報の保持をStripe側に任せることで、セキュリティリスク（PCI-DSS）を回避。

```typescript
// Checkout Session作成
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/pricing`,
  metadata: { userId }
});
```

### Step 2: サブスクリプションDB設計

- `subscriptions` テーブルの構築（ステータス：active / trialing / canceledなど）。
- 課金状態に応じて、記事の生成数や機能を制限するロジックの実装。

**課金ステータス:**

| ステータス | 説明 | 機能制限 |
|-----------|------|---------|
| `trial` | トライアル期間 | 全機能利用可 |
| `active` | 有効なサブスクリプション | 全機能利用可 |
| `past_due` | 支払い遅延 | 警告表示、猶予期間後に制限 |
| `canceled` | 解約済み | 閲覧のみ、新規生成不可 |

### Step 3: Webhook 処理

- Stripeからの支払い完了、更新失敗、キャンセルなどのイベントを確実に受け取り、DBの状態を同期。
- 特に「支払いが途絶えた瞬間に即座に記事生成を停止する」が「ブログ自体は表示し続ける」という切り分けを実装。

**処理するイベント:**

| イベント | 処理内容 |
|---------|---------|
| `checkout.session.completed` | サブスク開始、ステータスを`active`に |
| `invoice.paid` | 支払い成功、期間を更新 |
| `invoice.payment_failed` | 支払い失敗、ステータスを`past_due`に |
| `customer.subscription.deleted` | 解約、ステータスを`canceled`に |

### Step 4: カスタマーポータル

- ユーザーが自分でプラン変更や解約を行える「Stripe Customer Portal」への導線を設置。
- 管理者の手を煩わせない、セルフサービス型の管理体験。

```typescript
// Customer Portalへのリダイレクト
const portalSession = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: `${baseUrl}/dashboard/settings`
});
redirect(portalSession.url);
```

---

## 3. データベーススキーマ

```sql
-- ユーザーテーブルに追加
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'trial';
ALTER TABLE users ADD COLUMN subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN current_period_end TIMESTAMP;

-- 課金履歴
CREATE TABLE billing_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_invoice_id VARCHAR(255),
  amount INTEGER,
  currency VARCHAR(10),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. セキュリティ & 実用性の考慮

- **Idempotency (冪等性):** ネットワークエラーによる二重課金を防ぐため、Stripeの冪等キーを利用。
- **透明性:** 課金が発生するタイミングや金額を、チェックアウト画面で明確に提示。
- **Exit Strategy:** 課金停止後もブログは表示し続け、データエクスポートは常に可能。

---

## 5. 成功基準

- テストカードでの決済〜サブスクリプション有効化〜解約のフローがミスなく完了すること。
- 課金していないユーザーが有償機能（記事生成など）にアクセスできないこと。

---

## 6. テスト方法

**Stripeテストモード:**

```bash
# テストカード番号
4242 4242 4242 4242

# Stripe CLIでWebhookをローカル転送
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 7. 次のステップ

決済機能が完成したら、**Phase 5: MVP Launch** で全要素を統合し、Betaユーザーに提供する。
