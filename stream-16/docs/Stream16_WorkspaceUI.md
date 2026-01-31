# Stream 16: Workspace UI 要件定義書

> **Stream番号**: 16
> **ディレクトリ**: `/stream-16/`
> **統合先**: `/app/src/components/workspace/`, `/app/src/stores/`
> **状態**: 🔄 開発中
> **ポート**: 3016

---

## 1. 概要

### 1.1 目的
UI仕様書（ArgoNote_UI_Specification.docx）に基づき、自然言語によるWordPress操作を実現するチャットベースAI管理ツールUIを実装する。

### 1.2 設計コンセプト
- **バイブコーディングツール型レイアウト**: 左サイドバーにチャット、右メインエリアにコンテンツ表示
- **フォーカス管理**: AIが操作対象としているオブジェクトを常に明示し、コンテキストの曖昧さを排除
- **コンテキストアウェア**: ユーザーの操作に応じて右パネルが自動的に適切な表示に切り替わる
- **シンプルな操作フロー**: 複雑な設定画面を排除し、自然言語での指示を中心に設計

### 1.3 スタンドアロン開発原則
- 他のStreamに依存せず単独で動作確認可能
- 外部依存（認証、WordPress API、AI API）はすべてモック/スタブで実装
- 統合時にモックを実モジュールに差し替え

### 1.4 テーマ
- Gold & Blackラグジュアリーテーマを維持
- 既存shadcn/uiコンポーネント（Button, Card, Dialog等）パターンを踏襲

---

## 2. 画面構成

### 2.1 全体レイアウト（4エリア構成）

```
+------------------------------------------------------------------+
|                          Header (64px)                            |
| [Logo] [Site Switcher]                      [Settings] [User]     |
+------------------+-----------------------------------------------+
|                  |                                                |
|   Left Sidebar   |                Main Area                       |
|   (320-400px)    |               (flex-1)                         |
|                  |                                                |
|  +-----------+   |  +------------------------------------------+ |
|  | Site List |   |  |            Focus Bar                     | |
|  +-----------+   |  | 📌 記事: [タイトル]  [WPで確認] [✕]      | |
|                  |  +------------------------------------------+ |
|  +-----------+   |                                                |
|  |           |   |  +------------------------------------------+ |
|  |  Chat     |   |  |                                          | |
|  |  Messages |   |  |          Content Display                 | |
|  |           |   |  |                                          | |
|  |           |   |  |   (Article Preview / Table / Welcome)    | |
|  +-----------+   |  |                                          | |
|                  |  +------------------------------------------+ |
|  +-----------+   |                                                |
|  | Input     |   |  +------------------------------------------+ |
|  | [Send]    |   |  |            Action Bar                    | |
|  +-----------+   |  | [下書き保存] [公開] [WPでプレビュー]     | |
|                  |  +------------------------------------------+ |
+------------------+-----------------------------------------------+
|                         Status Bar (32px)                         |
| [接続: OK]                                         [AI: Ready]    |
+------------------------------------------------------------------+
```

| エリア | 位置 | サイズ | 役割 |
|--------|------|--------|------|
| ヘッダー | 上部 | 高さ64px | ロゴ、サイト切り替え、設定、ユーザーメニュー |
| 左サイドバー | 左側 | 幅320-400px | サイト選択、チャット入力、会話履歴、タスク履歴 |
| メインエリア | 右側 | 残り全幅 | フォーカスバー、コンテンツ表示、アクションバー |
| ステータスバー | 下部 | 高さ32px | 接続状態、コンテキスト表示 |

### 2.2 ヘッダー

| 要素 | 配置 | 機能 |
|------|------|------|
| ロゴ | 左端 | Argo Noteロゴ表示 |
| サイト選択ドロップダウン | 中央左 | 接続済みWordPressサイトの切り替え |
| 設定アイコン | 右側 | アプリケーション設定画面を開く |
| ユーザーアイコン | 右端 | ユーザーメニュー（ログアウト、アカウント設定） |

### 2.3 左サイドバー

#### チャットエリア
| 要素 | 説明 |
|------|------|
| 会話履歴表示 | 現在のタスクに関する会話をスクロール可能なリストで表示 |
| ユーザーメッセージ | 右寄せ、背景色付き（primary/10）で表示 |
| AIレスポンス | 左寄せ、アイコン付きで表示 |
| ローディング表示 | AI処理中はタイピングインジケーターを表示 |

#### 入力欄
- テキスト入力フィールド（複数行対応、最大5行まで自動拡張）
- 送信ボタン（右端、アイコン表示）
- Enterキーで送信、Shift+Enterで改行

### 2.4 メインエリア

#### フォーカス状態一覧

| フォーカス状態 | フォーカスバー表示 | メインエリア表示 |
|---------------|-------------------|------------------|
| なし（初期状態） | 📌 なし | ウェルカム画面 |
| article | 📌 記事: [タイトル] | 記事プレビュー/エディタ |
| article-list | 📌 投稿一覧 | 投稿一覧テーブル |
| theme | 📌 テーマ: [テーマ名] | テーマプレビュー |
| plugin-list | 📌 プラグイン一覧 | プラグイン一覧テーブル |
| site-settings | 📌 サイト設定 | 設定パネル |
| site-preview | 📌 サイトプレビュー | iframe表示 |

