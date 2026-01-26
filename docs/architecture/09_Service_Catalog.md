# Argo Note - 利用サービス・API一覧

> **目的:** プロジェクトで使用する全サービス・API・ツールの一覧と費用管理
> **作成日:** 2026年1月26日
> **最終更新:** 2026年1月26日

---

## 概要

| カテゴリ | サービス数 | 月額費用（MVP） |
|---------|----------|----------------|
| クラウドインフラ | 4件 | $25〜 |
| AI/LLM API | 4件 | 従量課金 |
| 検索・リサーチAPI | 5件 | $10〜60 |
| 決済・課金 | 1件 | 手数料のみ |
| 開発ツール | 12件 | $0（無料） |
| WordPress関連 | 6件 | $0（無料） |
| 監視・分析 | 6件 | $0（無料） |
| **合計** | **38件** | **$35〜100/月** |

---

## 1. クラウドインフラ

### 1.1 Vercel

| 項目 | 内容 |
|------|------|
| **用途** | Next.jsアプリケーションホスティング |
| **機能** | Serverless Functions, Edge Runtime, Preview環境 |
| **料金** | 無料（Hobby Plan） |
| **有料プラン** | Pro: $20/月（チーム利用時） |
| **使用フェーズ** | Phase 1〜（継続） |
| **公式サイト** | https://vercel.com |

**無料枠制限:**
- 100GB帯域幅/月
- Serverless Function実行時間: 100GB-hours
- ビルド時間: 6000分/月

---

### 1.2 DigitalOcean

| 項目 | 内容 |
|------|------|
| **用途** | WordPress Multisite用VPSホスティング |
| **機能** | Droplets, Monitoring, Backups |
| **料金** | $24/月（MVP: 2vCPU, 4GB RAM, 80GB SSD） |
| **スケール時** | $48〜96/月（垂直スケーリング） |
| **使用フェーズ** | Phase 1〜（継続） |
| **公式サイト** | https://digitalocean.com |

**プラン別スペック:**

| プラン | vCPU | RAM | SSD | 月額 | 想定ユーザー数 |
|--------|------|-----|-----|------|---------------|
| Basic | 2 | 4GB | 80GB | $24 | 〜100 |
| Standard | 4 | 8GB | 160GB | $48 | 100〜300 |
| Premium | 8 | 16GB | 320GB | $96 | 300〜500 |

---

### 1.3 Cloudflare

| 項目 | 内容 |
|------|------|
| **用途** | CDN, DNS, SSL, WAF, オブジェクトストレージ |
| **料金** | 無料（Free Plan） |
| **使用フェーズ** | Phase 1〜（継続） |
| **公式サイト** | https://cloudflare.com |

**利用サービス詳細:**

| サービス | 用途 | 料金 |
|---------|------|------|
| Cloudflare DNS | ドメイン管理、ワイルドカードDNS | 無料 |
| Cloudflare CDN | 静的ファイル配信、グローバルキャッシュ | 無料 |
| Cloudflare SSL | ワイルドカード証明書（*.argonote.app） | 無料 |
| Cloudflare WAF | DDoS防御、Webアプリファイアウォール | 無料 |
| Cloudflare R2 | オブジェクトストレージ（メディア保存） | 従量課金* |

**Cloudflare R2料金:**
- ストレージ: $0.015/GB/月
- Class A操作（書込）: $4.50/100万リクエスト
- Class B操作（読取）: $0.36/100万リクエスト
- **エグレス（転送）: 無料**（S3との大きな違い）
- 無料枠: 10GB/月

---

### 1.4 Supabase

| 項目 | 内容 |
|------|------|
| **用途** | 認証、PostgreSQLデータベース、ストレージ |
| **料金** | 無料（Free Plan） |
| **有料プラン** | Pro: $25/月（500MBストレージ超過時） |
| **使用フェーズ** | Phase 1〜（継続） |
| **公式サイト** | https://supabase.com |

**利用機能:**

| 機能 | 用途 | 無料枠 |
|------|------|--------|
| Supabase Auth | Google OAuth認証 | 50,000 MAU |
| PostgreSQL | アプリケーションデータ | 500MB |
| Connection Pooling | 接続管理（Supavisor） | 含む |
| pgvector | ベクトル検索（将来） | 含む |

---

## 2. AI/LLM API

### 2.1 Google Gemini 3.0 Pro（メイン）

