// Argo Note - Product Analyzer Service
// Implements Phase A-E AI pipeline for product analysis
// Based on: docs/architecture/04_AI_Pipeline.md

import { llmClient } from './llm-client';
import { tavilyClient, RESEARCH_QUERIES } from './tavily-client';
import type {
  ProductAnalysisResult,
  PhaseAResult,
  PhaseBResult,
  PhaseCResult,
  PhaseDResult,
  PhaseEResult,
} from '@/types';

type AnalyzeOptions = {
  productId: string;
  productName: string;
  productDescription: string;
  productUrl?: string;
  userAnswers?: Record<string, string>;
  language?: 'en' | 'ja';
};

const ANALYSIS_PROMPTS = {
  PHASE_A: `You are a product analyst. Analyze the given product and provide:
1. A comprehensive product summary (200-300 words)
2. Target audience description (specific demographics, professions, needs)
3. Core value proposition (what problem it solves, unique benefits)

Return as JSON:
{
  "product_summary": "string",
  "target_audience": "string",
  "value_proposition": "string"
}`,

  PHASE_B: `You are a marketing strategist specializing in purchase funnels.
Analyze the product and create a detailed purchase funnel with specific touchpoints for each stage.

Return as JSON:
{
  "purchase_funnel": {
    "awareness": ["specific awareness stage touchpoints"],
    "interest": ["specific interest stage touchpoints"],
    "consideration": ["specific consideration stage touchpoints"],
    "decision": ["specific decision stage touchpoints"]
  }
}`,

  PHASE_C: `You are an SEO keyword research expert.
Based on the product information and search results, generate a prioritized list of target keywords.

For each keyword, estimate:
- Search volume (monthly searches)
- Keyword difficulty (0-100)
- Search intent (informational, transactional, navigational)

Return as JSON:
{
  "keywords": [
    {
      "keyword": "string",
      "search_volume": number,
      "difficulty": number,
      "intent": "informational|transactional|navigational"
    }
  ]
}`,

  PHASE_D: `You are a competitive analysis expert.
Analyze the competitor information and identify:
1. Key competitors and their strengths
2. Content gaps that can be exploited
3. Opportunities for differentiation

Return as JSON:
{
  "competitors": [
    {
      "url": "string",
      "title": "string",
      "strengths": ["string"],
      "gaps": ["string"]
    }
  ]
}`,

  PHASE_E: `You are a content strategist specializing in topic clusters for SEO.
Create a comprehensive content plan with pillar topics and supporting articles.

Each cluster should have:
- A pillar topic (main comprehensive guide)
- 3-5 supporting articles that link to the pillar
- Clear priority ordering (1 = highest priority)

Return as JSON:
{
  "clusters": [
    {
      "pillar_topic": "string",
      "articles": [
        {
          "title": "string",
          "target_keyword": "string",
          "priority": number
        }
      ]
    }
  ]
}`,
};

export class ProductAnalyzer {
  // Phase A: Product Analysis
  async analyzeProduct(options: AnalyzeOptions): Promise<PhaseAResult> {
    const userPrompt = `
Analyze this product:

Product Name: ${options.productName}
Description: ${options.productDescription}
${options.productUrl ? `URL: ${options.productUrl}` : ''}
${options.userAnswers ? `Additional Info:\n${JSON.stringify(options.userAnswers, null, 2)}` : ''}

Language: ${options.language || 'en'}
`;

    return llmClient.jsonPrompt<PhaseAResult>(ANALYSIS_PROMPTS.PHASE_A, userPrompt);
  }

  // Phase B: Purchase Funnel Analysis
  async analyzePurchaseFunnel(
    options: AnalyzeOptions,
    phaseAResult: PhaseAResult
  ): Promise<PhaseBResult> {
    const userPrompt = `
Analyze the purchase funnel for this product:

Product: ${options.productName}
Summary: ${phaseAResult.product_summary}
Target Audience: ${phaseAResult.target_audience}
Value Proposition: ${phaseAResult.value_proposition}

Create a detailed purchase funnel with specific touchpoints for each stage.
Language: ${options.language || 'en'}
`;

    return llmClient.jsonPrompt<PhaseBResult>(ANALYSIS_PROMPTS.PHASE_B, userPrompt);
  }

