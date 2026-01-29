/**
 * AI Prompts
 * ==========
 * 記事生成に使用するプロンプト定義
 *
 * 責務:
 * - 記事生成用プロンプトの一元管理
 * - プロンプトのバージョン管理・カスタマイズの容易化
 *
 * 使用例:
 * ```typescript
 * import { ARTICLE_PROMPTS } from './prompts';
 * const outline = await llm.jsonPrompt(ARTICLE_PROMPTS.OUTLINE, userPrompt);
 * ```
 */

/**
 * 記事生成用プロンプト
 */
export const ARTICLE_PROMPTS = {
  /**
   * アウトライン生成プロンプト
   * SEO最適化された記事構成を生成
   */
  OUTLINE: `You are an expert SEO content strategist. Generate a comprehensive article outline.
The outline should include:
- A compelling title optimized for the target keyword
- H2 and H3 headings that cover the topic thoroughly
- Brief notes on what each section should cover
Return as JSON with the structure:
{
  "title": "string",
  "sections": [
    { "heading": "string", "level": 2 | 3, "notes": "string" }
  ]
}`,

  /**
   * コンテンツ生成プロンプト
   * SEO最適化された記事本文を生成
   */
  CONTENT: `You are an expert content writer specializing in SEO-optimized articles.
Write engaging, informative content that:
- Is optimized for the target keyword naturally (no keyword stuffing)
- Provides genuine value to readers
- Uses clear, accessible language
- Includes specific examples and actionable advice
- Is formatted in valid HTML with proper heading hierarchy`,

  /**
   * メタディスクリプション生成プロンプト
   * 検索結果でクリックを促す説明文を生成
   */
  META_DESCRIPTION: `Write a compelling meta description (max 160 characters) that:
- Includes the target keyword naturally
- Encourages clicks from search results
- Accurately summarizes the content`,
} as const;

/**
 * プロンプトのカスタマイズ用ヘルパー
 * 既存のプロンプトに追加指示を付加
 */
export function extendPrompt(basePrompt: string, additionalInstructions: string): string {
  return `${basePrompt}\n\nAdditional Instructions:\n${additionalInstructions}`;
}

/**
 * 言語別プロンプト修飾子
 */
export const LANGUAGE_MODIFIERS = {
  ja: 'Write all content in natural, fluent Japanese (日本語). Use appropriate keigo and formal tone for professional articles.',
  en: 'Write all content in clear, professional English suitable for a global audience.',
} as const;