| 項目 | 内容 |
|------|------|
| **用途** | 記事生成、プロダクト分析、SEO最適化 |
| **料金** | 従量課金 |
| **使用フェーズ** | Phase 2〜（継続） |
| **公式サイト** | https://ai.google.dev |

**料金体系（2026年1月時点）:**

| モデル | 入力 | 出力 |
|--------|------|------|
| Gemini 3.0 Pro | $0.00025/1K tokens | $0.0005/1K tokens |
| Gemini 3.0 Flash | $0.000075/1K tokens | $0.0003/1K tokens |

**想定コスト（1記事あたり）:**
- 入力: 約5,000 tokens = $0.00125
- 出力: 約3,000 tokens = $0.0015
- **合計: 約$0.003/記事**
- 1000記事/月: 約$3/月

---

### 2.2 Google Gemini 3.0 Flash

| 項目 | 内容 |
|------|------|
| **用途** | 高速・低コスト記事生成（オプション） |
| **料金** | Gemini Proの約1/3 |
| **使用フェーズ** | Phase 12〜（ユーザー選択） |

---

### 2.3 DALL-E 3

| 項目 | 内容 |
|------|------|
| **用途** | AI画像生成（アイキャッチ画像） |
| **料金** | $0.04〜0.12/画像 |
| **使用フェーズ** | Phase 7〜（オプション） |
| **公式サイト** | https://openai.com |

**料金詳細:**

| 解像度 | 料金 |
|--------|------|
| 1024×1024 | $0.04 |
| 1024×1792 | $0.08 |
| 1792×1024 | $0.08 |
| HD品質 | +$0.04 |

---

### 2.4 Claude / GPT（将来）

| 項目 | 内容 |
|------|------|
| **用途** | 代替LLMオプション |
| **料金** | 各社従量課金 |
| **使用フェーズ** | Phase 12〜（ユーザー要望次第） |
| **ステータス** | 未実装 |

---

## 3. 検索・リサーチAPI

### 3.1 Tavily API

| 項目 | 内容 |
|------|------|
| **用途** | Web検索、競合分析、SERP取得 |
| **料金** | 従量課金 |
| **使用フェーズ** | Phase 2〜（継続） |
| **公式サイト** | https://tavily.com |
| **重要度** | **必須（Phase C, D で使用）** |

**料金プラン:**

| プラン | 月額 | 検索数 |
|--------|------|--------|
| Free | $0 | 1,000回/月 |
| Starter | $50 | 10,000回/月 |
| Growth | $200 | 50,000回/月 |

---

### 3.2 Firecrawl API

| 項目 | 内容 |
|------|------|
| **用途** | Webスクレイピング（プロダクトURL解析） |
| **料金** | 従量課金 |
| **使用フェーズ** | Phase 2〜（Phase A で使用） |
| **公式サイト** | https://firecrawl.dev |

**料金プラン:**

| プラン | 月額 | クレジット |
|--------|------|-----------|
| Free | $0 | 500回/月 |
| Hobby | $16 | 3,000回/月 |
| Standard | $83 | 20,000回/月 |

---

### 3.3 Jina Reader API

| 項目 | 内容 |
|------|------|
| **用途** | Webスクレイピング（Firecrawlのフォールバック） |
| **料金** | 無料枠あり |
| **使用フェーズ** | Phase 2〜（フォールバック用） |
| **公式サイト** | https://jina.ai/reader |

---

### 3.4 Keywords Everywhere API

| 項目 | 内容 |
|------|------|
| **用途** | キーワード調査（検索ボリューム、難易度） |
| **料金** | $10〜/月 |
| **使用フェーズ** | Phase 2〜（Phase C で使用） |
| **公式サイト** | https://keywordseverywhere.com |

**クレジット制:**
- $10 = 100,000クレジット
- 1キーワード = 1クレジット

---

### 3.5 DataForSEO API

| 項目 | 内容 |
|------|------|
| **用途** | 高度なキーワード調査・SEOデータ |
| **料金** | $50〜/月 |
| **使用フェーズ** | Phase 2+（成長フェーズで検討） |
| **公式サイト** | https://dataforseo.com |
| **ステータス** | Keywords Everywhereの上位互換として検討中 |

---

## 4. 決済・課金

### 4.1 Stripe

| 項目 | 内容 |
|------|------|
| **用途** | サブスクリプション決済、顧客管理 |
| **料金** | 決済額の3.6%（日本） |
| **使用フェーズ** | Phase 5〜（継続） |
| **公式サイト** | https://stripe.com |

**利用機能:**

