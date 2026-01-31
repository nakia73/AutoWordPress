# Stream 02: WP-CLI Agent 要件定義書

> **上位ドキュメント:** [Stream02_Spec.md](./Stream02_Spec.md)
>
> **サービス名:** Argo Note
> **モジュール名:** WP-CLI Agent
> **最終更新:** 2026-01-30
> **バージョン:** 1.1

---

## 1. 概要

### 1.1 目的

自然言語によるWordPress操作を実現するAIエージェントモジュール。
Anthropic SDK（Tool Use）とWP-CLIを連携し、ユーザーの指示をWordPress操作に変換・実行する。

### 1.2 スコープ

| 範囲内 | 範囲外 |
|--------|--------|
| WP-CLIコマンドの実行 | WordPress REST API操作（別モジュール） |
| 自然言語→コマンド変換 | 記事コンテンツの生成（Stream01の責務） |
| SSH経由のリモート実行 | VPSプロビジョニング（別モジュール） |
| ローカル実行（開発用） | ユーザー認証（Stream03の責務） |

### 1.3 ユースケース

```
┌─────────────────────────────────────────────────────────────────┐
│                        ユースケース図                            │
└─────────────────────────────────────────────────────────────────┘

  ┌─────────┐
  │  User   │
  └────┬────┘
       │
       │ 「下書きの投稿を一覧で見せて」
       │ 「ID 45の記事を明日9時に予約公開して」
       │ 「新しいカテゴリ『AI活用』を作成して」
       ▼
  ┌─────────────────────────────────────────┐
  │            WP-CLI Agent                 │
  │                                         │
  │  UC-1: WordPress情報の取得              │
  │  UC-2: コンテンツの作成・更新・削除      │
  │  UC-3: サイト設定の変更                 │
  │  UC-4: プラグイン/テーマの管理          │
  │  UC-5: ユーザー管理                     │
  │  UC-6: マルチサイト操作                 │
  └─────────────────────────────────────────┘
```

---

## 2. 機能要件

### 2.1 コア機能

#### FR-1: 自然言語コマンド変換

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-1.1 | 日本語の自然言語入力を受け付ける | 必須 |
| FR-1.2 | Anthropic API（Claude）を使用してWP-CLIコマンドに変換する | 必須 |
| FR-1.3 | 複数ステップの操作を自動的に分解・実行する | 必須 |
| FR-1.4 | 曖昧な指示に対して確認を求める | 必須 |

**FR-1.4 確認を求めるケースの定義:**

| ケース | 例 | エージェントの応答 |
|--------|-----|------------------|
| **対象が特定できない** | 「記事を削除して」 | 「どの記事を削除しますか？ID または タイトルを教えてください」 |
| **複数候補がある** | 「flavorテーマに変えて」 | 「flavor-flavor-flavor、flavor-flavor、flavorテーマがあります。どれですか？」 |
| **破壊的操作** | 「全部削除して」 | 「本当に全ての○○を削除しますか？この操作は取り消せません」 |
| **必須パラメータ不足** | 「投稿作成して」 | 「タイトルと本文を教えてください」 |
| **曖昧な範囲指定** | 「古い記事を整理して」 | 「どのくらい古い記事を対象にしますか？（例：1年以上前）」 |

#### FR-2: WP-CLIコマンド実行

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-2.1 | SSH経由でリモートWordPressサーバーに接続する | 必須 |
| FR-2.2 | WP-CLIコマンドを実行し結果を取得する | 必須 |
| FR-2.3 | ローカル環境での直接実行をサポートする | 任意 |
| FR-2.4 | コマンド実行のタイムアウトを設定可能にする | 必須 |

#### FR-3: 対応WP-CLI操作

