"use server";

// Stream02: 記事投稿機能テスト
// テスト目的: 記事投稿機能がWordPressで動作することを確認
// ※ Mockデータを使用（Stream01の出力は使用しない）

import {
  ArticlePublisher,
  WordPressClient,
  MOCK_ARTICLE,
  MOCK_ARTICLE_PUBLISHED,
  createMockArticleWithImage,
} from "@/lib/wordpress";

interface PostTestArticleInput {
  siteUrl: string;
  username: string;
  applicationPassword: string;
  withImage: boolean;
  publishImmediately: boolean;
}

export async function postTestArticle(input: PostTestArticleInput) {
  try {
    const client = new WordPressClient({
      baseUrl: input.siteUrl,
      username: input.username,
      applicationPassword: input.applicationPassword,
    });

    const publisher = new ArticlePublisher(client);

    // Mockデータを選択
    let article;
    if (input.withImage) {
      article = createMockArticleWithImage();
      if (input.publishImmediately) {
        article.status = "publish";
      }
    } else {
      article = input.publishImmediately ? MOCK_ARTICLE_PUBLISHED : MOCK_ARTICLE;
    }

    const result = await publisher.publish(article);

    return result;
  } catch (error) {
    return {
      success: false,
      error: {
        code: "UNKNOWN" as const,
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Mockデータのプレビューを取得
 */
export async function getMockArticlePreview(withImage: boolean) {
  if (withImage) {
    const article = createMockArticleWithImage();
    return {
      title: article.title,
      content: article.content,
      status: article.status,
      hasImage: true,
      imageFilename: article.featuredImage?.filename,
    };
  }

  return {
    title: MOCK_ARTICLE.title,
    content: MOCK_ARTICLE.content,
    status: MOCK_ARTICLE.status,
    hasImage: false,
  };
}
