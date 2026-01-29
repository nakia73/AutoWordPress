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

### 技術仕様書（Architecture）
- [00. マスターアーキテクチャ](./architecture/00_Master_Architecture.md)
- [01. フロントエンド](./architecture/01_Frontend_Architecture.md)
- [02. バックエンド・DB](./architecture/02_Backend_Database.md)
- [03. インフラ・運用](./architecture/03_Infrastructure_Ops.md)
- [04. AIパイプライン](./architecture/04_AI_Pipeline.md)
- [05. シーケンス図](./architecture/05_Sequence_Diagrams.md)

### ストリーム別フェーズ詳細
- [Stream M: Marketing](./phases/StreamM_Marketing.md) - マーケティング・発信
- [Stream A: Article Generation](./phases/StreamA_ArticleGen.md) - 記事生成モジュール
- [Stream W: WordPress Setup](./phases/StreamW_WordPress.md) - WordPressセットアップ
- [Integration: MVP](./phases/Integration_MVP.md) - 統合・MVPリリース

### 旧フェーズドキュメント（参照用）
<details>
<summary>Phase 0-15（旧構成）</summary>

- [Phase 0: Mockup](./phases/Phase0_Mockup.md)
- [Phase 0.5: MVP Branding](./phases/Phase0.5_MVPBranding.md)
- [Phase 1: Infrastructure](./phases/Phase1_Infrastructure.md)
- [Phase 2: Core AI](./phases/Phase2_CoreAI.md)
- [Phase 3: User Interface](./phases/Phase3_UserInterface.md)
- [Phase 4: Automation](./phases/Phase4_Automation.md)
- [Phase 5: Monetization](./phases/Phase5_Monetization.md)
- [Phase 6: MVP Launch](./phases/Phase6_MVPLaunch.md)
- [Phase 7-15: Growth](./phases/)

</details>

### コンセプト・決定事項
- [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) - 全技術選定・ビジネス決定の記録