| カテゴリ | コマンド例 | 優先度 |
|---------|-----------|--------|
| **投稿操作** | post list, post create, post update, post delete | 必須 |
| **ページ操作** | page list, page create, page update | 必須 |
| **メディア操作** | media list, media import | 必須 |
| **カテゴリ/タグ** | term list, term create | 必須 |
| **テーマ操作** | theme list, theme activate, theme install | 必須 |
| **プラグイン操作** | plugin list, plugin activate, plugin install | 必須 |
| **ユーザー操作** | user list, user create | 任意 |
| **設定操作** | option get, option update | 任意 |
| **マルチサイト** | site list, site create | 必須 |
| **キャッシュ** | cache flush, rewrite flush | 任意 |

#### FR-4: エージェントループ

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-4.1 | Tool Use応答を受け取りコマンドを実行する | 必須 |
| FR-4.2 | 実行結果をClaudeに返却し次のアクションを決定させる | 必須 |
| FR-4.3 | end_turnまでループを継続する | 必須 |
| FR-4.4 | 最大ループ回数を設定可能にする | 必須 |

---

### 2.2 セキュリティ機能

#### FR-5: コマンドフィルタリング

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-5.1 | 危険なコマンドをブロックする | 必須 |
| FR-5.2 | 許可リスト/拒否リストを設定可能にする | 任意 |
| FR-5.3 | 破壊的操作の前に確認を求める | 必須 |

**FR-5.1 ブロック対象コマンドパターン:**

