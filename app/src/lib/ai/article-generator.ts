// Argo Note - Article Generator Service
// Combines Tavily research with LLM generation
// Phase 4: Integrated with image generation (NanoBanana Pro)

import { llmClient, ARTICLE_PROMPTS } from './llm-client';
import { tavilyClient } from './tavily-client';
import { imageGenerator } from './image-generator';
import { sectionImageService } from './section-image-service';
import type { ArticleContent, ArticleType } from '@/types';

type ArticleOutline = {
  title: string;
  sections: Array<{
    heading: string;
    level: 2 | 3;
    notes: string;
  }>;
};

type GenerationOptions = {
  targetKeyword: string;
  productName: string;
  productDescription: string;
  articleType: ArticleType;
  language?: 'en' | 'ja';
  includeImages?: boolean;
};

export class ArticleGenerator {
  // Step 1: Research the topic using enhanced 3-phase search
  async research(keyword: string, language: 'en' | 'ja' = 'en') {
    // Use enhanced multi-phase research (NEWS, SNS, OFFICIAL)
    const researchContext = await tavilyClient.researchForArticle(keyword, {
      language,
      includeSubQueries: true,
    });

    return researchContext;
  }

  // Step 2: Generate article outline
  async generateOutline(options: GenerationOptions): Promise<ArticleOutline> {
    const systemPrompt = ARTICLE_PROMPTS.OUTLINE;
    const userPrompt = `
Generate an article outline for the following:

Target Keyword: ${options.targetKeyword}
Product: ${options.productName}
Product Description: ${options.productDescription}
Article Type: ${options.articleType}
Language: ${options.language || 'en'}

The article should be comprehensive, SEO-optimized, and provide genuine value to readers searching for "${options.targetKeyword}".
`;

    return llmClient.jsonPrompt<ArticleOutline>(systemPrompt, userPrompt);
  }

  // Step 3: Generate full article content
  async generateContent(
    outline: ArticleOutline,
    research: string,
    options: GenerationOptions
  ): Promise<string> {
    const wordCount =
      options.articleType === 'article'
        ? { min: 3000, max: 4000 }
        : options.articleType === 'faq'
        ? { min: 1500, max: 2500 }
        : { min: 1000, max: 2000 };

    const systemPrompt = ARTICLE_PROMPTS.CONTENT;
    const userPrompt = `
Write a complete ${options.articleType} article based on the following:

## Article Outline
Title: ${outline.title}
Sections:
${outline.sections.map((s) => `- ${'#'.repeat(s.level)} ${s.heading}: ${s.notes}`).join('\n')}

## Research Data
${research}

## Requirements
- Target Keyword: ${options.targetKeyword}
- Product: ${options.productName} - ${options.productDescription}
- Word Count: ${wordCount.min}-${wordCount.max} words
- Language: ${options.language || 'en'}
- Format: HTML with proper heading tags (h1, h2, h3), paragraphs, lists, and emphasis

Write the complete article content in valid HTML. Start with the h1 title and include all sections from the outline.
`;

    const content = await llmClient.complete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        maxTokens: 8192,
        temperature: 0.7,
      }
    );

    return content;
  }

  // Step 4: Generate meta description
  async generateMetaDescription(
    title: string,
    content: string,
    targetKeyword: string
  ): Promise<string> {
    const systemPrompt = ARTICLE_PROMPTS.META_DESCRIPTION;
    const userPrompt = `
Generate a meta description for this article:

Title: ${title}
Target Keyword: ${targetKeyword}
Content Summary: ${content.slice(0, 1000)}...
`;

    const metaDescription = await llmClient.prompt(systemPrompt, userPrompt);
    return metaDescription.slice(0, 160);
  }

  // Step 5: Generate thumbnail image
  async generateThumbnail(
    title: string,
    content: string,
    options?: { referenceImageUrl?: string }
  ): Promise<{ imageData: Buffer; promptUsed: string } | null> {
    try {
      console.log('Generating thumbnail for article:', title);
      const result = await imageGenerator.generateThumbnail(title, content, {
        referenceImageUrl: options?.referenceImageUrl,
      });

      if (result.isFallback) {
        console.warn('Thumbnail generation failed:', result.errorMessage);
        return null;
      }

      return {
        imageData: result.imageData,
        promptUsed: result.promptUsed,
      };
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  // Step 6: Process section images
  async processContentWithSectionImages(
    htmlContent: string,
    articleTitle: string,
    options?: { maxImages?: number; referenceImageUrl?: string }
  ): Promise<{ processedHtml: string; imagesGenerated: number; errors: string[] }> {
    try {
      console.log('Processing section images for article:', articleTitle);
      const result = await sectionImageService.processArticleImages(
        htmlContent,
        articleTitle,
        {
          maxImages: options?.maxImages ?? 5,
          referenceImageUrl: options?.referenceImageUrl,
        }
      );

      if (result.errors.length > 0) {
        console.warn('Section image errors:', result.errors);
      }

      return result;
    } catch (error) {
      console.error('Error processing section images:', error);
      return {
        processedHtml: htmlContent,
        imagesGenerated: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  // Full article generation pipeline
  async generate(options: GenerationOptions): Promise<ArticleContent> {
    const language = options.language || 'en';

    // Step 1: Research (using enhanced 3-phase search)
    console.log('Step 1: Researching topic with multi-phase search...');
    const research = await this.research(options.targetKeyword, language);

    // Step 2: Generate outline
    console.log('Step 2: Generating article outline...');
    const outline = await this.generateOutline(options);

    // Step 3: Generate content
    console.log('Step 3: Generating article content...');
    const content = await this.generateContent(outline, research, options);

    // Step 4: Generate meta description
    console.log('Step 4: Generating meta description...');
    const metaDescription = await this.generateMetaDescription(
      outline.title,
      content,
      options.targetKeyword
    );

    // Initialize result
    const result: ArticleContent = {
      title: outline.title,
      content,
      meta_description: metaDescription,
      target_keyword: options.targetKeyword,
      search_intent: 'informational',
      article_type: options.articleType,
    };

    // Step 5 & 6: Generate images (if enabled)
    if (options.includeImages) {
      // Step 5: Generate thumbnail
      console.log('Step 5: Generating thumbnail...');
      const thumbnail = await this.generateThumbnail(outline.title, content);
      if (thumbnail) {
        result.thumbnail = thumbnail;
      }

      // Step 6: Process section images
      console.log('Step 6: Processing section images...');
      const sectionResult = await this.processContentWithSectionImages(
        content,
        outline.title,
        { maxImages: 5 }
      );
      result.content = sectionResult.processedHtml;
      result.sectionImagesGenerated = sectionResult.imagesGenerated;
    }

    console.log('Article generation complete!');
    return result;
  }
}

// Default instance
export const articleGenerator = new ArticleGenerator();
