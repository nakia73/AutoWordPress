# Argo Note - 完全セットアップガイド

このドキュメントは、Argo Note アプリケーションを開発環境および本番環境で動作させるために必要な全ての手順を詳細に説明します。

---

## 目次

1. [前提条件](#1-前提条件)
2. [プロジェクトのクローンと依存関係インストール](#2-プロジェクトのクローンと依存関係インストール)
3. [Supabase セットアップ](#3-supabase-セットアップ)
4. [Stripe セットアップ](#4-stripe-セットアップ)
5. [LiteLLM / Gemini API セットアップ](#5-litellm--gemini-api-セットアップ)
6. [Tavily API セットアップ](#6-tavily-api-セットアップ)
7. [Inngest セットアップ](#7-inngest-セットアップ)
8. [Cloudflare R2 セットアップ（オプション）](#8-cloudflare-r2-セットアップオプション)
9. [環境変数の設定](#9-環境変数の設定)
10. [データベースセットアップ](#10-データベースセットアップ)
11. [ローカル開発環境の起動](#11-ローカル開発環境の起動)
12. [本番環境デプロイ](#12-本番環境デプロイ)
13. [トラブルシューティング](#13-トラブルシューティング)

---

## 1. 前提条件

### 必須ソフトウェア

| ソフトウェア | 最低バージョン | 確認コマンド | インストール方法 |
|------------|--------------|-------------|----------------|
| Node.js | v20.0.0 | `node --version` | https://nodejs.org/ |
| npm | v10.0.0 | `npm --version` | Node.jsに同梱 |
| Git | v2.40.0 | `git --version` | https://git-scm.com/ |

### 必須アカウント

以下のサービスのアカウントが必要です。全て無料プランから始められます。

| サービス | 用途 | 登録URL |
|---------|------|---------|
| Supabase | 認証・データベース | https://supabase.com/ |
| Stripe | 決済処理 | https://stripe.com/ |
| LiteLLM | AI/LLM プロキシ | https://litellm.ai/ |
| Tavily | Web検索API | https://tavily.com/ |
| Inngest | バックグラウンドジョブ | https://inngest.com/ |

### オプションアカウント

| サービス | 用途 | 登録URL |
|---------|------|---------|
| Cloudflare | CDN・R2ストレージ | https://cloudflare.com/ |
| Sentry | エラーモニタリング | https://sentry.io/ |
| PostHog | アナリティクス | https://posthog.com/ |

---

## 2. プロジェクトのクローンと依存関係インストール

### 2.1 プロジェクトのクローン

ターミナルを開き、以下のコマンドを実行します。

```bash
# プロジェクトをクローン
git clone <repository-url> Autoblog
cd Autoblog/app
```

### 2.2 依存関係のインストール

```bash
npm install
```

**期待される出力:**
```
added XXX packages in XXs
```

### 2.3 環境変数ファイルの作成

```bash
cp .env.example .env
```

**確認方法:**
```bash
ls -la .env
```

`.env` ファイルが存在することを確認してください。

---

## 3. Supabase セットアップ

Supabaseは認証（Google OAuth）とPostgreSQLデータベースを提供します。

### 3.1 Supabase プロジェクト作成

1. **ブラウザで開く:** https://supabase.com/dashboard

2. **サインイン:**
   - 右上の「Sign In」をクリック
   - GitHub または Google アカウントでサインイン

3. **新規プロジェクト作成:**
   - ダッシュボードで「New Project」ボタンをクリック
   - Organization を選択（なければ新規作成）
   - 以下を入力:
     - **Name:** `argo-note` （任意の名前）
     - **Database Password:** 強力なパスワードを設定（**必ずメモしておく**）
     - **Region:** `Northeast Asia (Tokyo)` を推奨
   - 「Create new project」をクリック

4. **プロジェクト作成待機:**
   - 約2-3分でプロジェクトが作成されます
   - 「Project is ready」と表示されるまで待機

### 3.2 API キーの取得

1. **左サイドバー** → **Settings**（歯車アイコン）をクリック

2. **API** をクリック

3. 以下の値をメモ:

   | 項目 | 環境変数名 | 場所 |
   |------|-----------|------|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` | 「Project URL」セクション |
   | anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 「Project API keys」セクション |
   | service_role | `SUPABASE_SERVICE_ROLE_KEY` | 「Project API keys」セクション（「Reveal」をクリック）|

   **例:**
   ```
   Project URL: https://abcdefghijk.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3.3 Database URL の取得

1. **左サイドバー** → **Settings** → **Database**

2. **Connection string** セクションで「URI」タブを選択

3. **Connection string** をコピー

4. `[YOUR-PASSWORD]` の部分を、プロジェクト作成時に設定したパスワードに置き換え

   **例:**
   ```
   postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

   ↓ パスワードを置き換え

   ```
   postgresql://postgres.abcdefghijk:MySecurePassword123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### 3.4 Google OAuth 設定

1. **Google Cloud Console を開く:** https://console.cloud.google.com/

2. **プロジェクト作成/選択:**
   - 上部の「プロジェクトを選択」をクリック
   - 「新しいプロジェクト」をクリック
   - プロジェクト名: `Argo Note` → 「作成」

3. **OAuth 同意画面の設定:**
   - 左メニュー「APIとサービス」→「OAuth 同意画面」
   - User Type: 「外部」を選択 → 「作成」
   - 以下を入力:
     - アプリ名: `Argo Note`
     - ユーザーサポートメール: 自分のメールアドレス
     - デベロッパーの連絡先情報: 自分のメールアドレス
   - 「保存して続行」をクリック（スコープ、テストユーザーはスキップ可）

4. **OAuth クライアント ID の作成:**
   - 左メニュー「APIとサービス」→「認証情報」
   - 「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類: 「ウェブ アプリケーション」
   - 名前: `Argo Note Web`
   - 承認済みの JavaScript 生成元:
     ```
     http://localhost:3000
     https://your-domain.com  (本番環境のドメイン)
     ```
   - 承認済みのリダイレクト URI:
     ```
     https://[project-ref].supabase.co/auth/v1/callback
     ```
     ※ `[project-ref]` は Supabase の Project URL から取得（例: `abcdefghijk`）
   - 「作成」をクリック
   - 表示される **クライアント ID** と **クライアント シークレット** をメモ

5. **Supabase に Google Provider を設定:**
   - Supabase ダッシュボードに戻る
   - 左サイドバー「Authentication」→「Providers」
   - 「Google」をクリック
   - 「Enable Sign in with Google」をオン
   - Client ID: 上でメモしたクライアント ID
   - Client Secret: 上でメモしたクライアント シークレット
   - 「Save」をクリック

### 3.5 Auth 設定（Redirect URLs）

1. **Supabase ダッシュボード** → **Authentication** → **URL Configuration**

2. 以下を設定:
   - **Site URL:** `http://localhost:3000` （開発時）
   - **Redirect URLs:** 以下を追加
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/dashboard
     https://your-domain.com/auth/callback  (本番用)
     https://your-domain.com/dashboard      (本番用)
     ```

3. 「Save」をクリック

---

## 4. Stripe セットアップ

Stripeはサブスクリプション課金を処理します。

### 4.1 Stripe アカウント作成

1. **ブラウザで開く:** https://dashboard.stripe.com/register

2. **アカウント作成:**
   - メールアドレス、氏名、パスワードを入力
   - 「アカウントを作成」をクリック
   - メール認証を完了

### 4.2 テストモードの確認

1. **Stripe ダッシュボード:** https://dashboard.stripe.com/

2. **テストモード確認:**
   - 右上に「テストモード」と表示されていることを確認
   - 表示されていない場合は、トグルスイッチをクリックしてテストモードに切り替え

### 4.3 API キーの取得

1. **開発者** → **API キー** をクリック
   （または直接: https://dashboard.stripe.com/test/apikeys）

2. 以下の値をメモ:

   | 項目 | 環境変数名 | 場所 |
   |------|-----------|------|
   | 公開可能キー | `STRIPE_PUBLISHABLE_KEY` | 「標準キー」セクション |
   | シークレットキー | `STRIPE_SECRET_KEY` | 「標準キー」→「シークレットキーを表示」|

   **例:**
   ```
   公開可能キー: pk_test_51...
   シークレットキー: sk_test_51...
   ```

### 4.4 サブスクリプション商品の作成

1. **商品** をクリック（または: https://dashboard.stripe.com/test/products）

2. **Starter プラン作成:**
   - 「商品を追加」をクリック
   - 名前: `Starter Plan`
   - 説明: `基本プラン - 月間10記事生成`
   - 「価格を追加」:
     - 価格モデル: 「標準の価格設定」
     - 金額: `2000`
     - 通貨: `JPY - 日本円`
     - 請求期間: 「継続」→「月次」
   - 「商品を保存」をクリック
   - 作成された価格の **Price ID** をメモ（例: `price_1A2B3C...`）

3. **Pro プラン作成:**
   - 「商品を追加」をクリック
   - 名前: `Pro Plan`
   - 説明: `プロプラン - 月間50記事生成`
   - 「価格を追加」:
     - 金額: `3000`
     - 通貨: `JPY - 日本円`
     - 請求期間: 「継続」→「月次」
   - 「商品を保存」をクリック
   - 作成された価格の **Price ID** をメモ

### 4.5 Customer Portal 設定

1. **設定** → **Billing** → **カスタマーポータル**
   （または: https://dashboard.stripe.com/test/settings/billing/portal）

2. 以下を設定:
   - 「顧客が更新できる支払い方法」: オン
   - 「顧客がサブスクリプションをキャンセルできる」: オン
   - 「顧客が請求履歴を表示できる」: オン

3. 「変更を保存」をクリック

### 4.6 Webhook 設定（ローカル開発用）

ローカル開発では Stripe CLI を使用します。

1. **Stripe CLI インストール:**

   **macOS (Homebrew):**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

   **Windows (Scoop):**
   ```bash
   scoop install stripe
   ```

   **その他:** https://stripe.com/docs/stripe-cli#install

2. **Stripe CLI にログイン:**
   ```bash
   stripe login
   ```
   - ブラウザが開くので、Stripe アカウントで認証

3. **Webhook を転送（開発サーバー起動後に実行）:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   **出力例:**
   ```
   Ready! Your webhook signing secret is whsec_abcdefghij... (^C to quit)
   ```

   表示された `whsec_...` を `STRIPE_WEBHOOK_SECRET` としてメモ

### 4.7 Webhook 設定（本番環境用）

1. **開発者** → **Webhook** → **エンドポイントを追加**

2. 以下を設定:
   - エンドポイント URL: `https://your-domain.com/api/webhooks/stripe`
   - リッスンするイベント:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. 「エンドポイントを追加」をクリック

4. エンドポイント詳細画面で「署名シークレット」→「表示」から Webhook シークレットをメモ

---

## 5. LiteLLM / Gemini API セットアップ

LiteLLM は Google Gemini API へのプロキシとして機能します。

### 5.1 LiteLLM アカウント作成

1. **ブラウザで開く:** https://litellm.ai/

2. **サインアップ:**
   - 「Get Started」をクリック
   - GitHub または Google でサインイン

3. **API キー取得:**
   - ダッシュボードで「API Keys」セクションへ
   - 「Create New Key」をクリック
   - Key Name: `argo-note`
   - 「Create」をクリック
   - 表示された API キーをメモ（一度しか表示されません）

### 5.2 代替: Google Gemini API 直接使用

LiteLLM の代わりに Google AI Studio を直接使用することもできます。

1. **Google AI Studio を開く:** https://aistudio.google.com/

2. **API キー取得:**
   - 「Get API Key」をクリック
   - 「Create API key」をクリック
   - プロジェクトを選択または新規作成
   - 表示された API キーをメモ

3. **環境変数設定時の注意:**
   - `LITELLM_API_KEY` に Google AI の API キーを設定
   - `LLM_MODEL` は `gemini/gemini-2.0-flash-exp` のまま

---

## 6. Tavily API セットアップ

Tavily は AI 向け Web 検索 API を提供します。

### 6.1 Tavily アカウント作成

1. **ブラウザで開く:** https://tavily.com/

2. **サインアップ:**
   - 「Get API Key」をクリック
   - Google または GitHub でサインイン

3. **API キー取得:**
   - ダッシュボードに自動的に API キーが表示されます
   - `tvly-` で始まるキーをメモ

   **例:**
   ```
   tvly-abcdefghijklmnop123456
   ```

### 6.2 使用量の確認

- Free プラン: 月間 1,000 検索まで無料
- ダッシュボードで使用量を確認可能

---

## 7. Inngest セットアップ

Inngest はバックグラウンドジョブ・ワークフローを処理します。

### 7.1 ローカル開発モード（推奨）

ローカル開発では Inngest Dev Server を使用します。アカウント作成不要です。

```bash
# Inngest Dev Server を起動（開発サーバーとは別ターミナルで）
npx inngest-cli dev
```

**出力例:**
```
Inngest Dev Server running at http://127.0.0.1:8288
```

この場合、環境変数は不要です。

### 7.2 本番環境用アカウント設定

本番環境では Inngest Cloud を使用します。

1. **ブラウザで開く:** https://app.inngest.com/

2. **サインアップ:**
   - 「Sign Up」をクリック
   - GitHub または Google でサインイン

3. **アプリ作成:**
   - 「Create App」をクリック
   - App Name: `Argo Note`
   - 「Create」をクリック

4. **キー取得:**
   - アプリ詳細画面で「Manage」→「Keys」
   - 以下をメモ:
     - **Event Key:** `evt_...` で始まるキー（`INNGEST_EVENT_KEY`）
     - **Signing Key:** `signkey-...` で始まるキー（`INNGEST_SIGNING_KEY`）

---

## 8. Cloudflare R2 セットアップ（オプション）

画像保存に Cloudflare R2 を使用する場合のみ設定が必要です。

### 8.1 Cloudflare アカウント作成

1. **ブラウザで開く:** https://dash.cloudflare.com/sign-up

2. **アカウント作成:**
   - メールアドレス、パスワードを入力
   - 「アカウントを作成」をクリック

### 8.2 R2 バケット作成

1. **左サイドバー** → **R2**

2. **「バケットを作成」をクリック**
   - バケット名: `argo-note-media`
   - 「バケットを作成」をクリック

### 8.3 API トークン作成

1. **右上のアイコン** → **マイプロフィール**

2. **API トークン** → **トークンを作成**

3. **「カスタムトークンを作成」** をクリック

4. 以下を設定:
   - トークン名: `Argo Note R2`
   - 許可:
     - アカウント → Cloudflare R2 → 編集
   - 「概要へ進む」→「トークンを作成」

5. 表示されたトークンをメモ

### 8.4 R2 API 資格情報

1. **R2** → **概要** → **R2 API トークンを管理**

2. **「API トークンを作成」** をクリック
   - 名前: `argo-note-r2`
   - 権限: 「オブジェクトの読み取りと書き込み」
   - 「API トークンを作成」をクリック

3. 以下をメモ:
   - Access Key ID: `R2_ACCESS_KEY_ID`
   - Secret Access Key: `R2_SECRET_ACCESS_KEY`

---

## 9. 環境変数の設定

全てのサービスのセットアップが完了したら、`.env` ファイルを編集します。

### 9.1 エディタで .env を開く

```bash
# VS Code の場合
code .env

# Vim の場合
vim .env

# nano の場合
nano .env
```

### 9.2 環境変数の入力

以下のテンプレートを参考に、取得した値を入力します。

```bash
# ============================================
# Database (Supabase PostgreSQL)
# ============================================
# Supabase Settings → Database → Connection string (URI) からコピー
# [YOUR-PASSWORD] を実際のパスワードに置き換え
DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ============================================
# Supabase
# ============================================
# Supabase Settings → API からコピー
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ============================================
# Stripe (Phase 5)
# ============================================
# Stripe Dashboard → 開発者 → API キーからコピー
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_PUBLISHABLE_KEY="pk_test_51..."
# stripe listen コマンドで取得（開発時）または Webhook 設定から（本番）
STRIPE_WEBHOOK_SECRET="whsec_..."
# Stripe 商品作成時にメモした Price ID
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_..."

# ============================================
# AI/LLM (Phase 2)
# ============================================
# LiteLLM ダッシュボードまたは Google AI Studio から取得
LITELLM_API_KEY="..."
LLM_MODEL="gemini/gemini-2.0-flash-exp"
LLM_TIMEOUT_SECONDS=30

# Tavily ダッシュボードから取得
TAVILY_API_KEY="tvly-..."

# Keywords API (オプション - 未使用なら空でOK)
KEYWORDS_API_KEY=""

# NanoBanana Pro (オプション - 画像生成)
# 注: 実際にはGOOGLE_API_KEYを使用（gemini-3-pro-image-preview）
NANOBANANA_API_KEY=""

# ============================================
# Inngest (Background Jobs)
# ============================================
# 開発時は空でOK（Dev Server使用）
# 本番では Inngest ダッシュボードから取得
INNGEST_SIGNING_KEY=""
INNGEST_EVENT_KEY=""

# ============================================
# WordPress VPS (Phase 1)
# ============================================
# WordPress VPS を使用する場合のみ設定
VPS_HOST=""
VPS_SSH_PRIVATE_KEY=""
VPS_SSH_USER="root"
WP_DOMAIN="argonote.app"

# WordPress API トークン暗号化キー（32バイトをBase64エンコード）
# 生成コマンド: openssl rand -base64 32
WP_TOKEN_ENCRYPTION_KEY=""

# ============================================
# Cloudflare (CDN, DNS, R2) - オプション
# ============================================
CLOUDFLARE_API_TOKEN=""
CLOUDFLARE_ZONE_ID=""
CLOUDFLARE_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="argo-note-media"

# ============================================
# Monitoring - オプション
# ============================================
SENTRY_DSN=""
POSTHOG_KEY=""

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 9.3 暗号化キーの生成（必要な場合）

WordPress API トークン暗号化キーを生成:

```bash
openssl rand -base64 32
```

出力された文字列を `WP_TOKEN_ENCRYPTION_KEY` に設定します。

---

## 10. データベースセットアップ

### 10.1 Prisma Client 生成

```bash
npx prisma generate
```

**期待される出力:**
```
✔ Generated Prisma Client (vX.X.X) to ./node_modules/@prisma/client in XXms
```

### 10.2 データベースマイグレーション

```bash
npx prisma db push
```

**期待される出力:**
```
🚀  Your database is now in sync with your Prisma schema. Done in XXs
```

### 10.3 データベース確認（オプション）

Prisma Studio でデータベースを確認:

```bash
npx prisma studio
```

ブラウザが開き、http://localhost:5555 でデータベースの内容を確認できます。

---

## 11. ローカル開発環境の起動

### 11.1 ターミナル 1: Next.js 開発サーバー

```bash
npm run dev
```

**期待される出力:**
```
   ▲ Next.js 16.1.4
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in XXs
```

### 11.2 ターミナル 2: Inngest Dev Server

新しいターミナルウィンドウを開いて:

```bash
npx inngest-cli dev
```

**期待される出力:**
```
Inngest Dev Server running at http://127.0.0.1:8288
```

### 11.3 ターミナル 3: Stripe CLI（Webhook 転送）

課金機能をテストする場合、新しいターミナルウィンドウを開いて:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 11.4 動作確認

1. **ブラウザで開く:** http://localhost:3000

2. **Google ログインテスト:**
   - 「Sign in with Google」をクリック
   - Google アカウントで認証
   - オンボーディング画面にリダイレクトされることを確認

3. **Inngest 確認:**
   - http://127.0.0.1:8288 を開く
   - 登録された関数が表示されることを確認

---

## 12. 本番環境デプロイ

### 12.1 Vercel へのデプロイ（推奨）

1. **Vercel にサインイン:** https://vercel.com/

2. **プロジェクトをインポート:**
   - 「New Project」をクリック
   - GitHub リポジトリを選択

3. **環境変数を設定:**
   - 「Environment Variables」セクションで全ての環境変数を入力
   - `NEXT_PUBLIC_APP_URL` は本番 URL に変更

4. **デプロイ:**
   - 「Deploy」をクリック

### 12.2 本番環境の設定更新

デプロイ後、以下を更新:

1. **Supabase:**
   - Authentication → URL Configuration → Site URL を本番 URL に変更
   - Redirect URLs に本番 URL を追加

2. **Google OAuth:**
   - 承認済みの JavaScript 生成元に本番 URL を追加
   - 承認済みのリダイレクト URI に本番コールバック URL を追加

3. **Stripe:**
   - 本番用 Webhook を作成（本番 URL を指定）

4. **Inngest:**
   - Vercel Integration を設定（https://www.inngest.com/docs/deploy/vercel）

---

## 13. トラブルシューティング

### よくあるエラーと解決方法

#### エラー: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**原因:** 環境変数が正しく設定されていない

**解決方法:**
1. `.env` ファイルの存在を確認
2. 環境変数名にタイポがないか確認
3. 開発サーバーを再起動: `npm run dev`

#### エラー: `Invalid API Key` (Supabase)

**原因:** API キーが間違っている、または期限切れ

**解決方法:**
1. Supabase ダッシュボードで最新のキーを再取得
2. `.env` を更新
3. 開発サーバーを再起動

#### エラー: `Failed to fetch` (Google OAuth)

**原因:** リダイレクト URL の設定が不正

**解決方法:**
1. Google Cloud Console でリダイレクト URI を確認
2. Supabase の URL Configuration でリダイレクト URL を確認
3. 両方で同じ URL が設定されていることを確認

#### エラー: `prisma db push` が失敗する

**原因:** DATABASE_URL が不正、またはデータベースに接続できない

**解決方法:**
1. DATABASE_URL のパスワードが正しいか確認
2. Supabase ダッシュボードでデータベースがアクティブか確認
3. VPN 使用時は無効にして試す

#### エラー: Inngest 関数が実行されない

**原因:** Inngest Dev Server が起動していない

**解決方法:**
1. `npx inngest-cli dev` が実行中か確認
2. http://127.0.0.1:8288 にアクセスして関数が登録されているか確認
3. アプリの `/api/inngest` エンドポイントが有効か確認

#### エラー: Stripe Webhook が受信できない

**原因:** stripe listen が起動していない、または転送先が間違っている

**解決方法:**
1. `stripe listen --forward-to localhost:3000/api/webhooks/stripe` が実行中か確認
2. 表示された webhook secret を `.env` に設定しているか確認
3. 開発サーバーが起動しているか確認

---

## 必須環境変数チェックリスト

アプリケーションを起動する前に、以下の環境変数が設定されていることを確認してください。

### 必須（アプリ起動に必要）

- [x] `DATABASE_URL` - Supabase PostgreSQL 接続文字列
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Supabase プロジェクト URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 公開キー
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Supabase サービスロールキー

### AI 機能に必要

- [x] `LITELLM_API_KEY` - LLM API キー
- [x] `TAVILY_API_KEY` - Tavily 検索 API キー

### 課金機能に必要

- [ ] `STRIPE_SECRET_KEY` - Stripe シークレットキー
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe 公開キー
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe Webhook シークレット
- [ ] `STRIPE_STARTER_PRICE_ID` - Starter プラン価格 ID
- [ ] `STRIPE_PRO_PRICE_ID` - Pro プラン価格 ID

### 本番環境に必要

- [ ] `INNGEST_SIGNING_KEY` - Inngest 署名キー
- [ ] `INNGEST_EVENT_KEY` - Inngest イベントキー
- [ ] `NEXT_PUBLIC_APP_URL` - 本番 URL に変更

---

## サポート

問題が解決しない場合は、以下をご確認ください:

- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Inngest:** https://www.inngest.com/docs
- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs

---

最終更新: 2026-01-27