  // Phase C: Keyword Research
  async researchKeywords(
    options: AnalyzeOptions,
    phaseAResult: PhaseAResult
  ): Promise<PhaseCResult> {
    // Perform web research for keyword ideas
    const queries = RESEARCH_QUERIES.forProduct(options.productName);
    const searchResults = await tavilyClient.researchTopic(options.productName, queries);

    // Compile search results
    let searchContext = '';
    for (const [query, results] of searchResults) {
      searchContext += `\nSearch: ${query}\n`;
      for (const result of results.results.slice(0, 3)) {
        searchContext += `- ${result.title}: ${result.content.slice(0, 150)}...\n`;
      }
    }

    const userPrompt = `
Research keywords for this product:

Product: ${options.productName}
Target Audience: ${phaseAResult.target_audience}
Value Proposition: ${phaseAResult.value_proposition}

Web Research Results:
${searchContext}

Generate 10-15 high-potential keywords with estimated metrics.
Language: ${options.language || 'en'}
`;

    return llmClient.jsonPrompt<PhaseCResult>(ANALYSIS_PROMPTS.PHASE_C, userPrompt);
  }

  // Phase D: Competitor Analysis
  async analyzeCompetitors(
    options: AnalyzeOptions,
    phaseAResult: PhaseAResult
  ): Promise<PhaseDResult> {
    // Search for competitors
    const queries = RESEARCH_QUERIES.forCompetitorAnalysis(options.productName);
    const searchResults = await tavilyClient.researchTopic(options.productName, queries);

    // Compile competitor information
    let competitorContext = '';
    const seenUrls = new Set<string>();

    for (const [, results] of searchResults) {
      for (const result of results.results) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          competitorContext += `\nURL: ${result.url}\nTitle: ${result.title}\nContent: ${result.content.slice(0, 300)}...\n`;
        }
      }
    }

    const userPrompt = `
Analyze competitors for this product:

Product: ${options.productName}
Value Proposition: ${phaseAResult.value_proposition}

Competitor Research:
${competitorContext}

Identify key competitors, their strengths, and content gaps we can exploit.
Language: ${options.language || 'en'}
`;

    return llmClient.jsonPrompt<PhaseDResult>(ANALYSIS_PROMPTS.PHASE_D, userPrompt);
  }

  // Phase E: Cluster Generation
  async generateClusters(
    options: AnalyzeOptions,
    phaseAResult: PhaseAResult,
    phaseBResult: PhaseBResult,
    phaseCResult: PhaseCResult,
    phaseDResult: PhaseDResult
  ): Promise<PhaseEResult> {
    const userPrompt = `
Create a content cluster plan for this product:

Product: ${options.productName}
Target Audience: ${phaseAResult.target_audience}
Value Proposition: ${phaseAResult.value_proposition}

Purchase Funnel Stages:
${JSON.stringify(phaseBResult.purchase_funnel, null, 2)}

Target Keywords:
${phaseCResult.keywords.map((k) => `- ${k.keyword} (vol: ${k.search_volume}, diff: ${k.difficulty}, intent: ${k.intent})`).join('\n')}

Competitor Gaps:
${phaseDResult.competitors.map((c) => `- ${c.title}: ${c.gaps.join(', ')}`).join('\n')}

Create 2-3 topic clusters with pillar content and supporting articles.
Each cluster should target different stages of the purchase funnel.
Language: ${options.language || 'en'}
`;

    return llmClient.jsonPrompt<PhaseEResult>(ANALYSIS_PROMPTS.PHASE_E, userPrompt);
  }

  // Run full analysis pipeline
  async analyze(options: AnalyzeOptions): Promise<ProductAnalysisResult> {
    // Phase A: Product Analysis
    const phaseA = await this.analyzeProduct(options);

    // Phase B: Purchase Funnel
    const phaseB = await this.analyzePurchaseFunnel(options, phaseA);

    // Phase C: Keyword Research
    const phaseC = await this.researchKeywords(options, phaseA);

    // Phase D: Competitor Analysis
    const phaseD = await this.analyzeCompetitors(options, phaseA);

    // Phase E: Cluster Generation
    const phaseE = await this.generateClusters(
      options,
      phaseA,
      phaseB,
      phaseC,
      phaseD
    );

    return {
      phaseA,
      phaseB,
      phaseC,
      phaseD,
      phaseE,
    };
  }
}

// Default instance
export const productAnalyzer = new ProductAnalyzer();