| カテゴリ | パターン | 理由 |
|---------|---------|------|
| **データベース破壊** | `db drop` | データベース全削除 |
| | `db reset` | データベースリセット |
| | `db query` | 任意SQL実行（情報漏洩・改ざんリスク） |
| | `db export` | データベースダンプ（情報漏洩リスク） |
| **サイト破壊** | `site empty` | サイト全削除 |
| | `search-replace --all-tables` | 全テーブル置換（破壊リスク） |
| **コード実行** | `eval` | 任意コード実行 |
| | `shell` | シェルアクセス |
| **設定改ざん** | `config` | wp-config.php操作 |
| | `core update` | コアアップデート（意図しない破壊） |
| **シェルインジェクション** | `;` | コマンド連結（セミコロン） |
| | `&&` | コマンド連結（AND） |
| | `\|\|` | コマンド連結（OR） |
| | `\|` | パイプ |
| | `` ` `` | バッククォート実行 |
| | `$(` | コマンド置換 |
| **リダイレクト** | `>` | ファイル上書き |
| | `>>` | ファイル追記 |
| | `<` | 入力リダイレクト |

**FR-5.3 破壊的操作の定義:**

| 操作種別 | コマンド例 | 確認メッセージ |
|---------|-----------|---------------|
| **削除系** | `post delete`, `page delete`, `user delete`, `term delete`, `media delete` | 「○○を削除します。よろしいですか？」 |
| **一括操作** | `--all` フラグを含む操作 | 「全ての○○に対して操作を実行します。よろしいですか？」 |
| **状態変更** | `theme activate`, `plugin deactivate` | 「テーマ/プラグインを変更します。サイト表示に影響する可能性があります」 |
| **設定変更** | `option update`（重要キー） | 「サイト設定を変更します。よろしいですか？」 |

**重要設定キー（option update時に確認必須）:**
- `siteurl`, `home` - サイトURL
- `blogname`, `blogdescription` - サイト名・説明
- `users_can_register` - ユーザー登録設定
- `default_role` - デフォルトユーザー権限
- `permalink_structure` - パーマリンク構造

#### FR-6: 認証・認可

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-6.1 | SSH公開鍵認証をサポートする | 必須 |
| FR-6.2 | SSH秘密鍵をセキュアに管理する | 必須 |
| FR-6.3 | Anthropic APIキーをセキュアに管理する | 必須 |

**FR-6.2 SSH秘密鍵管理方式（選択肢）:**

| 方式 | 環境変数 | セキュリティ | 推奨環境 |
|------|---------|-------------|---------|
| **A: ファイルパス指定** | `VPS_SSH_KEY_PATH=/path/to/key` | 中 | 開発環境 |
| **B: AWS Secrets Manager** | `VPS_SSH_KEY_SECRET_ARN=arn:aws:...` | 高 | AWS本番環境 |
| **C: GCP Secret Manager** | `VPS_SSH_KEY_SECRET_ID=projects/...` | 高 | GCP本番環境 |
| **D: HashiCorp Vault** | `VPS_SSH_KEY_VAULT_PATH=secret/ssh/vps` | 高 | エンタープライズ |
| **E: 環境変数（Base64）** | `VPS_SSH_PRIVATE_KEY=base64...` | 低 | 非推奨（CI/CD一時利用のみ） |

**本番環境では方式B/C/Dのいずれかを必須とする。**

---

### 2.3 ユーザー体験

#### FR-7: 応答フォーマット

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-7.1 | 実行結果を人間が読みやすい形式で返す | 必須 |
| FR-7.2 | JSON出力を整形して表示する | 必須 |
| FR-7.3 | エラー時は原因と対処法を説明する | 必須 |
| FR-7.4 | 日本語で応答する | 必須 |

---

## 3. 非機能要件

### 3.1 性能要件

| ID | 要件 | 基準値 |
|----|------|--------|
| NFR-1.1 | コマンド実行タイムアウト | 60秒 |
| NFR-1.2 | エージェントループ最大回数 | 10回 |
| NFR-1.3 | SSH接続タイムアウト | 30秒 |
| NFR-1.4 | API応答時間（目標） | 5秒以内 |
| NFR-1.5 | 出力バッファサイズ上限 | 10MB |

### 3.2 レート制限

| 制限対象 | 制限値 | 理由 |
|---------|--------|------|
| Anthropic API | 60 req/min | API制限対応 |
| SSH接続 | 5 concurrent | サーバー負荷軽減 |
| コマンド実行 | 10 cmd/min/user | 過負荷防止 |

### 3.3 信頼性要件

| ID | 要件 |
|----|------|
| NFR-2.1 | SSH接続失敗時のリトライ（最大3回） |
| NFR-2.2 | API呼び出し失敗時のリトライ（最大3回、指数バックオフ） |
| NFR-2.3 | エラー発生時のグレースフルデグレード |

**NFR-2.2 リトライ戦略詳細:**

| 回数 | 待機時間 | 対象エラー |
|------|---------|-----------|
| 1回目 | 1秒 | 5xx エラー、タイムアウト、ネットワークエラー |
| 2回目 | 2秒 | 同上 |
| 3回目 | 4秒 | 同上 |
| リトライなし | - | 4xx エラー（認証エラー、不正リクエスト等） |

### 3.4 保守性要件

| ID | 要件 |
|----|------|
| NFR-3.1 | ログ出力（実行コマンド、結果、エラー） |
| NFR-3.2 | 設定の外部化（環境変数） |
| NFR-3.3 | テスタビリティ（モック可能な設計） |

### 3.5 セキュリティ要件

| ID | 要件 |
|----|------|
| NFR-4.1 | 秘密情報をログに出力しない |
| NFR-4.2 | コマンドインジェクション対策 |
| NFR-4.3 | SSH接続の暗号化 |
| NFR-4.4 | APIキーの安全な保管 |

---

## 4. インターフェース仕様

### 4.1 入力インターフェース

#### 4.1.1 エージェント呼び出し

```typescript
interface AgentInput {
  /** ユーザーからの自然言語指示 */
  message: string;

  /** マルチサイト設定 */
  multisite?: {
    /** 対象サイトID */
    siteId?: number;
    /** 対象サイトURL */
    siteUrl?: string;
    /** ネットワーク全体を対象にするか（管理者権限必須） */
    networkWide?: boolean;
  };

  /** オプション: 会話履歴（継続会話用） */
  conversationHistory?: Message[];

  /** オプション: 最大ループ回数（デフォルト: 10） */
  maxIterations?: number;

  /** オプション: 破壊的操作の自動確認スキップ（危険：テスト用途のみ） */
  skipDestructiveConfirmation?: boolean;
}
```

#### 4.1.2 環境変数

```bash
# ==========================================
# 必須
# ==========================================
ANTHROPIC_API_KEY=sk-ant-xxxxx      # Anthropic APIキー

# ==========================================
# SSH接続（リモート実行時）
# ==========================================
VPS_HOST=xxx.xxx.xxx.xxx            # VPSホスト
VPS_SSH_USER=root                   # SSHユーザー
WP_PATH=/var/www/wordpress          # WordPressパス

# SSH秘密鍵（以下のいずれか1つを設定）
# 方式A: ファイルパス（開発環境向け）
VPS_SSH_KEY_PATH=/path/to/private/key

# 方式B: AWS Secrets Manager（本番推奨）
# VPS_SSH_KEY_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name

# 方式C: GCP Secret Manager（本番推奨）
# VPS_SSH_KEY_SECRET_ID=projects/project-id/secrets/secret-name/versions/latest

# 方式D: HashiCorp Vault（エンタープライズ）
# VPS_SSH_KEY_VAULT_PATH=secret/data/ssh/vps
# VAULT_ADDR=https://vault.example.com
# VAULT_TOKEN=hvs.xxxxx

# 方式E: 環境変数直接（非推奨・CI/CD一時利用のみ）
# VPS_SSH_PRIVATE_KEY=base64-encoded-key

# ==========================================
# ローカル実行（開発時）
# ==========================================
WP_CLI_MODE=local                   # local | ssh
WP_LOCAL_PATH=/path/to/wordpress    # ローカルWPパス

# ==========================================
# オプション
# ==========================================
WP_CLI_TIMEOUT=60000                # コマンドタイムアウト（ms）
AGENT_MAX_ITERATIONS=10             # 最大ループ回数
LOG_LEVEL=info                      # debug | info | warn | error
```

### 4.2 出力インターフェース

#### 4.2.1 エージェント応答

```typescript
interface AgentOutput {
  /** 成功/失敗 */
  success: boolean;

  /** Claudeからの最終応答テキスト */
  response: string;

  /** 実行されたコマンド履歴 */
  executedCommands: ExecutedCommand[];

  /** 部分的成功の場合の詳細 */
  partialSuccess?: {
    succeeded: number;
    failed: number;
    details: Array<{
      operation: string;
      success: boolean;
      error?: string;
    }>;
  };

  /** エラー情報（失敗時） */
  error?: {
    code: AgentErrorCode;
    message: string;
    details?: unknown;
  };

  /** メタ情報 */
  metadata?: {
    totalIterations: number;
    totalCommandsExecuted: number;
    executionTimeMs: number;
  };
}

interface ExecutedCommand {
  command: string;
  success: boolean;
  output?: string;
  error?: string;
  executedAt: string;
  durationMs: number;
}

type AgentErrorCode =
  | 'SSH_CONNECTION_FAILED'
  | 'COMMAND_TIMEOUT'
  | 'COMMAND_BLOCKED'
  | 'API_ERROR'
  | 'API_RATE_LIMITED'
  | 'MAX_ITERATIONS_EXCEEDED'
  | 'PARTIAL_FAILURE'
  | 'CONFIRMATION_REQUIRED'
  | 'UNKNOWN_ERROR';
```

### 4.3 Tool定義（Anthropic SDK）

```typescript
const wpCliTool: Tool = {
  name: 'wp_cli',
  description: `WordPressをWP-CLIコマンドで操作します。

【投稿操作】
- post list --post_status=<status> --format=json
- post create --post_title="タイトル" --post_content="本文" --post_status=<draft|publish>
- post update <id> --post_title="新タイトル"
- post delete <id>

【カテゴリ・タグ】
- term list category --format=json
- term create category "カテゴリ名"

【メディア】
- media list --format=json
- media import <url> --title="タイトル"

【テーマ・プラグイン】
- theme list --format=json
- theme activate <slug>
- plugin list --format=json
- plugin activate <slug>

【マルチサイト】
- site list --format=json
- site create --slug=<slug> --title="タイトル" --email=<email>

※ --format=json でJSON出力（一覧取得時推奨）
※ --porcelain で作成IDのみ出力
※ --url=<site_url> でマルチサイトの特定サイトを指定`,

  input_schema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'WP-CLIコマンド（先頭の「wp」は不要）'
      }
    },
    required: ['command']
  }
};
```

### 4.4 Stream01連携インターフェース（未確定）

> **注意:** このセクションは暫定案です。Stream01/Stream04の設計確定後に正式化されます。

```typescript
/**
 * 【未確定】Stream01から呼び出される記事投稿インターフェース
 * Stream04（Integration）経由で使用される想定
 *
 * ※ このインターフェースはStream01/Stream04の設計に依存するため、
 *   それらの仕様確定後に正式版を定義する
 */
