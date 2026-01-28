# Argo Note - 開発ロードマップ

> **サービスコンセプト:** "Your AI-Powered Blog. Fully Automated."
> バイブコーディング時代の「放置OK」ブログ自動運用SaaS
>
> **MVP期限:** 2026年2月25日（1ヶ月）
> **月額予算:** $100以内

---

## ドキュメント構成

本プロジェクトのドキュメントは以下の構造で管理されています。

```
docs/
├── DEVELOPMENT_ROADMAP.md    # 本ドキュメント（開発全体の俯瞰）
├── architecture/             # 技術仕様書（HOW）
│   ├── 00_Master_Architecture.md   # アーキテクチャ全体概要
│   ├── 01_Frontend_Architecture.md # フロントエンド仕様
│   ├── 02_Backend_Database.md      # バックエンド・DB仕様
│   ├── 03_Infrastructure_Ops.md    # インフラ・運用仕様
│   ├── 04_AI_Pipeline.md           # AI処理パイプライン仕様
│   ├── 05_Sequence_Diagrams.md     # システムシーケンス図
│   ├── 06_Multisite_feasibility.md # Multisite採用検討
│   ├── 07_WordPress_Multisite_Guide.md # Multisite実装ガイド
│   ├── 08_Integration_Risk_Report.md  # 整合性リスクレポート
│   ├── 09_Critical_Issues_Report.md   # 致命的問題点レポート（10イテレーション）
│   └── 10_Comprehensive_Critical_Issues_Report.md  # 包括的問題点レポート（50イテレーション）
└── phases/                   # 開発フェーズ詳細（WHAT & WHEN）
    ├── Phase0_Mockup.md      # モックアップ・集客
    ├── Phase1_Infrastructure.md  # インフラ基盤構築
    ├── ...
    └── Phase15_PromptIntelligence.md
```

