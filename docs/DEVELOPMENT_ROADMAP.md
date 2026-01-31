# Argo Note - 開発ロードマップ

> **サービスコンセプト:** "Your AI-Powered Blog. Fully Automated."
> バイブコーディング時代の「放置OK」ブログ自動運用SaaS
>
> **MVP期限:** 2026年2月25日（1ヶ月）
> **月額予算:** $100以内

---

## 開発方針: 3ストリーム並行開発

本プロジェクトは**3つの独立したストリーム**で並行開発を進めます。
各ストリームはスタンドアローンで動作検証可能な状態を目指し、最終的に統合します。

```
┌─────────────────────────────────────────────────────────────────────┐
│                        開発ストリーム構成                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Stream M: Marketing          ◄── 開発と並列で継続的に実行          │
│  ├── モックアップ作成                                                │
│  ├── SNS/LP発信                                                     │
│  └── コンセプト検証・フィードバック収集                               │
│                                                                     │
│  Stream A: Article Generation ◄── 最初に構築                        │
│  ├── AI記事生成モジュール（スタンドアローン）                          │
│  ├── プロダクト分析エンジン                                          │
│  └── 表示用スタブUI                                                  │
│                                                                     │
│  Stream W: WordPress Setup    ◄── 次に構築                          │
│  ├── VPS自動プロビジョニング                                         │
│  ├── WordPress Multisite構築                                        │
│  └── ブログ自動セットアップ                                          │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Integration Phase            ◄── 統合フェーズ                       │
│  ├── Stream A + Stream W 結合                                       │
│  ├── 本番UI構築                                                      │
│  └── MVP完成・リリース                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### ストリーム間の依存関係

```
Stream M (Marketing) ─────────────────────────────────────────────────►
                                                       ▲
Stream A (Article)  ────────────────►                  │ フィードバック
                                     ╲                 │
                                      ╲                │
Stream W (WordPress) ────────────────► Integration ────┘
```

- **Stream M**: 他ストリームと並列で常時実行
- **Stream A → Integration**: 記事生成が動作確認できてから統合
- **Stream W → Integration**: WPセットアップが動作確認できてから統合

---

## ドキュメント構成

```
docs/
├── DEVELOPMENT_ROADMAP.md    # 本ドキュメント（開発全体の俯瞰）
├── architecture/             # 技術仕様書（HOW）
│   ├── 00_Master_Architecture.md
│   ├── 01_Frontend_Architecture.md
│   ├── 02_Backend_Database.md
│   ├── 03_Infrastructure_Ops.md
│   ├── 04_AI_Pipeline.md
│   └── ...
└── phases/                   # ストリーム別フェーズ詳細
    ├── StreamM_Marketing.md      # マーケティング（継続）
    ├── StreamA_ArticleGen.md     # 記事生成モジュール
    ├── StreamW_WordPress.md      # WordPressセットアップ
    ├── Integration_MVP.md        # 統合・MVPリリース
    └── Growth_*.md               # 成長フェーズ