interface PublishArticleInput {
  /** 記事タイトル */
  title: string;

  /** 記事本文（HTML） */
  content: string;

  /** カテゴリスラッグ（存在しない場合は作成） */
  categories?: string[];

  /** タグ（存在しない場合は作成） */
  tags?: string[];

  /** 公開設定 */
  status: 'draft' | 'publish' | 'future';

  /** 予約公開日時（status=future時必須、ISO 8601形式） */
  publishDate?: string;

  /** アイキャッチ画像URL（自動インポート） */
  featuredImageUrl?: string;

  /** メタデータ */
  meta?: {
    description?: string;
    [key: string]: string | undefined;
  };

  /** 対象サイト（Multisite用） */
  siteUrl?: string;
}

interface PublishArticleOutput {
  success: boolean;
  data?: {
    postId: number;
    postUrl: string;
    editUrl: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

---

## 5. コンポーネント設計

### 5.1 コンポーネント図

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WP-CLI Agent Module                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Public Interface]                                                 │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │  WordPressAgent                                           │     │
│  │  - run(input: AgentInput): Promise<AgentOutput>           │     │
│  │  - publishArticle(input: PublishArticleInput): Promise    │     │
│  └───────────────────────────────────────────────────────────┘     │
│                              │                                      │
│                              ▼                                      │
│  [Internal Components]                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  AgentLoop      │  │  ToolHandler    │  │  CommandFilter  │    │
│  │                 │  │                 │  │                 │    │
│  │  - iterate()    │→ │  - execute()    │→ │  - validate()   │    │
│  │  - handleTool() │  │  - parseResult()│  │  - sanitize()   │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                    │                │
│                                                    ▼                │
│  [Infrastructure]                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  WPCLIExecutor  │  │  AnthropicClient│  │  SecretManager  │    │
│  │  (既存wp-cli.ts │  │  (SDK Wrapper)  │  │  (鍵管理)       │    │
│  │   を拡張)       │  │                 │  │                 │    │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘    │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │  SSHClient      │  ← 既存モジュール流用                          │
│  │  (既存)         │                                               │
│  └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 コンポーネント責務

| コンポーネント | 責務 | 依存先 |
|---------------|------|--------|
| **WordPressAgent** | 外部公開API。エージェント実行の統括 | AgentLoop |
| **AgentLoop** | Anthropic APIとのやり取り、ループ制御 | ToolHandler, AnthropicClient |
| **ToolHandler** | Tool呼び出しの処理、結果の整形 | CommandFilter, WPCLIExecutor |
| **CommandFilter** | コマンドの検証、危険コマンドのブロック | - |
| **WPCLIExecutor** | WP-CLIコマンドの実行 | SSHClient, SecretManager |
| **AnthropicClient** | Anthropic SDK ラッパー | @anthropic-ai/sdk |
| **SecretManager** | SSH秘密鍵・APIキーの安全な取得 | AWS/GCP SDK or Vault |
| **SSHClient** | SSH接続管理（既存） | ssh2 |

---

## 6. シーケンス図

### 6.1 基本フロー

```
┌──────┐  ┌─────────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐
│Client│  │WPAgent      │  │AgentLoop  │  │Anthropic  │  │ToolHandler│ │WPExecutor│
└──┬───┘  └──────┬──────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬─────┘
   │             │               │              │               │             │
   │ run(input)  │               │              │               │             │
   │────────────▶│               │              │               │             │
   │             │ iterate()     │              │               │             │
   │             │──────────────▶│              │               │             │
   │             │               │              │               │             │
   │             │               │ messages.    │               │             │
   │             │               │ create()     │               │             │
   │             │               │─────────────▶│               │             │
   │             │               │              │               │             │
   │             │               │ tool_use     │               │             │
   │             │               │◀─────────────│               │             │
   │             │               │              │               │             │
   │             │               │ execute()    │               │             │
   │             │               │─────────────────────────────▶│             │
   │             │               │              │               │             │
   │             │               │              │               │ wpCommand() │
   │             │               │              │               │────────────▶│
   │             │               │              │               │             │
   │             │               │              │               │ result      │
   │             │               │              │               │◀────────────│
   │             │               │              │               │             │
   │             │               │ tool_result  │               │             │
   │             │               │◀─────────────────────────────│             │
   │             │               │              │               │             │
   │             │               │ messages.    │               │             │
   │             │               │ create()     │               │             │
   │             │               │─────────────▶│               │             │
   │             │               │              │               │             │
   │             │               │ end_turn     │               │             │
   │             │               │◀─────────────│               │             │
   │             │               │              │               │             │
   │             │ AgentOutput   │              │               │             │
   │             │◀──────────────│              │               │             │
   │             │               │              │               │             │
   │ AgentOutput │               │              │               │             │
   │◀────────────│               │              │               │             │
```

### 6.2 危険コマンドブロック時

```
   │             │               │              │               │             │
   │             │               │ tool_use:    │               │             │
   │             │               │ "db drop"    │               │             │
   │             │               │◀─────────────│               │             │
   │             │               │              │               │             │
   │             │               │ validate()   │               │             │
   │             │               │─────────────▶│ CommandFilter │             │
   │             │               │              │               │             │
   │             │               │ BLOCKED      │               │             │
   │             │               │◀─────────────│               │             │
   │             │               │              │               │             │
   │             │               │ tool_result: │               │             │
   │             │               │ "ブロック"    │               │             │
   │             │               │─────────────▶│               │             │
   │             │               │              │               │             │
   │             │               │ end_turn:    │               │             │
   │             │               │ "実行不可"   │               │             │
   │             │               │◀─────────────│               │             │
```

### 6.3 破壊的操作確認フロー

```
   │             │               │              │               │             │
   │             │               │ tool_use:    │               │             │
   │             │               │ "post delete │               │             │
   │             │               │  45"         │               │             │
   │             │               │◀─────────────│               │             │
   │             │               │              │               │             │
   │             │               │ isDestructive()              │             │
   │             │               │─────────────▶│               │             │
   │             │               │              │               │             │
   │             │               │ true         │               │             │
   │             │               │◀─────────────│               │             │
   │             │               │              │               │             │
   │ 確認要求    │               │              │               │             │
   │◀────────────│◀──────────────│              │               │             │
   │             │               │              │               │             │
   │ 確認OK      │               │              │               │             │
   │────────────▶│──────────────▶│              │               │             │
   │             │               │              │               │             │
   │             │               │ execute()    │               │             │
   │             │               │─────────────────────────────▶│             │
```

---

## 7. エラーハンドリング

### 7.1 エラー分類と対処

| エラー種別 | 原因 | 対処 | リトライ |
|-----------|------|------|---------|
| SSH_CONNECTION_FAILED | SSH接続失敗 | リトライ後エラー返却 | 3回 |
| COMMAND_TIMEOUT | コマンド実行タイムアウト | タイムアウトエラー返却 | なし |
| COMMAND_BLOCKED | 危険コマンド検出 | ブロック理由をClaudeに返却 | なし |
| API_ERROR | Anthropic API エラー（5xx） | リトライ後エラー返却 | 3回 |
| API_RATE_LIMITED | APIレート制限 | 待機後リトライ | 自動 |
| MAX_ITERATIONS_EXCEEDED | ループ上限到達 | 現時点の結果を返却 | なし |
| PARTIAL_FAILURE | 一部操作が失敗 | 部分的成功として返却 | なし |
| CONFIRMATION_REQUIRED | 破壊的操作の確認待ち | 確認プロンプト表示 | なし |

### 7.2 エラーメッセージ例

```typescript
// COMMAND_BLOCKED
{
  success: false,
  response: "",
  executedCommands: [],
  error: {
    code: "COMMAND_BLOCKED",
    message: "セキュリティ上の理由でこのコマンドは実行できません",
    details: {
      command: "db drop",
      reason: "データベース削除コマンドはブロックされています",
      blockedPattern: "db drop"
    }
  }
}

// PARTIAL_FAILURE
{
  success: false,
  response: "3件中2件の記事を公開しました。1件はエラーにより失敗しました。",
  executedCommands: [...],
  partialSuccess: {
    succeeded: 2,
    failed: 1,
    details: [
      { operation: "post update 45 --post_status=publish", success: true },
      { operation: "post update 46 --post_status=publish", success: true },
      { operation: "post update 47 --post_status=publish", success: false, error: "Post not found" }
    ]
  },
  error: {
    code: "PARTIAL_FAILURE",
    message: "一部の操作が失敗しました"
  }
}
```

---

## 8. テスト要件

### 8.1 単体テスト

| 対象 | テスト内容 | 検証方法 |
|------|-----------|---------|
| CommandFilter | 危険コマンドの検出・ブロック | パターンマッチ結果の検証 |
| CommandFilter | 許可コマンドの通過 | フィルタ通過の検証 |
| ToolHandler | Tool実行結果のパース | JSON/テキスト出力のパース検証 |
| WPCLIExecutor | コマンド実行（モック使用） | モックSSH応答の検証 |

### 8.2 統合テスト

| 対象 | テスト内容 | 検証方法 |
|------|-----------|---------|
| AgentLoop | Tool Use → 実行 → 結果返却のループ | モックAPI応答でのループ検証 |
| SSH接続 | 実際のVPSへの接続（E2E） | 接続成功・失敗の検証 |
| リトライ | API/SSH失敗時のリトライ動作 | リトライ回数・間隔の検証 |

### 8.3 E2Eテスト

| シナリオ | 入力 | 期待結果 | 検証方法 |
|---------|------|---------|---------|
| 投稿一覧取得 | 「投稿一覧を見せて」 | `post list --format=json`が実行される。応答に投稿ID、タイトル、日付が含まれる | 出力JSON検証、DB状態確認 |
| 投稿公開 | 「ID 45を公開して」 | `post update 45 --post_status=publish`が実行される。成功メッセージに投稿タイトルが含まれる | DB状態検証（post_status=publish） |
| 危険コマンド | 「db dropして」 | コマンドが実行されない。エラーコード`COMMAND_BLOCKED`。ブロック理由が日本語で説明される | エラー応答検証、DB変更なし確認 |
| 部分的成功 | 「ID 45,46,47を公開して」（47は存在しない） | 45,46は成功、47は失敗。`PARTIAL_FAILURE`が返却される | partialSuccess詳細の検証 |
| 破壊的操作確認 | 「全ての下書きを削除して」 | 確認プロンプトが表示される。確認なしでは実行されない | `CONFIRMATION_REQUIRED`の検証 |

---

## 9. 制約事項

### 9.1 技術的制約

| 制約 | 理由 |
|------|------|
| WP-CLI必須 | WordPress操作の基盤 |
| SSH接続必須（リモート時） | セキュアな通信手段 |
| Node.js 18+ | Anthropic SDK要件 |
| WordPress 5.0+ | WP-CLI互換性 |

### 9.2 運用上の制約

| 制約 | 理由 |
|------|------|
| 1リクエストあたりAPI呼び出し最大10回 | コスト・性能考慮 |
| 同時実行数5接続 | VPSリソース保護 |
| コマンド実行10回/分/ユーザー | 過負荷防止 |

---

## 10. 運用要件

### 10.1 ログ要件

| ログ種別 | 内容 | 保持期間 | 出力先 |
|---------|------|---------|--------|
| アクセスログ | リクエスト日時、ユーザーID、入力メッセージ（秘密情報マスク済） | 90日 | stdout/ファイル |
| 実行ログ | 実行コマンド、結果（成功/失敗）、所要時間 | 90日 | stdout/ファイル |
| エラーログ | エラー詳細、スタックトレース | 180日 | stderr/ファイル |
| 監査ログ | 破壊的操作の記録、確認応答 | 1年 | 専用ファイル |

**ログフォーマット例:**
```json
{
  "timestamp": "2026-01-30T12:34:56.789Z",
  "level": "info",
  "type": "command_executed",
  "userId": "user-123",
  "sessionId": "sess-456",
  "command": "post list --format=json",
  "success": true,
  "durationMs": 1234
}
```

### 10.2 監視要件

| 監視項目 | 閾値 | アラートレベル |
|---------|------|--------------|
| API応答時間 | 5秒超過 | Warning |
| API応答時間 | 30秒超過 | Critical |
| エラー率 | 5%超過/5分 | Warning |
| エラー率 | 20%超過/5分 | Critical |
| SSH接続失敗 | 3回連続 | Critical |
| レート制限到達 | 80%到達 | Warning |

### 10.3 メトリクス

| メトリクス | 説明 |
|-----------|------|
| `wp_agent_requests_total` | 総リクエスト数 |
| `wp_agent_requests_duration_seconds` | リクエスト処理時間 |
| `wp_agent_commands_executed_total` | 実行コマンド数 |
| `wp_agent_commands_blocked_total` | ブロックされたコマンド数 |
| `wp_agent_errors_total` | エラー数（種別別） |
| `wp_agent_api_calls_total` | Anthropic API呼び出し数 |

---

## 11. 将来拡張

### 11.1 Phase 2検討事項

| 機能 | 概要 | 優先度 |
|------|------|--------|
| 会話履歴の永続化 | 過去の操作を参照した継続会話 | 中 |
| 操作履歴の記録 | 監査ログとしての利用 | 高 |
| ロールベースアクセス制御 | ユーザー権限に応じた操作制限 | 高 |
| バッチ操作 | 複数サイトへの一括操作 | 低 |
| Webhook通知 | 操作完了時の外部通知 | 中 |

### 11.2 他Streamとの連携

| 連携先 | 内容 | インターフェース | 状態 |
|--------|------|-----------------|------|
| Stream01 | 生成記事の自動投稿 | `PublishArticleInput`（暫定） | 未確定 |
| Stream04 | ワークフロー内でのWP操作 | `AgentInput` | 未確定 |
| Stream05 | スケジュール実行 | `AgentInput` + cron設定 | 未確定 |

> **注意:** 連携インターフェースは各Streamの設計確定後に正式化される

---

## 改訂履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-30 | 1.0 | 初版作成 |
| 2026-01-30 | 1.1 | レビュー反映：セキュリティ強化、インターフェース詳細化、運用要件追加 |
