# Phase 14: Referral Program - マイルストーン型リファラルプログラム

> **サービス名:** Argo Note
> **関連ドキュメント:** [開発ロードマップ](../DEVELOPMENT_ROADMAP.md) | [コンセプト決定](../CONCEPT_DECISIONS.md) | [バックエンド・DB](../architecture/02_Backend_Database.md)
> **優先度:** 低（成長フェーズ後半）
> **前提:** 一定のユーザーベースが確立された段階

## 概要

マイルストーン達成型のリファラルプログラムを実装します。
紹介人数に応じて段階的に報酬が解放される仕組みです。

**重要:** これはアフィリエイトプログラム（継続的な報酬）ではありません。
マイルストーン達成時に一度だけ報酬が付与される形式です。

## コンセプト

### マイルストーン制とは

```
紹介人数    報酬
   │
   3人 ────→ 1ヶ月無料（$20相当）
   │
  10人 ────→ 3ヶ月無料 + ステッカー
   │
  25人 ────→ オリジナルTシャツ
   │
  50人 ────→ プレミアムグッズセット
   │
 100人 ────→ 永久無料 + 限定グッズ
```

紹介人数が増えるごとに、より価値の高い報酬がアンロックされていく。

---

## マイルストーン設計（案）

| マイルストーン | 紹介人数 | 報酬内容 | 報酬タイプ |
|---------------|---------|---------|-----------|
| Bronze | 3人 | 1ヶ月無料（$20相当）またはクレジット付与 | デジタル |
| Silver | 10人 | 3ヶ月無料 + オリジナルステッカー | デジタル + 物理 |
| Gold | 25人 | オリジナルTシャツ | 物理（Printful） |
| Platinum | 50人 | プレミアムグッズセット（パーカー等） | 物理（Printful） |
| Diamond | 100人 | 永久無料 + 限定エディショングッズ | デジタル + 物理 |

**注意:** 具体的な人数・報酬内容は運用開始前に最終決定

---

## Printful API連携

### Printfulとは

オンデマンド印刷・配送サービス。API連携により以下を自動化：
- Tシャツ、パーカー、マグカップ等のグッズ作成
- 世界各国への配送
- 在庫管理不要（注文ごとに生産）

### 自動化フロー

```
ユーザーがマイルストーン達成
         │
         ▼
システムが自動検知
         │
         ▼
┌────────┴────────┐
│                 │
▼                 ▼
デジタル報酬      物理報酬
（クレジット等）  （Tシャツ等）
    │                 │
    ▼                 ▼
Stripe連携        Printful API
クレジット付与    注文自動作成
    │                 │
    ▼                 ▼
ユーザーに通知    住所入力依頼
                      │
                      ▼
                 Printful配送
                      │
                      ▼
                 ユーザーに届く
```

### Printful API実装

```typescript
// マイルストーン達成時の物理報酬処理
async function fulfillPhysicalReward(userId: string, milestone: Milestone) {
  // ユーザーの配送先住所を取得（未登録なら入力依頼）
  const address = await getOrRequestShippingAddress(userId);

  if (!address) {
    // 住所入力待ち状態にしてリターン
    await markRewardPending(userId, milestone.id, 'awaiting_address');
    return;
  }

  // Printful APIで注文作成
  const order = await printfulClient.createOrder({
    recipient: {
      name: address.name,
      address1: address.line1,
      city: address.city,
      state_code: address.state,
      country_code: address.country,
      zip: address.postalCode,
    },
    items: milestone.printfulItems.map(item => ({
      sync_variant_id: item.variantId,
      quantity: 1,
    })),
  });

  // 注文情報を保存
  await saveRewardFulfillment(userId, milestone.id, order.id);

  // ユーザーに通知
  await notifyUser(userId, 'reward_shipped', { milestone, order });
}
```

---

## 技術仕様

### データモデル

```sql
-- マイルストーン定義
CREATE TABLE referral_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,              -- "Bronze", "Silver", etc.
  required_referrals INTEGER NOT NULL,    -- 達成に必要な紹介人数
  reward_type VARCHAR(20) NOT NULL,       -- digital, physical, both
  digital_reward JSONB,                   -- {"type": "credit", "amount": 20}
  physical_reward JSONB,                  -- {"printful_product_id": "xxx", ...}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ユーザーの紹介実績
CREATE TABLE user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),  -- 紹介者
  referee_id UUID REFERENCES users(id),   -- 被紹介者
  status VARCHAR(20) DEFAULT 'pending',   -- pending, verified, rewarded
  verified_at TIMESTAMP,                  -- 有料転換で verified に
  created_at TIMESTAMP DEFAULT NOW()
);

-- マイルストーン達成履歴
CREATE TABLE milestone_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  milestone_id UUID REFERENCES referral_milestones(id),
  achieved_at TIMESTAMP DEFAULT NOW(),
  reward_status VARCHAR(20) DEFAULT 'pending', -- pending, awaiting_address, fulfilled, failed
  digital_reward_applied_at TIMESTAMP,
  physical_order_id VARCHAR(100),         -- Printful order ID
  physical_shipped_at TIMESTAMP,
  UNIQUE(user_id, milestone_id)
);

-- 配送先住所（物理報酬用）
CREATE TABLE shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  line1 VARCHAR(255),
  line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country_code VARCHAR(2),
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_referrals_referrer ON user_referrals(referrer_id);
CREATE INDEX idx_milestone_achievements_user ON milestone_achievements(user_id);
```