```

---

## Stream M: Marketing（マーケティング）

**目的:** コンセプト検証・認知獲得・フィードバック収集

| Phase | タスク | 成果物 |
|-------|--------|--------|
| M-1 | モックアップ作成 | デモ動画、スクリーンショット |
| M-2 | SNS発信開始 | X/Twitter投稿、反応分析 |
| M-3 | LP公開 | ランディングページ、Waitlist |
| M-4 | ブランディング | ロゴ、アイコン、カラースキーム |
| M-5 | 継続発信 | 週次更新、開発進捗共有 |

**詳細:** [StreamM_Marketing.md](./phases/StreamM_Marketing.md)

---

## Stream A: Article Generation（記事生成モジュール）

**目的:** AI記事生成エンジンをスタンドアローンで構築・検証

| Phase | タスク | 成果物 |
|-------|--------|--------|
| A-1 | プロダクト分析エンジン | URL→商品情報抽出 |
| A-2 | 記事生成コア | 商品情報→ブログ記事HTML |
| A-3 | スタブUI作成 | 生成結果確認用シンプルUI |
| A-4 | CLIツール | コマンドラインからの記事生成 |
| A-5 | 品質検証 | 生成記事の品質評価・調整 |

**依存関係:** なし（スタンドアローン）
**出力:** 記事HTML + メタデータJSON
**詳細:** [StreamA_ArticleGen.md](./phases/StreamA_ArticleGen.md)

---

## Stream W: WordPress Setup（WordPressセットアップ）

**目的:** VPS・WordPress環境の自動構築をスタンドアローンで構築・検証

| Phase | タスク | 成果物 |
|-------|--------|--------|
| W-1 | VPSプロビジョニング | Hetzner API連携、サーバー自動作成 |
| W-2 | WordPress Multisite | 自動インストール、設定 |
| W-3 | サイト作成API | ユーザー用サブサイト自動作成 |
| W-4 | 記事投稿API | 外部からの記事投稿機能 |
| W-5 | 動作検証 | E2Eテスト、信頼性確認 |

**依存関係:** なし（スタンドアローン）
**出力:** WordPress REST API エンドポイント
**詳細:** [StreamW_WordPress.md](./phases/StreamW_WordPress.md)

---

## Integration Phase（統合フェーズ）

**目的:** Stream A + Stream W を結合し、本番サービスとして完成

| Phase | タスク | 成果物 |
|-------|--------|--------|
| I-1 | A↔W結合 | 記事生成→WP投稿の自動化 |
| I-2 | 認証・ユーザー管理 | Supabase Auth統合 |
| I-3 | 本番UI構築 | ダッシュボード、オンボーディング |
| I-4 | 自動化・スケジューリング | Inngest統合、定期実行 |
| I-5 | 決済統合 | Stripe連携 |
| I-6 | MVP Launch | ベータリリース |

**詳細:** [Integration_MVP.md](./phases/Integration_MVP.md)

---

## 成長フェーズ（Growth Phase）

MVPリリース後、フィードバックに基づき優先順位を決定。

| Phase | 名称 | 概要 |
|-------|------|------|
| G-1 | Visual | AI画像生成（Nanobana Pro）|
| G-2 | Custom Domain | 独自ドメイン接続・SSL自動発行 |
| G-3 | SSO | ダッシュボード→WP管理画面のシームレスログイン |
| G-4 | GSC Integration | Google Search Console連携 |
| G-5 | Model Selection | ユーザーによるLLMモデル選択 |
| G-6 | Referral Program | リファラルプログラム |
| G-7 | Prompt Intelligence | プロンプト効果分析・A/Bテスト |
| **G-8** | **Article Rewrite** | **記事リライト・自動更新システム** |
| **G-9** | **Keyword Intelligence** | **キーワード分析・提案システム** |
| G-10 | Multi-Site Dashboard | 複数WordPress一元管理ダッシュボード |
| G-11 | Team Collaboration | チーム協業・承認フロー・ワークフロー |
| G-12 | Advanced UI/UX | WordPress制約を超えたリッチUI |

---

## 検討中機能（Investigation Phase）

以下の機能は記事生成の品質向上のために検討中。
詳細仕様: [FIRST_PRINCIPLES_ARTICLE_GENERATION.md](./FIRST_PRINCIPLES_ARTICLE_GENERATION.md#11-追加検討機能2026年1月29日追記)

| 機能 | 概要 | 推奨Phase | 優先度 |
|------|------|-----------|--------|
| **商品誘導機能 (Product CTA)** | 記事末尾等で販売商品への自然な誘導を追加 | MVP | 高 |
| **ペルソナ機能 (Writer Persona)** | 人間らしい言葉遣い・感情表現・ストーリーテリングの実現 | MVP/Phase 10 | 高 |
| **Trace機能 (Writing Style Trace)** | 特定文章の文体・語彙特徴を解析し模倣（独立モジュール） | Phase 10 | 中 |
| **記事リライト (Article Rewrite)** | 投稿済み記事の自動更新・最新化 | Phase 10-11 | **最高** |
| **キーワード分析 (Keyword Intelligence)** | GSC連携・キーワード提案・優先度スコアリング | Phase 12 | 高 |

### 機能詳細

**設計原則: アセット管理方式（事前登録→選択）**
- ペルソナ・トレース・商品CTAは**専用管理画面で事前に登録**
- 記事生成時に登録済みアセットを**選択して適用**
- 複数登録可能（ソフトコーディング）

#### 商品誘導機能（Product CTA）
- **目的:** 生成記事から販売商品/サービスへの導線を構築
- **管理画面:** `/settings/products`
- **内容:**
  - 商品名・URL・ベネフィットを事前登録
  - 記事生成時に適用する商品CTAを選択
  - 記事末尾に自然なCTAセクションを自動挿入

#### ペルソナ機能（Writer Persona）
- **目的:** AI生成記事に人間らしさを付与
- **管理画面:** `/settings/personas`
- **内容:**
  - プリセットペルソナ3種類（プロフェッショナル/カジュアル/教師風）
  - カスタムペルソナの作成・登録
  - 感情表現・ストーリーテリング・体験風語り口の設定
  - 記事生成時に使用するペルソナを選択
  - **既存Soul Injection Systemを拡張して実装**

#### Trace機能（Writing Style Trace）
- **目的:** 特定の参考文章のスタイルを捉えて模倣
- **管理画面:** `/settings/style-traces`
- **内容:**
  - URL指定またはテキスト入力でサンプル文章を解析・登録
  - 解析済みスタイルプロファイルをアセットとして保存
  - 記事生成時に適用するトレースを選択
  - **完全独立モジュールとして実装（他機能に依存しない）**

#### 記事リライト機能（Article Rewrite System）★必須機能
- **目的:** 投稿済み記事を定期的に更新し、検索順位と情報鮮度を維持
- **管理画面:** `/articles/:id/goal`（目標設定）, `/articles/rewrite`（リライト管理）
- **内容:**
  - 記事目標・哲学の設定（ターゲット読者、SEO目標、更新方針）
  - スケジュールリライト（30日/60日/90日等の定期実行）
  - GSCトリガー（順位低下検知時の自動リライト提案）
  - 更新強度設定（軽微/中程度/大幅）
  - 差分プレビューと承認フロー
  - 競合記事分析・最新ニュース取り込み
  - リライト履歴管理・効果測定

#### キーワード分析機能（Keyword Intelligence）
- **目的:** キーワード選定の自動化・最適化
- **管理画面:** `/keywords`
- **内容:**
  - GSC連携による既存クエリ分析
  - キーワードギャップ分析（記事がないキーワード発見）
  - キーワードクラスタリング（ピラー/クラスター構造提案）
  - 優先度スコアリング（検索ボリューム×競合難易度×関連性）
  - 記事生成への自動連携

---

## 外部アプリ管理アーキテクチャ（Future Phase）

本サービスは「外部SaaSアプリ + WordPress」構成を採用。
以下の機能は将来的に実装予定。

### アーキテクチャのメリット

| メリット | 説明 |
|---------|------|
| **複数サイト一元管理** | 1つのダッシュボードで複数WordPressを管理可能 |
| **高度なワークフロー** | スケジューリング、承認フロー、チーム協業が容易 |
| **リッチなUI/UX** | WordPress管理画面の制約を受けない |
| **処理負荷の分離** | AI処理はSaaS側、WordPressは公開のみ |
| **セキュリティ** | WordPressにAPIキーを保存しない |

### G-10: Multi-Site Dashboard（複数サイト一元管理）
- **目的:** 複数のWordPressサイトを1つのダッシュボードで統合管理
- **管理画面:** `/sites`
- **内容:**
  - 全サイトの記事一覧・ステータス統合表示
  - サイト横断検索・フィルタリング
  - 一括操作（記事公開、下書き保存、削除）
  - サイト別パフォーマンス比較
  - サイトグループ機能（プロジェクト単位で整理）

### G-11: Team Collaboration（チーム協業・承認フロー）
- **目的:** 複数人でのコンテンツ制作・承認ワークフロー
- **管理画面:** `/team`, `/workflow`
- **内容:**
  - チームメンバー招待・権限管理（管理者/編集者/閲覧者）
  - 記事承認フロー（下書き→レビュー→承認→公開）
  - コメント・フィードバック機能
  - 通知設定（Slack/Discord/Email連携）
  - 監査ログ（誰が何をいつ変更したか）

### G-12: Advanced UI/UX（リッチUI）
- **目的:** WordPress管理画面の制約を超えた操作性
- **管理画面:** 全体
- **内容:**
  - ドラッグ&ドロップによる記事並び替え
  - リアルタイムプレビュー（編集しながら即座に確認）
  - カスタムダッシュボードウィジェット
  - ダークモード対応
  - キーボードショートカット
  - モバイル最適化

---

## 開発進行の原則

### 1. スタンドアローン優先
- 各ストリームを独立して動作検証可能な状態まで構築
- 依存関係を最小化し、並行開発を可能に

### 2. マーケティング並走
- 開発と並行してモックアップ・発信を継続
- 早期フィードバックを開発に反映

### 3. 段階的統合
- 各モジュールの動作確認後に統合
- 問題の切り分けを容易に

### 4. 過剰設計の回避
- 将来の仮定ではなく、現在の課題を解決
- 「動く最小限」を早期に実現

---

## 技術スタック概要

詳細は [00_Master_Architecture.md](./architecture/00_Master_Architecture.md) を参照。

### Stream A（記事生成）で使用
| レイヤー | 技術 |
|---------|------|
| AI | Gemini 3.0 Pro（LiteLLM経由） |
| Search | Tavily API, Firecrawl + Jina Reader |
| Runtime | Node.js / TypeScript |

### Stream W（WordPress）で使用
| レイヤー | 技術 |
|---------|------|
| VPS | Hetzner Cloud API |
| WordPress | Multisite + MariaDB |
| Automation | SSH + WP-CLI |

### Integration Phase で使用
| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 16+, Tailwind CSS v4, Shadcn/UI |
| Backend | Next.js API Routes, Prisma ORM |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Worker | Inngest |
| Storage | Cloudflare R2 |
| Payment | Stripe |
| Hosting | Vercel |

---

## 関連ドキュメント

### ストリーム別ドキュメント
- [Stream 01: Article Generation](../stream-01/docs/Stream01_ArticleGen.md) - 記事生成モジュール（完了）
- [Stream 02: WordPress Setup](../stream-02/docs/Stream02_Spec.md) - WordPressセットアップ（開発中）
- [Stream 12: LLM Selector](../stream-12/docs/Stream12_LLMSelector.md) - LLMセレクター（計画）
- [Stream 13: Marketing](../stream-13/docs/Stream13_Marketing.md) - マーケティング・発信

### 技術仕様書
- [Claude_Batch_API.md](./architecture/Claude_Batch_API.md) - Claude Batch API仕様
- [VPS_Provider_Selection.md](./architecture/VPS_Provider_Selection.md) - VPSプロバイダー選定

### アーカイブ（参照用）
<details>
<summary>旧ドキュメント（archive/phases-legacy, archive/architecture-legacy）</summary>

過去のPhase 0-15ドキュメントおよび旧アーキテクチャドキュメントは `docs/archive/` に移動しました。

</details>

### コンセプト・決定事項
- [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) - 全技術選定・ビジネス決定の記録
