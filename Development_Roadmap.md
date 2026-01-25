# ProductBlog AI - 開発ロードマップ

**Version:** 11.0 (2026-01-25)

---

## このロードマップの目的

本ロードマップは、ProductBlog AIを「アイデア」から「収益を生むサービス」へと育てるための行動計画です。

**2つの軸で構成:**

1. **マーケティング軸:** X / Threadsでモックアップを拡散し、見込み顧客を集める
2. **プロダクト軸:** 実際に動くサービスを構築し、価値を届ける

---

## 重要な設計方針

### Zero Config（ゼロ設定）

ユーザーにDNS設定を一切求めない。弊社サブドメイン（`{slug}.productblog.com`）をデフォルトで即座に提供。独自ドメイン接続は将来のオプション機能。

### Security First（セキュリティ最優先）

- WordPress脆弱性対策（プラグイン最小化、定期更新）
- DDoS対策・WAF（Cloudflare）
- XSS / SQLインジェクション / その他OWASP Top 10対策
- ユーザーデータ保護（暗号化、アクセス制御）
- Nginxセキュリティヘッダー設定

### Scalable Architecture（拡張性のある設計）

初期はコスト最小で運用しつつ、500〜1,000ユーザー以上への拡張に耐えうるコード設計を維持。

---

## 全体構成

| Phase | 名称                 | 目的                                         | MVP必須  |
| :---- | :------------------- | :------------------------------------------- | :------- |
| **0** | **Mockup**           | SNS拡散用デモを作り、見込み顧客を集める      | △ (集客) |
| **1** | **Infrastructure**   | VPS・SSL・Multisite基盤を構築する            | ◎        |
| **2** | **Core AI**          | AI分析・記事生成・WP投稿のコア機能を実装     | ◎        |
| **3** | **User Interface**   | 認証・ダッシュボード・記事管理画面を作る     | ◎        |
| **4** | **Monetization**     | Stripe決済を実装し、収益化の土台を作る       | ◎        |
| **5** | **🎯 MVP Launch**    | Betaユーザーにサービスを提供し、検証する     | ◎        |
| 6     | Automation           | スケジュール自動化                           | ×        |
| 7     | Visual               | 画像自動生成                                 | ×        |
| 8     | Custom Domain        | 独自ドメイン接続                             | ×        |
| 9     | SSO                  | WPへのシームレスログイン                     | ×        |
| 10    | GSC Integration      | Google Search Console連携・自律改善          | ×        |
| 11    | Headless Evaluation  | Headless WordPress化の妥当性評価             | ×        |

**🎯 MVPは Phase 5 で完成。**

---

## Phase 0: Mockup（マーケティング・集客）

### 目的

実際のサービスを作る前に、ビジョンを視覚化しX / Threadsで拡散。需要検証と**ウェイトリスト（見込み顧客リスト）を構築**する。

### 成果物

1. **ランディングページ（LP）**
   - 「Your AI Marketing Team. Setup in 3 minutes.」
   - URL入力フォーム（見た目のみ）
   - ブログ記事が増えていくビジュアル
   - **ウェイトリスト登録フォーム**（メールアドレス収集）

2. **セットアップ演出画面**
   - 「Analyzing your product...」→「Complete!」のプログレス演出

3. **ダッシュボードデモ**
   - 記事一覧（ダミー）
   - 「Generate New Post」→ タイプライター風アニメーション

4. **ウェイトリスト管理**
   - メール収集先: ConvertKit / Buttondown / Google Spreadsheet
   - 登録者への自動返信メール設定

### 技術スタック

- Next.js 14 (App Router) + Tailwind CSS + Shadcn/UI + Framer Motion
- Hosting: Vercel
- Email: ConvertKit or Buttondown（ウェイトリスト管理）

### マーケティング活動

- **X投稿:** 動画形式でセットアップ演出を録画し投稿
- **Threads投稿:** 同内容をThreadsにも展開
- **継続的な発信:** 開発進捗の共有、フィードバック募集

### 成功基準

- **ウェイトリスト50名以上**
- 「使いたい」という反応が得られる

### 備考

Phase 0（マーケティング）とPhase 1-4（実装）は**並行して進行可能**。
ウェイトリストで集めた見込み顧客は、Phase 5のBeta Launchで招待する。

---

## Phase 1: Infrastructure（基盤構築）

### 目的

サービスを動かす土台を構築。ユーザー登録と同時に`{slug}.productblog.com`でHTTPS対応ブログが即座に発行される状態を作る。

### 実装内容

1. **VPSセットアップ**
   - DigitalOcean Droplet (Ubuntu 22.04)
   - セキュリティ設定: SSH鍵認証、UFW、Fail2ban

2. **ドメイン・DNS**
   - `productblog.com` 取得
   - ワイルドカードDNS: `*.productblog.com` → VPS

3. **Nginx + SSL**
   - Let's Encrypt ワイルドカード証明書
   - 自動更新設定
   - セキュリティヘッダー設定

4. **WordPress Multisite**
   - サブドメイン型Multisite
   - WP-CLI設定
   - セキュリティプラグイン最小構成