### API設計

```typescript
// 紹介コード/リンク取得
GET /api/referral/code

// 紹介状況・マイルストーン進捗確認
GET /api/referral/progress
// Response: {
//   totalReferrals: 12,
//   verifiedReferrals: 8,
//   currentMilestone: "Silver",
//   nextMilestone: { name: "Gold", required: 25, remaining: 17 },
//   achievements: [{ milestone: "Bronze", achievedAt: "...", rewardStatus: "fulfilled" }, ...]
// }

// マイルストーン一覧取得
GET /api/referral/milestones

// 物理報酬の配送先住所登録
POST /api/referral/shipping-address
Body: { name, line1, line2?, city, state, postalCode, countryCode }

// 報酬受け取り（住所登録後のトリガー）
POST /api/referral/claim-reward/:milestoneId
```

---

## UI/UX

### ダッシュボードの紹介セクション

```
┌─────────────────────────────────────────────────────────┐
│ 🎁 リファラルプログラム                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ あなたの紹介リンク:                                      │
│ [https://argonote.app/r/JOHN2024] [コピー] [共有]        │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ 紹介実績: 12人（うち有料転換: 8人）                       │
│                                                         │
│ マイルストーン進捗:                                      │
│                                                         │
│ [✓] Bronze (3人)   → 1ヶ月無料 ✓ 獲得済み               │
│ [◉] Silver (10人)  → 3ヶ月無料 + ステッカー 🎉 達成！    │
│ [ ] Gold (25人)    → オリジナルTシャツ (残り17人)        │
│ [ ] Platinum (50人)→ プレミアムグッズ                    │
│ [ ] Diamond (100人)→ 永久無料 + 限定グッズ               │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 32%           │
│                                                         │
│ [報酬を受け取る] ← Silver達成の報酬受け取りボタン        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 報酬受け取りフロー（物理報酬）

1. マイルストーン達成
2. 「報酬を受け取る」ボタン表示
3. 配送先住所の入力（初回のみ）
4. Printful APIで注文自動作成
5. 「発送しました」通知
6. 追跡番号の表示（Printfulから取得）

---

## 実装タスク

### Phase 14.1: 基盤構築
- [ ] データベーススキーマ追加
- [ ] マイルストーン定義の管理機能
- [ ] 紹介追跡システム実装

### Phase 14.2: デジタル報酬
- [ ] クレジット付与ロジック
- [ ] Stripe連携（無料期間の付与）
- [ ] 達成通知システム

### Phase 14.3: Printful連携
- [ ] Printful APIクライアント実装
- [ ] 商品（Tシャツ等）の設定
- [ ] 住所入力フロー
- [ ] 注文自動作成機能
- [ ] 配送追跡連携

### Phase 14.4: UI実装
- [ ] ダッシュボードに紹介セクション追加
- [ ] マイルストーン進捗表示
- [ ] 報酬受け取りフロー
- [ ] 共有機能（SNSシェアボタン）

### Phase 14.5: 運用開始
- [ ] マイルストーン・報酬の最終設定
- [ ] 既存ユーザーへの告知
- [ ] 効果測定開始

---

## Printful設定

### 必要な準備
- [ ] Printfulアカウント作成
- [ ] APIキー取得
- [ ] 商品デザイン作成（Tシャツ、ステッカー等）
- [ ] 商品登録・バリアント設定（サイズ、色）
- [ ] 配送料金の確認・設定

### コスト見積もり

| アイテム | Printful原価（目安） | 配送料（目安） |
|---------|-------------------|--------------|
| ステッカー | $2-5 | $3-5 |
| Tシャツ | $10-15 | $5-10 |
| パーカー | $25-35 | $8-15 |

**注意:** 報酬コストはマーケティング費用として計上

---

## 成功指標

**注意:** 具体的な数値目標は設定しない（CONCEPT_DECISIONS.md J6参照）

**KPI（重要指標）:**
- リファラルプログラムが正常に動作すること
- マイルストーン達成者が継続的に発生すること
- SNSでのグッズ共有が自然発生すること
- 紹介経由でのサインアップが継続的に発生すること

---

## 注意事項

- **アフィリエイトではない**: 継続的な報酬ではなく、マイルストーン達成時の一回限りの報酬
- 物理報酬は配送コストが発生するため、マイルストーンの閾値を適切に設定
- グッズのデザインはPhase 13（Brand Identity）と連携
- 不正防止（同一人物の複数アカウント等）の対策を実装
- 国際配送に対応（グローバル展開のため）
