// 記事モック - スタンドアロン動作用

export interface MockArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'pending';
  createdAt: string;
  updatedAt: string;
  author: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
}

export const mockArticles: MockArticle[] = [
  {
    id: 'new-article',
    title: 'AIの活用方法 - 初心者向けガイド',
    content: `# AIの活用方法 - 初心者向けガイド

人工知能（AI）は、私たちの日常生活やビジネスに革命をもたらしています。この記事では、初心者の方でも理解しやすいようにAIの基本的な活用方法を解説します。

## 1. AIとは何か？

AIとは、人間の知能を模倣したコンピューターシステムのことです。学習、推論、問題解決などの能力を持ち、様々なタスクを自動化できます。

## 2. 日常生活でのAI活用例

### スマートアシスタント
- Siri、Alexa、Google Assistantなど
- 音声認識で操作が可能
- スケジュール管理、リマインダー設定

### 写真・動画編集
- 自動補正機能
- 顔認識による整理
- AIによる編集提案

## 3. ビジネスでのAI活用

| 分野 | 活用例 | 効果 |
|------|--------|------|
| マーケティング | 顧客分析 | 売上20%向上 |
| カスタマーサービス | チャットボット | 対応時間50%削減 |
| 製造業 | 品質管理 | 不良率80%低減 |

## 4. AI活用を始めるためのステップ

1. **目的を明確にする**: 何を改善したいかを定義
2. **ツールを選ぶ**: 目的に合ったAIツールを選択
3. **小さく始める**: まずは限定的な範囲で試行
4. **効果を測定**: 導入前後の比較分析

## まとめ

AIは難しそうに見えますが、基本を押さえれば誰でも活用できます。まずは身近なところから始めてみましょう。

---

*この記事はArgo NoteのAIによって生成されました。*
`,
    excerpt: 'AIの基本的な活用方法を初心者向けにわかりやすく解説。日常生活やビジネスでの具体的な活用例を紹介します。',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'AI Assistant',
    categories: ['テクノロジー', 'AI'],
    tags: ['AI', '初心者向け', 'ガイド'],
    featuredImage: 'ai-guide-hero.jpg',
  },
  {
    id: 'art-1',
    title: 'AIの未来について考える',
    content: `# AIの未来について考える

人工知能（AI）は急速に進化を続けており、私たちの生活のあらゆる側面に影響を与えています。

## 現在のAI技術

現在のAI技術は、以下の分野で特に進歩しています：

- **自然言語処理**: ChatGPTなどの大規模言語モデル
- **画像生成**: DALL-E、Midjourney、Stable Diffusion
- **コード生成**: GitHub Copilot、Claude Code

## 将来の展望

今後5年間で、AIは以下の分野でさらに発展すると予想されます：

1. パーソナライズされた教育
2. 医療診断の支援
3. 自動運転技術
4. クリエイティブ産業の変革

## まとめ

AI技術の進歩は止まることなく、私たちの社会を大きく変えていくでしょう。
`,
    excerpt: '人工知能（AI）は急速に進化を続けており、私たちの生活のあらゆる側面に影響を与えています...',
    status: 'published',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    author: 'Demo User',
    categories: ['テクノロジー', 'AI'],
    tags: ['AI', '機械学習', '未来予測'],
  },
  {
    id: 'art-2',
    title: 'WordPress自動化ガイド',
    content: `# WordPress自動化ガイド

WordPressサイトの運営を効率化するための自動化テクニックを紹介します。

## 自動化できる作業

- 記事の定期投稿
- バックアップ
- セキュリティスキャン
- パフォーマンス最適化

## おすすめツール

1. **WP-CLI**: コマンドラインからWordPressを操作
2. **Inngest**: バックグラウンドジョブ管理
3. **Argo Note**: AI記事生成と自動投稿
`,
    excerpt: 'WordPressサイトの運営を効率化するための自動化テクニックを紹介します...',
    status: 'draft',
    createdAt: '2026-01-20T14:30:00Z',
    updatedAt: '2026-01-25T09:15:00Z',
    author: 'Demo User',
    categories: ['WordPress', 'チュートリアル'],
    tags: ['WordPress', '自動化', '効率化'],
  },
  {
    id: 'art-3',
    title: '2026年のSEOトレンド',
    content: `# 2026年のSEOトレンド

検索エンジン最適化の最新トレンドについて解説します。
`,
    excerpt: '検索エンジン最適化の最新トレンドについて解説します...',
    status: 'pending',
    createdAt: '2026-01-28T08:00:00Z',
    updatedAt: '2026-01-28T08:00:00Z',
    author: 'Demo User',
    categories: ['SEO', 'マーケティング'],
    tags: ['SEO', '2026', 'トレンド'],
  },
];

export const mockArticleAPI = {
  getArticles: (): Promise<MockArticle[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockArticles);
      }, 300);
    });
  },

  getArticle: (id: string): Promise<MockArticle | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const article = mockArticles.find((a) => a.id === id);
        resolve(article || null);
      }, 200);
    });
  },

  publishArticle: (id: string): Promise<{ success: boolean; url: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          url: `https://example.com/article/${id}`,
        });
      }, 500);
    });
  },

  saveArticle: (id: string, content: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },
};