#### アクションバー

| フォーカス状態 | 表示ボタン |
|---------------|-----------|
| article | [下書き保存] [プレビュー] [公開設定] |
| article-list（選択あり） | [編集] [削除] [ステータス変更] |
| theme | [有効化] [カスタマイズ] |
| site-preview | [更新] [新規タブで開く] |
| none | 非表示 |

### 2.5 ステータスバー

| 要素 | 位置 | 表示内容 |
|------|------|---------|
| 接続状態 | 左側 | [接続: OK] または [接続エラー] |
| フォーカス情報 | 中央 | 現在のフォーカス対象（簡略表示） |
| AI状態 | 右側 | [AI: Ready] / [AI: Processing...] |

---

## 3. インタラクション

### 3.1 チャット入力操作

| 操作 | 動作 |
|------|------|
| Enter | メッセージ送信 |
| Shift + Enter | 改行挿入 |
| 上矢印キー（入力欄空の時） | 直前の自分のメッセージを入力欄に復元 |
| Escape | 入力内容をクリア |

### 3.2 キーボードショートカット

| キー | 機能 |
|------|------|
| / | チャット入力欄にフォーカス |
| Ctrl + S | 保存（編集画面） |
| Escape | モーダルを閉じる |

---

## 4. 状態管理（Zustand）

### focus-store.ts
```typescript
type FocusType = 'none' | 'article' | 'article-list' | 'theme' | 'plugin-list' | 'site-settings' | 'site-preview';

interface FocusTarget {
  type: FocusType;
  id?: string;
  title?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface FocusStore {
  current: FocusTarget;
  history: FocusTarget[];
  hasUnsavedChanges: boolean;
  setFocus: (target: FocusTarget) => void;
  clearFocus: () => void;
  setUnsavedChanges: (value: boolean) => void;
}
```

### chat-store.ts
```typescript
type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    focusChange?: FocusTarget;
    actionTaken?: string;
  };
}

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
}
```

### site-store.ts
```typescript
interface Site {
  id: string;
  name: string;
  url: string;
  favicon?: string;
  status: 'active' | 'provisioning' | 'error';
}

interface SiteStore {
  sites: Site[];
  currentSiteId: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  setSites: (sites: Site[]) => void;
  selectSite: (id: string) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
}
```

---

## 5. モック/スタブ設計

スタンドアロン動作のため、以下の外部依存をモック化：

### auth-mock.ts
```typescript
export const mockUser = {
  id: 'mock-user-1',
  email: 'demo@argonote.ai',
  name: 'Demo User',
};
```

### site-mock.ts
```typescript
export const mockSites = [
  { id: 'site-1', name: 'My Blog', url: 'https://myblog.example.com', status: 'active' },
  { id: 'site-2', name: 'Tech Notes', url: 'https://tech.example.com', status: 'active' },
];
```

### article-mock.ts
```typescript
export const mockArticles = [
  { id: 'art-1', title: 'AIの未来について', status: 'published', createdAt: '2026-01-15' },
  { id: 'art-2', title: 'WordPress自動化ガイド', status: 'draft', createdAt: '2026-01-20' },
];
```

### chat-mock.ts
```typescript
export async function* mockChatStream(message: string) {
  // ストリーミングレスポンスをシミュレート
}
```

---

## 6. ファイル構成

```
stream-16/
├── docs/
│   └── Stream16_WorkspaceUI.md      # この文書
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # shadcn/uiコンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── workspace/
│   │       ├── layout/
│   │       │   ├── app-layout.tsx
│   │       │   ├── header.tsx
│   │       │   ├── left-sidebar.tsx
│   │       │   ├── main-area.tsx
│   │       │   └── status-bar.tsx
│   │       ├── chat/
│   │       │   ├── chat-panel.tsx
│   │       │   ├── chat-input.tsx
│   │       │   ├── chat-message.tsx
│   │       │   └── chat-message-list.tsx
│   │       ├── main/
│   │       │   ├── focus-bar.tsx
│   │       │   ├── content-display.tsx
│   │       │   └── action-bar.tsx
│   │       ├── focus/
│   │       │   ├── welcome-view.tsx
│   │       │   ├── article-preview.tsx
│   │       │   └── article-list-table.tsx
│   │       └── shared/
│   │           ├── site-switcher.tsx
│   │           └── connection-status.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── stores/
│   │   │   ├── focus-store.ts
│   │   │   ├── chat-store.ts
│   │   │   └── site-store.ts
│   │   └── mocks/
│   │       ├── auth-mock.ts
│   │       ├── site-mock.ts
│   │       ├── article-mock.ts
│   │       └── chat-mock.ts
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## 7. 開発・テスト

### 起動方法
```bash
cd stream-16
npm install
npm run dev
# http://localhost:3016 でアクセス
```

### テスト確認項目
1. 4エリアレイアウトが正しく表示される
2. サイト切り替えが動作する
3. チャット入力・送信が動作する（モックレスポンス）
4. フォーカス切り替えでメインエリアが変化する
5. レスポンシブ対応（モバイル/タブレット）

---

## 8. 統合計画

統合時に以下を差し替え：
- `lib/mocks/*` → 実モジュール（認証、WordPress API、AI API）
- `/app/workspace/` ルートとして統合

---

## 改訂履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-31 | 初版作成 |
