# Argo Note - プロダクト仕様ドキュメント

> **"Your AI-Powered Blog. Fully Automated."**
> バイブコーディング時代の「放置OK」ブログ自動運用SaaS

---

## このリポジトリについて

このリポジトリは **Argo Note** のプロダクト仕様を定義・管理するためのドキュメントプロジェクトです。

### 目的

- プロダクトの設計・仕様を明確化
- 技術的な意思決定を記録
- 開発フェーズの計画を管理

### 注意事項

**このリポジトリは仕様定義のみを目的としています。実装コードは含まれません。**

---

## ドキュメント構成

```
docs/
├── README.md                 # 本ドキュメント（概要）
├── TASK_MANAGEMENT.md        # タスク管理
├── CONCEPT_DECISIONS.md      # 全決定事項の記録
├── DEVELOPMENT_ROADMAP.md    # 開発ロードマップ
│
├── architecture/             # 技術仕様書
│   ├── 00_Master_Architecture.md    # 全体アーキテクチャ
│   ├── 01_Frontend_Architecture.md  # フロントエンド仕様
│   ├── 02_Backend_Database.md       # バックエンド・DB仕様
│   ├── 03_Infrastructure_Ops.md     # インフラ・運用仕様
│   ├── 04_AI_Pipeline.md            # AIパイプライン仕様
│   ├── 05_Sequence_Diagrams.md      # シーケンス図
│   ├── 06_Multisite_feasibility.md  # Multisite採用検討
│   └── 07_WordPress_Multisite_Guide.md  # Multisite実装ガイド
│
└── phases/                   # 開発フェーズ詳細
    ├── Phase0_Mockup.md            # モックアップ・コンセプト検証
    ├── Phase0.5_MVPBranding.md     # MVP用ブランディング
    ├── Phase1_Infrastructure.md    # インフラ + 認証
    ├── Phase2_CoreAI.md            # AIコア機能
    ├── Phase3_UserInterface.md     # ユーザーインターフェース
    ├── Phase4_Automation.md        # 自動化（MVP必須）
    ├── Phase5_Monetization.md      # 収益化
    ├── Phase6_MVPLaunch.md         # MVPリリース
    ├── Phase7_Visual.md            # 画像生成
    ├── Phase8_CustomDomain.md      # 独自ドメイン
    ├── Phase9_SSO.md               # シームレスログイン
    ├── Phase10_GSCIntegration.md   # GSC連携
    ├── Phase11_HeadlessEvaluation.md # Headless化評価
    ├── Phase12_ModelSelection.md   # LLMモデル選択
    ├── Phase13_BrandIdentity.md    # ブランド進化
    ├── Phase14_ReferralProgram.md  # リファラルプログラム
    └── Phase15_PromptIntelligence.md # プロンプト効果分析
```

---

## クイックリンク

### 全体像を把握する

1. [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - フェーズ一覧と技術スタック
2. [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) - 全ての意思決定の記録
3. [00_Master_Architecture.md](./architecture/00_Master_Architecture.md) - 技術アーキテクチャ概要

### タスク管理

- [TASK_MANAGEMENT.md](./TASK_MANAGEMENT.md) - 進行中・完了タスクの管理

---

## プロジェクト概要

### ターゲット

**バイブコーディングでプロダクトを作った個人開発者**

- アプリは作れるが、集客方法がわからない
- SEO・ブログの書き方を学ぶ時間がない
- マーケティングより開発に集中したい

### 提供価値

> **「作ったアプリ、誰にも見つけてもらえない？ブログ集客をAIが全自動で。」**

- WordPressブログの自動セットアップ
- AI記事の自動生成・スケジュール投稿
- 完全自動運用（放置OK）

### 技術スタック（確定）

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Prisma ORM |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (PostgreSQL) + MariaDB (WP) |
| Worker | Inngest |
| AI | Gemini 3.0 Pro (LiteLLM経由) |
| WordPress | Multisite on DigitalOcean VPS |
| CDN/Security | Cloudflare |

---

## MVP期限

**2026年2月25日（1ヶ月）**

月額予算: $100以内

---

## 貢献・編集について

ドキュメントの編集・追加を行う際は、[TASK_MANAGEMENT.md](./TASK_MANAGEMENT.md) にタスクを登録してから作業を開始してください。