5. **Cloudflare導入**
   - DDoS対策
   - WAF設定
   - キャッシュ最適化

### 成功基準

- `https://test.productblog.com` がSSL有効でアクセス可能
- コマンド1つで新サイト作成可能
- セキュリティスキャンでクリティカルな問題なし

---

## Phase 2: Core AI（AIコア機能）

### 目的

「プロダクトURLを入力するだけで、AIがターゲットを分析し、SEO記事を生成してWordPressに投稿する」フローを実現。

### 実装内容

1. **AI分析エンジン**
   - Firecrawl APIでプロダクトURL取得
   - LLM（Gemini/Claude）でターゲット層・キーワード分析
   - 記事テーマクラスター生成

2. **コンテンツ生成エンジン**
   - Tavily APIで最新情報検索
   - LLMで記事本文生成（Article / FAQ / Glossary）
   - Fact Check、参照URL明記

3. **WordPress投稿連携**
   - REST API経由で投稿
   - 下書き / 公開の選択機能

### 成功基準

- テストURLから10分以内に記事がWPに投稿される
- 生成記事が読んで意味のある内容

---

## Phase 3: User Interface（ユーザーインターフェース）

### 目的

ユーザーがアカウント作成から記事確認・管理までを行える画面を提供。

### 実装内容

1. **認証システム**
   - NextAuth.js（Email/Password）
   - パスワードリセット
   - セキュアなセッション管理

2. **オンボーディング**
   - プロダクトURL入力
   - 分析中プログレス表示
   - 完了通知

3. **ダッシュボード**
   - 記事一覧（生成中/下書き/公開済み）
   - 記事生成ボタン
   - 公開フロー設定（自動公開 or 確認後公開）

4. **記事管理**
   - プレビュー
   - WP管理画面リンク
   - CTA一括設定

### 成功基準

- 新規ユーザーが登録〜ブログ作成まで完了
- 生成記事を確認・公開できる

---

## Phase 4: Monetization（収益化）

### 目的

月額課金でサービスを継続利用できる仕組みを構築。

### 実装内容

1. **Stripe連携**
   - Checkout Session API
   - Webhook処理
   - Customer Portal（解約・プラン変更）

2. **サブスクリプション管理**
   - 課金ステータスDB管理
   - 未払い時の機能制限

3. **料金ページ**
   - プラン説明
   - 申し込みボタン → Stripe Checkout

### 成功基準

- テストカードで決済フロー完了
- 課金ステータスがDBに正しく反映
- 解約処理が正常動作

---

## 🎯 Phase 5: MVP Launch（リリース）

### 目的

Phase 0-4の全要素を統合し、Betaユーザーに提供して検証する。

### 実装内容

1. **WordPressテーマ選定**
   - SEO最適化済み無料テーマを採用
   - 選定基準: 速度、Schema対応、日本語対応

2. **Betaユーザー募集**
   - ウェイトリストから招待
   - フィードバック提供を条件とする

3. **サポート体制**
   - Slackチャンネル開設
   - 必要に応じてZoomサポート

4. **フィードバック収集**
   - 週次アンケート
   - 1on1インタビュー

### 成功基準

- 10社中8社以上がセットアップ完了
- 致命的バグ（サービス停止レベル）がゼロ
- 継続利用意向70%以上

---

## Phase 6-11: ポストMVP（成長機能）

Beta Launchのフィードバックに基づき優先度を調整。

### Phase 6: Automation
- ユーザー定義スケジュールで自動生成・公開
- 通知システム（Email/Slack）

### Phase 7: Visual
- DALL-E 3によるアイキャッチ画像生成

### Phase 8: Custom Domain
- ユーザー独自ドメインでの運用（オプション）
- SSL自動発行

### Phase 9: SSO
- ダッシュボード → WP管理画面への再ログイン不要遷移

### Phase 10: GSC Integration
- Google Search Console API連携
- 低CTR記事の自動検出
- AIによる自律的リライト機能

### Phase 11: Headless Evaluation
- Headless WordPress化（Static Export + Edge配信）の妥当性評価
- Go/No-Go判定
- 現行アーキテクチャとの整合性検証

---

## 意思決定ログ

| # | 決定事項 | 理由 |
|---|---------|------|
| 1 | Zero Config採用 | ユーザーDNS設定不要。即座にブログ開始可能 |
| 2 | SSL必須 | Phase 1でワイルドカードSSL。MVP必須条件 |
| 3 | Multisite採用 | Docker独立コンテナより効率的 |
| 4 | WordPress確定 | 他CMS検討せず。ブレ防止 |
| 5 | セキュリティ最優先 | WAF、DDoS対策、XSS/インジェクション対策を全層で実装 |
| 6 | 拡張性設計 | 500-1000ユーザー以上を想定したコード設計 |
| 7 | マーケティングはX/Threads中心 | 有料広告・パートナーシップは当面検討しない |
| 8 | 独自ドメインはオプション | Phase 8で対応。MVPでは弊社サブドメインのみ |
| 9 | GSC連携は将来機能 | Phase 10で自律リライト機能と共に検討 |
| 10 | Headless化は将来評価 | Phase 11で現行との整合性を検証後に判断 |
