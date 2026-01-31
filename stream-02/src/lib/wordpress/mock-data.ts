// Argo Note - Stream 02 Mock Data
// Stream02テスト用のモックデータ
//
// 目的: WordPressへの記事投稿機能が動作することを検証
// ※ 実際の記事生成（Stream01）とは独立してテスト可能にする

import { ArticlePublishInput } from './article-publisher';

/**
 * テスト用モック記事
 *
 * Stream02では記事の「内容」ではなく「投稿機能」をテストするため、
 * シンプルなモックデータを使用する。
 */
export const MOCK_ARTICLE: Omit<ArticlePublishInput, 'featuredImage'> = {
  title: '[Stream02 Test] WordPress投稿機能テスト',
  content: `
<h2>これはStream02のテスト投稿です</h2>

<p>このテスト記事は、Stream02（WordPressセットアップ）の単体テストで使用されます。</p>

<h3>テスト目的</h3>

<ul>
  <li>WordPress REST APIへの接続が正常に動作すること</li>
  <li>記事の投稿が正常に完了すること</li>
  <li>画像のアップロードが正常に完了すること（オプション）</li>
</ul>

<h3>注意事項</h3>

<p>この記事は<strong>テスト目的</strong>で作成されています。実際のコンテンツ生成はStream01が担当します。</p>

<blockquote>
  <p>Stream02の責務: WordPressがセットアップでき、記事投稿機能が動作することを検証</p>
</blockquote>

<p>テスト完了後、この記事は削除しても構いません。</p>
  `.trim(),
  status: 'draft', // テスト記事はドラフトとして投稿
};

/**
 * テスト用モック記事（公開版）
 */
export const MOCK_ARTICLE_PUBLISHED: Omit<ArticlePublishInput, 'featuredImage'> = {
  ...MOCK_ARTICLE,
  title: '[Stream02 Test] WordPress投稿機能テスト（公開）',
  status: 'publish',
};

/**
 * テスト用モック画像データを生成
 *
 * 1x1ピクセルの最小限PNG画像（Base64エンコード済み）
 * 実際のテストでは、より適切なテスト画像に置き換え可能
 */
export function createMockImageBuffer(): Buffer {
  // 1x1 pixel transparent PNG
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64, 'base64');
}

/**
 * テスト用のフル記事データ（画像付き）
 */
export function createMockArticleWithImage(): ArticlePublishInput {
  return {
    ...MOCK_ARTICLE,
    featuredImage: {
      buffer: createMockImageBuffer(),
      filename: 'stream02-test-image.png',
      mimeType: 'image/png',
    },
  };
}

/**
 * 複数のテスト記事を生成
 *
 * @param count 生成する記事数
 */
export function createMockArticles(count: number): Omit<ArticlePublishInput, 'featuredImage'>[] {
  return Array.from({ length: count }, (_, i) => ({
    title: `[Stream02 Test] テスト記事 #${i + 1}`,
    content: `
<p>これはStream02のテスト記事 #${i + 1} です。</p>
<p>投稿日時: ${new Date().toISOString()}</p>
    `.trim(),
    status: 'draft' as const,
  }));
}
