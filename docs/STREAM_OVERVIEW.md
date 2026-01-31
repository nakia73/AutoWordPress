# ストリーム概要 (Stream Overview)

> **上位ドキュメント:** [開発哲学](./DEVELOPMENT_PHILOSOPHY.md)
>
> 本ドキュメントは全ストリーム（モジュール）の一覧と開発計画を定義します。

---

## 用語定義

詳細な定義は [開発哲学 - 用語定義](./DEVELOPMENT_PHILOSOPHY.md#0-用語定義) を参照。

| 用語 | 定義 |
|------|------|
| **Stream** | 単一機能を開発・テストするためのスタンドアローンアプリケーション |
| **単体開発** | 各Streamをスタンドアローンで開発すること |
| **MVP** | 全Streamを統合した後の最小限プロダクト（単一Streamを指す言葉ではない） |

---

## 開発哲学の適用

すべてのストリームは [開発哲学](./DEVELOPMENT_PHILOSOPHY.md) に従い、以下の原則で開発します：

1. **統合を前提とした単体開発**: 各ストリームは独立ディレクトリで開発
2. **開発フロー**: 単体開発 → 単体テスト → 結合テスト → 統合
3. **スタブUI**: 開発者による目視確認用（統合時は含めない）
4. **コアロジックのみ統合**: `src/lib/` のみが `/app/` への統合対象
5. **各Streamは完全独立**: 他Streamに依存せず単独で動作確認可能

---

## ストリーム一覧

### フェーズ1: コア機能（MVP必須）

| ID | ストリーム名 | 役割 | ディレクトリ | 統合先 | 状態 |
|----|-------------|------|-------------|--------|------|
| **01** | Article Generation | AI記事生成エンジン | `/stream-01/` | `/app/src/lib/ai/` | ✅ 完了 |
| **02** | WordPress Setup | WordPress Multisite管理 | `/stream-02/` | `/app/src/lib/wordpress/` | ✅ 分離完了 |
| **03** | User/Auth | 認証・ユーザー管理 | `/stream-03/` | `/app/src/lib/auth/` | 📋 計画 |
| **04** | Integration | 01↔02結合ワークフロー | `/stream-04/` | `/app/src/lib/workflow/` | 📋 計画 |
| **05** | Scheduling | 自動化・スケジューリング | `/stream-05/` | `/app/src/lib/scheduler/` | 📋 計画 |
| **06** | Payment | Stripe決済・課金 | `/stream-06/` | `/app/src/lib/payment/` | 📋 計画 |

### フェーズ2: 成長機能（MVP後）

| ID | ストリーム名 | 役割 | ディレクトリ | 統合先 | 優先度 |
|----|-------------|------|-------------|--------|--------|
| **07** | Rewrite | 記事リライト・自動更新 | `/stream-07/` | `/app/src/lib/rewrite/` | **最高** |
| **08** | GSC | Google Search Console連携 | `/stream-08/` | `/app/src/lib/gsc/` | 高 |
| **09** | Keywords | キーワード分析・提案 | `/stream-09/` | `/app/src/lib/keywords/` | 高 |
| **10** | Trace | 文体トレース・模倣 | `/stream-10/` | `/app/src/lib/trace/` | 中 |
| **11** | Domain | 独自ドメイン管理 | `/stream-11/` | `/app/src/lib/domain/` | 中 |
| **12** | LLM Selector | モデル選択・切り替え | `/stream-12/` | `/app/src/lib/llm/` | 低 |

### フェーズ3: 外部アプリ管理機能（将来）

| ID | ストリーム名 | 役割 | ディレクトリ | 統合先 | 優先度 |
|----|-------------|------|-------------|--------|--------|
| **14** | Multi-Site | 複数WP一元管理ダッシュボード | `/stream-14/` | `/app/src/lib/multisite/` | 中 |
| **15** | Team | チーム協業・承認フロー | `/stream-15/` | `/app/src/lib/team/` | 中 |
| **16** | Advanced UI | リッチUI/UX拡張 | `/stream-16/` | `/app/src/components/` | 低 |

### 継続: マーケティング

| ID | ストリーム名 | 役割 | ディレクトリ | 備考 |
|----|-------------|------|-------------|------|
| **13** | Marketing | LP・SNS・コンセプト検証 | `/stream-13/` | 独立運用（統合しない） |

---

## ストリーム詳細

### Stream 01: Article Generation ✅ 完了

**目的**: AI記事生成エンジン

**コアモジュール**:
- `article-generator.ts` - 記事生成メインロジック
- `llm-client.ts` - LLM APIクライアント
- `tavily-client.ts` - セマンティック検索
- `image-generator.ts` - 画像生成
- `section-image-service.ts` - セクション画像処理

**出力**: 記事HTML + メタデータJSON + 画像

**詳細**: [Stream01_ArticleGen.md](../stream-01/docs/Stream01_ArticleGen.md)

---

### Stream 02: WordPress Setup ✅ 分離完了

**テスト目的**: WordPressがセットアップでき、記事投稿機能が動作するか

**責務範囲**:
1. VPSプロビジョニング（Hetzner API）
2. OS基盤設定（Nginx, PHP-FPM, MariaDB）
3. WordPressインストール
4. Multisite有効化
5. サブサイト作成
6. 認証情報発行（Application Password）
7. **記事投稿機能の動作確認（Mockデータ使用）**

**コアモジュール**:
- `ssh-client.ts` - SSH接続
- `wp-cli.ts` - WP-CLI実行
- `site-manager.ts` - サイト作成・認証情報発行
- `article-publisher.ts` - 記事投稿ロジック
- `mock-data.ts` - テスト用Mockデータ
- `hetzner-client.ts` - Hetzner Cloud API（計画）
- `provisioner.ts` - VPSプロビジョニング（計画）

**出力**: 構築済みWordPress環境 + 認証情報 + 投稿済みテスト記事

**責務外（他Streamの責務）**:
- 記事生成 → Stream01
- Stream01の出力を使った投稿 → Stream04

**詳細**: [Stream02_Spec.md](../stream-02/docs/Stream02_Spec.md) | [Stream02_WordPress.md](../stream-02/docs/Stream02_WordPress.md)

---

### Stream 03: User/Auth 📋 計画

**目的**: 認証・ユーザー管理・権限制御

**コアモジュール（予定）**:
- `auth-provider.ts` - Supabase Auth ラッパー
- `user-service.ts` - ユーザーCRUD
- `site-binding.ts` - ユーザー↔サイト紐付け
- `permission.ts` - 権限チェック

**依存**: Supabase Auth

**出力**: 認証済みユーザー情報、セッション管理

---

### Stream 04: Integration 📋 計画

**テスト目的**: Stream01とStream02を連携させて**実記事**が投稿できるか

**責務範囲**:
- Stream01で生成した**実記事**をStream02で構築したWordPressに投稿
- ワークフロー制御（生成→投稿の一連の流れ）
- エラーハンドリング・リトライ

**Stream02との違い**:
| 項目 | Stream02 | Stream04 |
|------|---------|---------|
| テストデータ | Mockデータ | Stream01の実出力 |
| 目的 | 投稿機能の動作確認 | 生成〜投稿の結合確認 |

**コアモジュール（予定）**:
- `generate-and-post.ts` - 記事生成→投稿フロー
- `workflow-orchestrator.ts` - ワークフロー制御
- `error-handler.ts` - エラーハンドリング・リトライ
- `progress-tracker.ts` - 進捗追跡

**注意**: `article-publisher.ts` はStream02に実装済み。Stream04はそれを利用する。

**依存**: Stream 01（記事生成）, Stream 02（WordPress環境 + 記事投稿機能）, Stream 05

**入力**: Stream01出力（実記事）+ Stream02出力（WordPress認証情報）

**出力**: 投稿済み記事URL

---

### Stream 05: Scheduling 📋 計画

**目的**: 定期記事生成・タスクスケジューリング

**コアモジュール（予定）**:
- `inngest-client.ts` - Inngestラッパー
- `schedule-service.ts` - スケジュール管理
- `job-queue.ts` - ジョブキュー
- `notification-service.ts` - 完了通知

**依存**: Inngest

**出力**: スケジュール実行、通知

---

### Stream 06: Payment 📋 計画

**目的**: Stripe決済・サブスクリプション管理

**コアモジュール（予定）**:
- `stripe-client.ts` - Stripe APIクライアント
- `subscription-service.ts` - サブスク管理
- `usage-tracker.ts` - 使用量追跡
- `billing-service.ts` - 請求処理

**依存**: Stripe SDK

**出力**: 決済処理、プラン制限チェック

---

### Stream 07: Rewrite ★最高優先度 📋 計画

**目的**: 投稿済み記事の自動更新・最新化

**コアモジュール（予定）**:
- `rewrite-analyzer.ts` - リライト必要性分析
- `diff-generator.ts` - 差分生成
- `update-scheduler.ts` - 更新スケジューリング
- `version-manager.ts` - バージョン管理

**依存**: Stream 01, Stream 08

**出力**: リライト済み記事、差分レポート

**詳細**: [DEVELOPMENT_ROADMAP.md#記事リライト機能](./DEVELOPMENT_ROADMAP.md)

---

### Stream 08: GSC 📋 計画

**目的**: Google Search Console連携・パフォーマンスデータ取得

**コアモジュール（予定）**:
- `gsc-client.ts` - GSC APIクライアント
- `performance-fetcher.ts` - パフォーマンスデータ取得
- `ranking-tracker.ts` - 順位追跡
- `alert-service.ts` - 順位低下アラート

**依存**: Google Search Console API

**出力**: 検索パフォーマンスデータ、アラート

---

### Stream 09: Keywords 📋 計画

**目的**: キーワード分析・優先度スコアリング・提案

**コアモジュール（予定）**:
- `keyword-analyzer.ts` - キーワード分析
- `gap-finder.ts` - ギャップ分析
- `clustering.ts` - クラスタリング
- `priority-scorer.ts` - 優先度計算

**依存**: Stream 08 (GSC データ)

**出力**: キーワード提案リスト、優先度スコア

---

### Stream 10: Trace 📋 計画

**目的**: 特定文章の文体を解析・模倣

**コアモジュール（予定）**:
- `style-analyzer.ts` - 文体解析
- `style-profile.ts` - スタイルプロファイル管理
- `style-applicator.ts` - スタイル適用
- `trace-registry.ts` - トレースアセット管理

**依存**: なし（完全独立）

**出力**: スタイルプロファイル、適用済みプロンプト

---

### Stream 11: Domain 📋 計画

**目的**: 独自ドメイン接続・SSL自動発行

**コアモジュール（予定）**:
- `domain-manager.ts` - ドメイン管理
- `dns-configurator.ts` - DNS設定
- `ssl-provisioner.ts` - SSL証明書発行
- `cloudflare-client.ts` - Cloudflare API

**依存**: Cloudflare API

**出力**: ドメイン設定、SSL証明書

---

### Stream 12: LLM Selector 📋 計画

**目的**: ユーザーによるLLMモデル選択・切り替え

**コアモジュール（予定）**:
- `model-registry.ts` - モデル一覧管理
- `model-selector.ts` - モデル選択UI用ロジック
- `cost-calculator.ts` - コスト計算
- `performance-comparator.ts` - 性能比較

**依存**: Stream 01 (LLM Client)

**出力**: 選択されたモデル設定

**備考**: 一部は Stream 01 に既に実装済み（ModelSelector コンポーネント）

**詳細**: [Stream12_LLMSelector.md](../stream-12/docs/Stream12_LLMSelector.md)

---

### Stream 14: Multi-Site 📋 計画

**目的**: 複数WordPressサイトの一元管理

**コアモジュール（予定）**:
- `multisite-dashboard.ts` - 統合ダッシュボード
- `site-aggregator.ts` - 全サイトデータ集約
- `bulk-operations.ts` - 一括操作
- `site-groups.ts` - サイトグループ管理

**依存**: Stream 02, Stream 03

**出力**: 統合サイト一覧、クロスサイト検索、一括操作

**外部アプリ管理のメリット**:
- 1つのダッシュボードで複数WordPress管理
- WordPress管理画面へのログイン不要
- サイト横断での記事・パフォーマンス比較

---

### Stream 15: Team 📋 計画

**目的**: チーム協業・承認フロー・権限管理

**コアモジュール（予定）**:
- `team-service.ts` - チームメンバー管理
- `permission-service.ts` - 権限制御
- `workflow-engine.ts` - 承認フローエンジン
- `audit-log.ts` - 監査ログ
- `notification-hub.ts` - 通知ハブ（Slack/Discord/Email）

**依存**: Stream 03

**出力**: 承認フロー、権限チェック、監査ログ

**外部アプリ管理のメリット**:
- スケジューリング・承認フローをSaaS側で完結
- WordPressの権限管理に依存しない柔軟な設計
- 外部ツール連携（Slack通知等）

---

### Stream 16: Advanced UI 📋 計画

**目的**: WordPress管理画面の制約を超えたリッチUI/UX

**コアモジュール（予定）**:
- `drag-drop.ts` - ドラッグ&ドロップ操作
- `realtime-preview.ts` - リアルタイムプレビュー
- `keyboard-shortcuts.ts` - キーボードショートカット
- `dashboard-widgets.ts` - カスタムウィジェット
- `theme-service.ts` - ダークモード等テーマ管理

**依存**: なし（UIコンポーネント）

**出力**: 高度なUI操作、カスタマイズ可能なダッシュボード

**外部アプリ管理のメリット**:
- WordPress管理画面の制約を受けない自由なUI設計
- AI処理はSaaS側、WordPressは公開のみ（処理負荷分離）
- WordPressにAPIキーを保存しない（セキュリティ向上）

---

### Stream 13: Marketing 📋 継続

**目的**: LP・SNS発信・コンセプト検証

**内容**:
- モックアップ作成
- SNS発信
- LP公開・Waitlist
- ブランディング

**備考**: 独立運用（`/app/` に統合しない）

**詳細**: [Stream13_Marketing.md](../stream-13/docs/Stream13_Marketing.md)

---

## 開発優先順位

### MVP必須（Phase 1）

```
1. Stream 01 ✅ 完了
2. Stream 02 ✅ 分離完了（実装進行中）
3. Stream 03 - 認証・ユーザー管理
4. Stream 04 - 01↔02統合ワークフロー
5. Stream 05 - スケジューリング
6. Stream 06 - 決済
```

### MVP後（Phase 2）

```
1. Stream 07 - 記事リライト ★最高優先度
2. Stream 08 - GSC連携
3. Stream 09 - キーワード分析
4. Stream 10 - 文体トレース
5. Stream 11 - 独自ドメイン
6. Stream 12 - LLMセレクター
```

---

## ディレクトリ構造（最終形）

```
/Users/apple/Dev/Autoblog/
├── app/                  # 統合本番アプリケーション
│   └── src/lib/
│       ├── ai/           ← Stream 01 統合
│       ├── wordpress/    ← Stream 02 統合
│       ├── auth/         ← Stream 03 統合
│       ├── workflow/     ← Stream 04 統合
│       ├── scheduler/    ← Stream 05 統合
│       ├── payment/      ← Stream 06 統合
│       ├── rewrite/      ← Stream 07 統合
│       ├── gsc/          ← Stream 08 統合
│       ├── keywords/     ← Stream 09 統合
│       ├── trace/        ← Stream 10 統合
│       ├── domain/       ← Stream 11 統合
│       └── llm/          ← Stream 12 統合
│
├── stream-01/            # ✅ 完了
├── stream-02/            # ✅ 分離完了
├── stream-03/            # 📋 計画
├── stream-04/            # 📋 計画
├── stream-05/            # 📋 計画
├── stream-06/            # 📋 計画
├── stream-07/            # 📋 計画
├── stream-08/            # 📋 計画
├── stream-09/            # 📋 計画
├── stream-10/            # 📋 計画
├── stream-11/            # 📋 計画
├── stream-12/            # 📋 計画
├── stream-13/            # マーケティング（独立運用）
├── stream-14/            # 📋 計画（Multi-Site）
├── stream-15/            # 📋 計画（Team）
├── stream-16/            # 📋 計画（Advanced UI）
│
└── docs/                 # ドキュメント
```

---

## 改訂履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-30 | Stream02に記事投稿機能（Mockデータ使用）を追加。Stream04は実記事投稿に特化 |
| 2026-01-30 | 用語定義追加。Stream02/04の責務範囲を明確化 |
| 2026-01-30 | ストリーム番号体系をアルファベットから数字に変更 |
| 2026-01-30 | 初版作成。全ストリームの一覧と計画を定義 |
