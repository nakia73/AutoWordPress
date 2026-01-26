// Argo Note - Fact Checker Service
// Based on: docs/architecture/09_Critical_Issues_Report.md CI-001
// Validates article content for factual accuracy

import { llmClient } from './llm-client';
import { tavilyClient } from './tavily-client';

type FactCheckClaim = {
  claim: string;
  location: string; // e.g., "paragraph 2" or line reference
  source?: string;
};

type FactCheckResult = {
  claim: string;
  status: 'verified' | 'unverified' | 'disputed' | 'outdated';
  confidence: number; // 0-1
  sources: Array<{
    url: string;
    title: string;
    excerpt: string;
  }>;
  suggestion?: string;
};

type FactCheckReport = {
  overallScore: number; // 0-100
  totalClaims: number;
  verifiedClaims: number;
  unverifiedClaims: number;
  disputedClaims: number;
  outdatedClaims: number;
  results: FactCheckResult[];
  recommendations: string[];
};

const FACT_CHECK_PROMPTS = {
  EXTRACT_CLAIMS: `You are a fact-checking assistant. Your task is to extract factual claims from the given article content.

Extract only claims that:
1. Are verifiable facts (statistics, dates, technical specifications)
2. Are specific product comparisons or features
3. Reference external sources or studies
4. Make definitive statements that could be true or false

Do NOT extract:
- Opinions or subjective statements
- Generic marketing language
- Self-evident truths

Return as JSON array:
[
  { "claim": "specific claim text", "location": "section or paragraph reference" }
]`,

  VERIFY_CLAIM: `You are a fact-checking assistant. Given a claim and search results, determine if the claim is:
- "verified": Multiple reliable sources confirm the claim
- "unverified": No reliable sources found to confirm or deny
- "disputed": Sources contradict the claim
- "outdated": Claim was true but is no longer accurate

Provide:
1. A status determination
2. A confidence score (0-1)
3. A suggestion for correction if needed

Return as JSON:
{
  "status": "verified|unverified|disputed|outdated",
  "confidence": 0.0-1.0,
  "suggestion": "optional correction suggestion"
}`,
};

export class FactChecker {
  // Extract verifiable claims from content
  async extractClaims(content: string): Promise<FactCheckClaim[]> {
    const response = await llmClient.jsonPrompt<FactCheckClaim[]>(
      FACT_CHECK_PROMPTS.EXTRACT_CLAIMS,
      `Extract factual claims from this article:\n\n${content.slice(0, 8000)}`
    );

    return response;
  }

  // Verify a single claim using web search
  async verifyClaim(claim: FactCheckClaim): Promise<FactCheckResult> {
    // Search for information about the claim
    const searchResults = await tavilyClient.search(claim.claim, {
      searchDepth: 'basic',
      maxResults: 5,
    });

    // Format search results for LLM
    const sourcesContext = searchResults.results
      .map(
        (r) =>
          `Source: ${r.title}\nURL: ${r.url}\nContent: ${r.content.slice(0, 500)}`
      )
      .join('\n\n');

    // Ask LLM to verify the claim
    const verificationPrompt = `
Claim to verify: "${claim.claim}"

Search Results:
${sourcesContext}

Based on these sources, verify the claim.`;

    const verification = await llmClient.jsonPrompt<{
      status: 'verified' | 'unverified' | 'disputed' | 'outdated';
      confidence: number;
      suggestion?: string;
    }>(FACT_CHECK_PROMPTS.VERIFY_CLAIM, verificationPrompt);

    return {
      claim: claim.claim,
      status: verification.status,
      confidence: verification.confidence,
      sources: searchResults.results.slice(0, 3).map((r) => ({
        url: r.url,
        title: r.title,
        excerpt: r.content.slice(0, 200),
      })),
      suggestion: verification.suggestion,
    };
  }

  // Run full fact check on article content
  async checkArticle(content: string): Promise<FactCheckReport> {
    // Extract claims
    const claims = await this.extractClaims(content);

    // Limit to most important claims (prevent excessive API calls)
    const claimsToCheck = claims.slice(0, 10);

    // Verify each claim
    const results: FactCheckResult[] = [];
    for (const claim of claimsToCheck) {
      try {
        const result = await this.verifyClaim(claim);
        results.push(result);
      } catch {
        // If verification fails, mark as unverified
        results.push({
          claim: claim.claim,
          status: 'unverified',
          confidence: 0,
          sources: [],
          suggestion: 'Could not verify this claim due to an error.',
        });
      }
    }

    // Calculate statistics
    const verifiedClaims = results.filter((r) => r.status === 'verified').length;
    const unverifiedClaims = results.filter((r) => r.status === 'unverified').length;
    const disputedClaims = results.filter((r) => r.status === 'disputed').length;
    const outdatedClaims = results.filter((r) => r.status === 'outdated').length;

    // Calculate overall score
    const overallScore = Math.round(
      (verifiedClaims / Math.max(results.length, 1)) * 100
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (disputedClaims > 0) {
      recommendations.push(
        `${disputedClaims} claim(s) are disputed by sources. Review and correct these.`
      );
    }
    if (outdatedClaims > 0) {
      recommendations.push(
        `${outdatedClaims} claim(s) may be outdated. Update with current information.`
      );
    }
    if (unverifiedClaims > results.length / 2) {
      recommendations.push(
        'Many claims could not be verified. Consider adding more citations.'
      );
    }
    if (overallScore < 70) {
      recommendations.push(
        'Overall factual accuracy is low. Manual review recommended before publishing.'
      );
    }

    return {
      overallScore,
      totalClaims: results.length,
      verifiedClaims,
      unverifiedClaims,
      disputedClaims,
      outdatedClaims,
      results,
      recommendations,
    };
  }

  // Quick check for obvious issues (faster, less thorough)
  async quickCheck(content: string): Promise<{
    passed: boolean;
    issues: string[];
  }> {
    const checkPrompt = `Analyze this article content for obvious factual issues, outdated information, or suspicious claims.

Content:
${content.slice(0, 4000)}

Return JSON:
{
  "issues": ["list of potential factual issues"],
  "riskLevel": "low|medium|high"
}`;

    const result = await llmClient.jsonPrompt<{
      issues: string[];
      riskLevel: 'low' | 'medium' | 'high';
    }>(
      'You are a content reviewer checking for factual accuracy issues.',
      checkPrompt
    );

    return {
      passed: result.riskLevel === 'low',
      issues: result.issues,
    };
  }
}

// Default instance
export const factChecker = new FactChecker();
