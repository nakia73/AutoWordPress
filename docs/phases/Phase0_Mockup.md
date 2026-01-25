# Phase 0: Mockup（マーケティング・集客）詳細仕様書

**テーマ:** Visualization & Traction
**ゴール:** SNS拡散用のデモを作り、見込み顧客を集める。サービス開発前に需要を検証する。
**期間:** Week 1-2

---

## 1. なぜこのフェーズが必要か？

開発に数ヶ月かける前に、以下を確認する必要があります:

1. **需要検証:** このアイデアに市場のニーズがあるか？
2. **集客準備:** サービス完成時にすぐユーザーを獲得できる状態を作る
3. **方向性調整:** 早期フィードバックで軌道修正する

**このフェーズの成果物はデモ（ハリボテ）であり、実際のバックエンドは実装しません。**

---

## 2. 成果物

### 2.1 ランディングページ (LP)

サービスの価値を一目で伝え、興味を引くページ。

**構成:**

- **Hero Section:**
  - コピー: 「Your AI Marketing Team. Setup in 3 minutes.」
  - URL入力フォーム（見た目のみ、実際の処理はなし）
  - 「Start Free」ボタン
- **Feature Section:**
  - 「AI記事生成」「WordPress自動構築」「SEO最適化」の3つの価値
- **Social Proof:**
  - 「〇〇人が待っています」（ウェイトリスト数を表示）
- **CTA:**
  - メール登録フォーム（ウェイトリスト登録用）

### 2.2 セットアップ演出画面

「バックエンドで魔法が起きている」感を演出する画面。

**アニメーションシーケンス:**

1. **"Analyzing your product..."** (3秒)
   - URLからメタデータを取得しているようなローディング
2. **"Identifying target audience..."** (3秒)
   - ターゲット層を分析しているような演出
3. **"Generating content strategy..."** (3秒)
   - 記事テーマを決めているような演出
4. **"Provisioning WordPress..."** (4秒)
   - コンソール風にログが流れる演出
5. **"Complete! Your blog is ready."**
   - 成功メッセージ → ダッシュボードへ

### 2.3 ダッシュボードデモ

運用開始後の管理画面の見た目を示すデモ。

**画面構成:**

- **Overview Cards:**
  - Total Posts: 12
  - Published: 8
  - Scheduled: 4
- **Recent Posts Table:**
  - ダミー記事一覧（タイトル、ステータス、日付）
- **Actions:**
  - `[ Generate New Post ]` ボタン → 記事生成アニメーション
  - `[ View Blog ]` ボタン → WordPress風のプレビュー表示
  - `[ Open WP Admin ]` ボタン → 管理画面の画像を表示

---

## 3. 技術スタック

| 役割             | ツール                                       |
| :--------------- | :------------------------------------------- |
| Framework        | Next.js 14 (App Router)                      |
| Styling          | Tailwind CSS                                 |
| UI Components    | Shadcn/UI                                    |
| Animation        | Framer Motion                                |
| Form             | React Hook Form                              |
| Email Collection | ConvertKit / Buttondown / Google Spreadsheet |
| Hosting          | Vercel                                       |

---

## 4. 実装ステップ

### Step 1: プロジェクト作成

```bash
npx create-next-app@latest productblog-mockup --typescript --tailwind --app
cd productblog-mockup
npx shadcn-ui@latest init
```

### Step 2: ランディングページ実装

- Hero Section + Feature Section + CTA
- メール登録フォーム（バックエンドはConvertKit等に接続）

### Step 3: セットアップ演出実装

- Framer Motionで各ステップのアニメーション
- 進捗バーまたはステップインジケーター

### Step 4: ダッシュボードデモ実装

- 静的なダミーデータで記事一覧を表示
- 「Generate」ボタンでタイプライター風テキスト表示

### Step 5: デプロイ

- Vercelにデプロイ
- カスタムドメイン（`productblog.app` 等）設定

---

## 5. マーケティング活用

### 5.1 SNS投稿計画

1. **ティーザー投稿:** 「こんなサービス作ってます」
2. **デモ動画投稿:** セットアップ演出の画面録画（30秒）
3. **ウェイトリスト告知:** 「先行登録で〇〇%オフ」
4. **進捗報告:** 開発の進捗を定期的にシェア

### 5.2 収集するデータ

- ウェイトリスト登録数
- LP訪問数（Vercel Analytics）
- SNS投稿のエンゲージメント

---

## 6. 成功基準

| 指標                   | 目標値                         |
| :--------------------- | :----------------------------- |
| ウェイトリスト登録     | 50名以上                       |
| LP訪問数               | 500PV以上                      |
| 「使いたい」という反応 | 肯定的なコメントが否定を上回る |

---

## 7. 次のステップ

ウェイトリストに十分な登録があり、肯定的なフィードバックが得られたら、**Phase 1: Infrastructure** に進む。