| 機能 | 用途 | 追加料金 |
|------|------|---------|
| Stripe Checkout | 決済画面 | 含む |
| Stripe Billing | サブスク管理 | 含む |
| Customer Portal | 顧客セルフサービス | 含む |
| Webhooks | イベント通知 | 含む |
| Stripe CLI | ローカルテスト | 無料 |

**手数料計算例（$20プラン）:**
- 決済額: $20
- 手数料: $20 × 3.6% = $0.72
- 実収入: $19.28

---

## 5. 開発ツール・フレームワーク

### 5.1 フロントエンド

| ツール | 用途 | 料金 | 公式サイト |
|--------|------|------|-----------|
| Next.js 14 | Reactフレームワーク | 無料 | nextjs.org |
| TypeScript | 型安全な開発 | 無料 | typescriptlang.org |
| Tailwind CSS | CSSフレームワーク | 無料 | tailwindcss.com |
| Shadcn/UI | UIコンポーネント | 無料 | ui.shadcn.com |
| Framer Motion | アニメーション | 無料 | framer.com/motion |
| Zustand | 状態管理 | 無料 | zustand-demo.pmnd.rs |
| TanStack Query | サーバー状態管理 | 無料 | tanstack.com |
| React Hook Form | フォーム管理 | 無料 | react-hook-form.com |
| Zod | バリデーション | 無料 | zod.dev |

---

### 5.2 バックエンド・インフラ

| ツール | 用途 | 料金 | 公式サイト |
|--------|------|------|-----------|
| Prisma | ORM・マイグレーション | 無料 | prisma.io |
| LiteLLM | LLM抽象化レイヤー | 無料 | litellm.ai |

---

### 5.3 Inngest（ジョブキュー）

| 項目 | 内容 |
|------|------|
| **用途** | 非同期ジョブ実行、スケジュール管理 |
| **料金** | 無料（25,000ステップ/月） |
| **有料プラン** | Pay-as-you-go（超過分） |
| **使用フェーズ** | Phase 2〜（継続） |
| **公式サイト** | https://inngest.com |
| **重要度** | **必須（記事生成、自動化に不可欠）** |

**無料枠詳細:**
- 25,000ステップ/月
- 1記事生成 ≈ 10ステップ
- 月間2,500記事まで無料

---

## 6. WordPress関連

### 6.1 WordPress Multisite

| 項目 | 内容 |
|------|------|
| **用途** | 複数ブログの一元管理 |
| **料金** | 無料（オープンソース） |
| **使用フェーズ** | Phase 1〜（継続） |

---

### 6.2 WP-CLI

| 項目 | 内容 |
|------|------|
| **用途** | コマンドラインからのWordPress操作 |
| **料金** | 無料 |
| **使用フェーズ** | Phase 1〜（継続） |

---

### 6.3 プラグイン一覧

| プラグイン | 用途 | 料金 |
|-----------|------|------|
| All-in-One WP Migration | データ移行・Exit Strategy | 無料 |
| Wordfence Security | セキュリティスキャン | 無料 |
| WP Offload Media | R2連携（メディア保存） | 無料* |
| Redis Object Cache | パフォーマンス最適化 | 無料 |
| WP-Optimize | DB最適化 | 無料 |

*WP Offload Media Lite（無料版）で基本機能利用可能

---

## 7. 監視・分析

### 7.1 アプリケーション監視

| サービス | 用途 | 料金 | 公式サイト |
|---------|------|------|-----------|
| UptimeRobot | 稼働監視 | 無料（50監視まで） | uptimerobot.com |
| Sentry | エラートラッキング | 無料（5,000イベント/月） | sentry.io |
| DigitalOcean Monitoring | VPSリソース監視 | 無料（Droplet付属） | - |

---

### 7.2 アナリティクス

| サービス | 用途 | 料金 | 使用フェーズ |
|---------|------|------|-------------|
| Google Analytics 4 | Webアナリティクス | 無料 | Phase 6〜 |
| Google Search Console | SEOパフォーマンス | 無料 | Phase 6〜 |
| PostHog | プロダクト分析 | 無料（1M イベント/月） | Phase 6〜 |

---

### 7.3 フィードバック収集

| サービス | 用途 | 料金 | 使用フェーズ |
|---------|------|------|-------------|
| Tally | NPSアンケート | 無料 | Phase 6〜 |

---

## 8. コミュニケーション