**ドキュメントの役割:**
- **architecture/**: 技術的な「どう作るか」を定義（仕様書）
- **phases/**: ビジネス的な「何をいつ作るか」を定義（計画書）

---

## フェーズ一覧

### MVP開発フェーズ（Phase 0-6）【1ヶ月で完了目標】

| Phase | 名称 | テーマ | 概要 | Week |
|-------|------|--------|------|------|
| [Phase 0](./phases/Phase0_Mockup.md) | Mockup | Visualization | SNSデモ動画でコンセプト反応検証 | Week 1前半 |
| [Phase 0.5](./phases/Phase0.5_MVPBranding.md) | MVP Branding | Identity | ロゴ・アイコン作成、正式LP公開 | Week 1前半 |
| [Phase 1](./phases/Phase1_Infrastructure.md) | Infrastructure + Auth | Foundation | VPS・SSL・Multisite・**認証基盤（Supabase Auth）** | Week 1 |
| [Phase 2](./phases/Phase2_CoreAI.md) | Core AI | Intelligent Engine | プロダクト分析・記事生成・WordPress投稿 | Week 2 |
| [Phase 3](./phases/Phase3_UserInterface.md) | User Interface | Onboarding & Control | オンボーディング・ダッシュボード | Week 3 |
| [Phase 4](./phases/Phase4_Automation.md) | Automation | Hands-Free | **スケジュール自動化・通知（MVP必須）** | Week 3 |
| [Phase 5](./phases/Phase5_Monetization.md) | Monetization | Sustainability | Stripe決済・サブスクリプション管理 | Week 4 |
| [Phase 6](./phases/Phase6_MVPLaunch.md) | MVP Launch | Validation | ベータリリース・フィードバック収集 | Week 4 |
| Phase 6.1 | UI Upgrade | Polish | MockupのリッチUIデザインをAppに移植 | Week 4+ |

### 成長フェーズ（Phase 7-15）【ベータフィードバック後】

| Phase | 名称 | テーマ | 概要 |
|-------|------|--------|------|
| [Phase 7](./phases/Phase7_Visual.md) | Visual | Visual Appeal | AI画像生成（Nanobana Pro）|
| [Phase 8](./phases/Phase8_CustomDomain.md) | Custom Domain | Brand Identity | 独自ドメイン接続・SSL自動発行 |
| [Phase 9](./phases/Phase9_SSO.md) | SSO | Seamless Experience | ダッシュボード→WP管理画面のシームレスログイン |
| [Phase 10](./phases/Phase10_GSCIntegration.md) | GSC Integration | Optimization | Google Search Console連携・AI自律改善 |
| [Phase 11](./phases/Phase11_HeadlessEvaluation.md) | Headless Evaluation | Evolution | Headless WordPress化の妥当性評価 |
| [Phase 12](./phases/Phase12_ModelSelection.md) | Model Selection | Flexibility | ユーザーによるLLMモデル選択機能 |
| [Phase 13](./phases/Phase13_BrandIdentity.md) | Brand Evolution | Refinement | ブランド洗練・ガイドライン策定・グッズ連携 |
| [Phase 14](./phases/Phase14_ReferralProgram.md) | Referral Program | Growth | リファラルプログラム実装 |
| [Phase 15](./phases/Phase15_PromptIntelligence.md) | Prompt Intelligence | Analytics | プロンプトトレーサビリティ・効果分析・A/Bテスト |

---

## 開発進行の原則

### 1. MVP First
- Phase 0〜6 を最優先で完了
- 「動く最小限」を早期にユーザーへ提供

### 2. フィードバック駆動
- Phase 6以降はベータユーザーのフィードバックに基づき優先度決定
- 「欲しい声が多い機能」から実装

### 3. 過剰設計の回避
- 将来の仮定ではなく、現在の課題を解決
- Phase 11（Headless化）は「必要になったら」検討

---

## 技術スタック概要（確定版）

詳細は [00_Master_Architecture.md](./architecture/00_Master_Architecture.md) および [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) を参照。

| レイヤー | 技術 | 備考 |
|---------|------|------|
| Frontend | Next.js 16+, TypeScript, Tailwind CSS v4, Shadcn/UI, Framer Motion | |
| Backend | Next.js API Routes, Prisma ORM | |
| Auth | **Supabase Auth** | Google OAuth対応 |
| Database | **Supabase (PostgreSQL)** + MariaDB (WP) | 2DB構成 |
| Worker | **Inngest** | 長時間処理・自動リトライ |
| AI | **Gemini 3.0 Pro** | LiteLLMプロキシ経由、ソフトコーディング |
| Search | Tavily API, **Firecrawl + Jina Reader** | |
| Image | Nanobana Pro | |
| Storage | **Cloudflare R2** | エグレス無料 |
| Payment | Stripe | |
| Hosting | Vercel (App), **Hetzner VPS** (WordPress) | |
| Monitoring | **UptimeRobot, Sentry, PostHog** | |
| CDN/Security | Cloudflare | |

---

## スケーリングロードマップ

詳細は [03_Infrastructure_Ops.md](./architecture/03_Infrastructure_Ops.md) を参照。

| フェーズ | ユーザー規模 | 構成 |
|---------|-------------|------|
| MVP | 0-100社 | Single VPS ($24/mo) |
| Growth | 100-500社 | Vertical Scaling ($48-96/mo) |
| Scale | 500社+ | Horizontal Scaling (Multi-VPS) |

---

## 関連ドキュメント

### 技術仕様書（Architecture）
- [00. マスターアーキテクチャ](./architecture/00_Master_Architecture.md) - 全体設計方針
- [01. フロントエンド](./architecture/01_Frontend_Architecture.md) - UI/UX、技術スタック
- [02. バックエンド・DB](./architecture/02_Backend_Database.md) - API設計、データモデル
- [03. インフラ・運用](./architecture/03_Infrastructure_Ops.md) - VPS、WordPress Multisite
- [04. AIパイプライン](./architecture/04_AI_Pipeline.md) - 記事生成フロー、LLM戦略
- [05. シーケンス図](./architecture/05_Sequence_Diagrams.md) - 処理フロー詳細
- [06. Multisite検討](./architecture/06_Multisite_feasibility.md) - アーキテクチャ決定根拠
- [07. Multisiteガイド](./architecture/07_WordPress_Multisite_Guide.md) - 実装詳細・セキュリティ設計
- [08. 整合性リスクレポート](./architecture/08_Integration_Risk_Report.md) - 仕様間の整合性分析
- [09. 致命的問題点レポート](./architecture/09_Critical_Issues_Report.md) - First Principles分析結果（10イテレーション）
- [10. 包括的問題点レポート](./architecture/10_Comprehensive_Critical_Issues_Report.md) - First Principles分析結果（50イテレーション）

### 開発フェーズ詳細（Phases）

**MVP（1ヶ月）:**
- [Phase 0: Mockup](./phases/Phase0_Mockup.md) - SNSデモ動画・コンセプト検証
- [Phase 0.5: MVP Branding](./phases/Phase0.5_MVPBranding.md) - ロゴ・アイコン・正式LP
- [Phase 1: Infrastructure + Auth](./phases/Phase1_Infrastructure.md) - インフラ基盤・認証
- [Phase 2: Core AI](./phases/Phase2_CoreAI.md) - AIコア機能
- [Phase 3: User Interface](./phases/Phase3_UserInterface.md) - ユーザーインターフェース
- [Phase 4: Automation](./phases/Phase4_Automation.md) - スケジュール自動化（MVP必須）
- [Phase 5: Monetization](./phases/Phase5_Monetization.md) - 収益化
- [Phase 6: MVP Launch](./phases/Phase6_MVPLaunch.md) - MVPリリース
- **Phase 6.1: UI Upgrade** (✅ 2026-01-27 完了) - リッチUIデザイン移植

**成長フェーズ:**
- [Phase 7: Visual](./phases/Phase7_Visual.md) - 画像自動生成
- [Phase 8: Custom Domain](./phases/Phase8_CustomDomain.md) - 独自ドメイン
- [Phase 9: SSO](./phases/Phase9_SSO.md) - シームレスログイン
- [Phase 10: GSC Integration](./phases/Phase10_GSCIntegration.md) - Search Console連携
- [Phase 11: Headless Evaluation](./phases/Phase11_HeadlessEvaluation.md) - Headless化評価
- [Phase 12: Model Selection](./phases/Phase12_ModelSelection.md) - LLMモデル選択機能
- [Phase 13: Brand Evolution](./phases/Phase13_BrandIdentity.md) - ブランド洗練・ガイドライン策定
- [Phase 14: Referral Program](./phases/Phase14_ReferralProgram.md) - リファラルプログラム
- [Phase 15: Prompt Intelligence](./phases/Phase15_PromptIntelligence.md) - プロンプト効果分析・A/Bテスト

### コンセプト・決定事項
- [CONCEPT_DECISIONS.md](./CONCEPT_DECISIONS.md) - 全技術選定・ビジネス決定の記録
