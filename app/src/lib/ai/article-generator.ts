// Argo Note - Article Generator Service
// Combines Tavily research with LLM generation

import { llmClient, ARTICLE_PROMPTS } from './llm-client';
import { tavilyClient, RESEARCH_QUERIES } from './tavily-client';
import type { ArticleContent, ArticleType, ARTICLE_WORD_COUNTS } from '@/types';

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
  // Step 1: Research the topic
  async research(keyword: string, productName: string) {
    const queries = RESEARCH_QUERIES.forKeyword(keyword);

    // Perform searches
    const searchResults = await tavilyClient.researchTopic(keyword, queries);

    // Compile research into a summary
    let researchSummary = '';
    for (const [query, results] of searchResults) {
      researchSummary += `\n## Research: ${query}\n`;
      for (const result of results.results.slice(0, 3)) {
        researchSummary += `- ${result.title}: ${result.content.slice(0, 200)}...\n`;
        researchSummary += `  Source: ${result.url}\n`;
      }
    }

    return researchSummary;
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

  // Full article generation pipeline
  async generate(options: GenerationOptions): Promise<ArticleContent> {
    // Step 1: Research
    const research = await this.research(options.targetKeyword, options.productName);

    // Step 2: Generate outline
    const outline = await this.generateOutline(options);

    // Step 3: Generate content
    const content = await this.generateContent(outline, research, options);

    // Step 4: Generate meta description
    const metaDescription = await this.generateMetaDescription(
      outline.title,
      content,
      options.targetKeyword
    );

    return {
      title: outline.title,
      content,
      meta_description: metaDescription,
      target_keyword: options.targetKeyword,
      search_intent: 'informational', // Could be enhanced to detect intent
      article_type: options.articleType,
    };
  }
}

// Default instance
export const articleGenerator = new ArticleGenerator();