| サービス | 用途 | 料金 |
|---------|------|------|
| Slack | チーム通知・アラート | 無料 |
| Discord | ベータユーザーコミュニティ | 無料 |
| Email（Supabase） | ユーザー通知 | 無料（Supabase Auth内蔵） |

---

## 9. デザイン・ブランディング

| サービス | 用途 | 料金 | 使用フェーズ |
|---------|------|------|-------------|
| Looka | AIロゴ生成 | $20〜（1回購入） | Phase 0.5 |
| Figma | UIデザイン | 無料 | Phase 0〜 |

---

## 10. その他（将来フェーズ）

### 10.1 Printful API（Phase 14）

| 項目 | 内容 |
|------|------|
| **用途** | リファラル報酬のグッズ印刷・配送 |
| **料金** | 商品代 + 送料（在庫不要） |
| **使用フェーズ** | Phase 14〜 |
| **公式サイト** | https://printful.com |

---

### 10.2 Langfuse（Phase 15）

| 項目 | 内容 |
|------|------|
| **用途** | プロンプト管理・A/Bテスト |
| **料金** | 無料（セルフホスト） |
| **使用フェーズ** | Phase 15〜 |
| **公式サイト** | https://langfuse.com |

---

## 月額費用サマリー

### MVP段階（〜100ユーザー）

| カテゴリ | サービス | 月額 |
|---------|---------|------|
| インフラ | DigitalOcean VPS | $24 |
| インフラ | Cloudflare R2 | 〜$5 |
| インフラ | ドメイン | 〜$1 |
| API | Keywords Everywhere | $10 |
| API | Tavily（無料枠） | $0 |
| API | Firecrawl（無料枠） | $0 |
| API | Gemini（従量） | 〜$5 |
| その他 | Vercel, Supabase等 | $0 |
| **合計** | | **〜$45/月** |
| **予備費** | | **$55/月** |
| **総予算** | | **$100/月** |

---

### 成長段階（100〜500ユーザー）

| カテゴリ | サービス | 月額 |
|---------|---------|------|
| インフラ | DigitalOcean VPS | $48〜96 |
| インフラ | Cloudflare R2 | 〜$20 |
| API | Tavily Starter | $50 |
| API | Firecrawl Hobby | $16 |
| API | Gemini（従量） | 〜$30 |
| API | DALL-E 3（従量） | 〜$50 |
| **合計** | | **〜$250/月** |

---

## フェーズ別サービス導入タイミング

```
Phase 0:   Looka, Figma
Phase 0.5: Looka（ロゴ完成）
Phase 1:   Vercel, DigitalOcean, Supabase, Cloudflare, UptimeRobot
Phase 2:   Inngest, Gemini, Tavily, Firecrawl, Keywords Everywhere
Phase 3:   Next.js エコシステム全般
Phase 4:   Inngest（スケジュール機能強化）
Phase 5:   Stripe
Phase 6:   Google Analytics, PostHog, Discord, Tally
Phase 7:   DALL-E 3
Phase 8:   Cloudflare（カスタムドメイン機能）
Phase 10:  Google Search Console API
Phase 12:  Claude / GPT（オプション）
Phase 14:  Printful API
Phase 15:  Langfuse
```

---

## 注意事項

### API利用に関する注意

1. **Tavily API**: 検索結果は必ずLLMで解釈してから使用すること
2. **Firecrawl**: スクレイピングの法的リスクはAPI提供者が負担
3. **Gemini**: MVPではフォールバックLLMなし。エラー時はユーザーに通知
4. **Stripe**: 本番環境ではテストモードを無効化すること

### セキュリティ要件

1. WordPress APIトークンは**AES-256-GCM**で暗号化して保存
2. 暗号化キーは環境変数で管理（`WP_TOKEN_ENCRYPTION_KEY`）
3. Google OAuthトークンも同様に暗号化
4. 本番環境ではHTTPS必須

### コスト管理

1. 月初にAPIコストをモニタリング
2. Inngestステップ数を監視（25,000/月の無料枠）
3. R2ストレージ使用量を監視
4. 異常なAPI呼び出しをアラート設定

---

## 関連ドキュメント

- [CONCEPT_DECISIONS.md](../CONCEPT_DECISIONS.md) - コスト設計の根拠
- [02_Backend_Database.md](./02_Backend_Database.md) - データベース設計
- [04_AI_Pipeline.md](./04_AI_Pipeline.md) - AI処理パイプライン
- [08_Integration_Risk_Report.md](./08_Integration_Risk_Report.md) - APIコスト関連リスク（CV-003, FP-006）
