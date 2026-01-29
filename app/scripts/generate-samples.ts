#!/usr/bin/env npx tsx

/**
 * Sample Article Generator for Quality Evaluation
 *
 * Generates 10 sample articles using the keywords in sample-keywords.txt
 * Output is saved to ./output/samples/ with timestamp
 *
 * Usage:
 *   npx tsx scripts/generate-samples.ts
 *
 * Requirements:
 *   - TAVILY_API_KEY: For Tavily semantic search
 *   - GOOGLE_API_KEY: For Gemini LLM
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
import { config } from 'dotenv';
config({ path: join(__dirname, '../.env.local') });
config({ path: join(__dirname, '../.env') });

import { articleGenerator } from '../src/lib/ai/article-generator';
import type { ArticleType, ArticleContent } from '../src/types';

// Quality evaluation criteria from StreamA_Quality_Checklist.md
interface QualityScore {
  structure: number; // 25 points
  seo: number; // 25 points
  content: number; // 30 points
  image: number; // 10 points
  technical: number; // 10 points
  total: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

function evaluateArticle(article: ArticleContent): QualityScore {
  let structure = 0;
  let seo = 0;
  let content = 0;
  let image = 0;
  let technical = 0;

  const htmlContent = article.content;
  const plainText = htmlContent.replace(/<[^>]*>/g, '');

  // Structure (25 points)
  const h1Count = (htmlContent.match(/<h1>/g) || []).length;
  const h2Count = (htmlContent.match(/<h2>/g) || []).length;
  const h3Count = (htmlContent.match(/<h3>/g) || []).length;
  const pCount = (htmlContent.match(/<p>/g) || []).length;
  const listCount = (htmlContent.match(/<ul>|<ol>/g) || []).length;

  if (h1Count === 1) structure += 7; // H1 is exactly 1
  if (h2Count >= 3 && h2Count <= 7) structure += 7; // H2 count is appropriate
  if (h3Count <= h2Count * 3) structure += 4; // H3 hierarchy is proper
  if (pCount >= 3) structure += 4; // Has paragraphs
  if (listCount >= 1) structure += 3; // Has lists/tables

  // SEO (25 points)
  if (article.title.includes(article.target_keyword.split(' ')[0])) seo += 8; // Keyword in title
  if (article.meta_description && article.meta_description.length <= 160) seo += 7; // Meta description
  if (plainText.length >= 1000) seo += 5; // Sufficient content
  if (htmlContent.includes(article.target_keyword)) seo += 5; // Keyword in content

  // Content (30 points)
  const wordCount = plainText.length;
  const targetMinLength =
    article.article_type === 'article' ? 2500 :
    article.article_type === 'faq' ? 1200 :
    800;
  const targetMaxLength =
    article.article_type === 'article' ? 5000 :
    article.article_type === 'faq' ? 3000 :
    2500;

  if (wordCount >= targetMinLength && wordCount <= targetMaxLength) content += 15;
  else if (wordCount >= targetMinLength * 0.7) content += 10;
  else if (wordCount >= targetMinLength * 0.5) content += 5;

  if (article.title.length > 10) content += 8; // Has meaningful title
  if (article.search_intent) content += 7; // Has search intent

  // Image (10 points)
  if (article.thumbnail?.imageData && article.thumbnail.imageData.length > 0) image += 5;
  if (article.sectionImagesGenerated && article.sectionImagesGenerated > 0) image += 5;

  // Technical (10 points)
  if (htmlContent.includes('<h1>') && htmlContent.includes('</h1>')) technical += 3;
  if (htmlContent.includes('<h2>') && htmlContent.includes('</h2>')) technical += 3;
  if (htmlContent.includes('<p>') && htmlContent.includes('</p>')) technical += 2;
  if (!htmlContent.includes('undefined') && !htmlContent.includes('null')) technical += 2;

  const total = structure + seo + content + image + technical;
  const grade =
    total >= 90 ? 'A' :
    total >= 75 ? 'B' :
    total >= 60 ? 'C' : 'D';

  return { structure, seo, content, image, technical, total, grade };
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

async function main() {
  console.log('\n=== Sample Article Generator for Quality Evaluation ===\n');

  // Check API keys
  if (!process.env.TAVILY_API_KEY) {
    console.error('Error: TAVILY_API_KEY is not set');
    console.error('Please set the environment variable and try again.');
    process.exit(1);
  }

  if (!process.env.GOOGLE_API_KEY) {
    console.error('Error: GOOGLE_API_KEY is not set');
    console.error('Please set the environment variable and try again.');
    process.exit(1);
  }

  // Read keywords
  const keywordsPath = join(__dirname, 'sample-keywords.txt');
  if (!existsSync(keywordsPath)) {
    console.error(`Error: Keywords file not found: ${keywordsPath}`);
    process.exit(1);
  }

  const lines = readFileSync(keywordsPath, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'));

  console.log(`Keywords: ${lines.length}`);
  console.log('');

  // Create output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = join(__dirname, '../output/samples', timestamp);
  mkdirSync(outputDir, { recursive: true });

  // Create report file
  const reportPath = join(outputDir, 'quality-report.md');
  writeFileSync(reportPath, `# Quality Evaluation Report

> Generated: ${new Date().toISOString()}

## Summary

| # | Keyword | Type | Language | Score | Grade | Duration |
|---|---------|------|----------|-------|-------|----------|
`);

  const startTime = Date.now();
  const results: Array<{
    keyword: string;
    type: string;
    language: string;
    score: QualityScore;
    duration: number;
    error?: string;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    const keyword = parts[0];
    const articleType = (parts[1] as ArticleType) || 'article';
    const language = (parts[2] as 'ja' | 'en') || 'ja';

    console.log(`[${i + 1}/${lines.length}] Generating: ${keyword}`);
    const taskStart = Date.now();

    try {
      const article = await articleGenerator.generate({
        targetKeyword: keyword,
        productName: 'TestProduct',
        productDescription: 'A productivity tool for teams',
        articleType,
        language,
        includeImages: false, // Skip images for faster evaluation
      });

      const taskDuration = Date.now() - taskStart;
      const score = evaluateArticle(article);

      // Save article
      const slug = keyword
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);

      const htmlPath = join(outputDir, `${i + 1}-${slug}.html`);
      writeFileSync(htmlPath, `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${article.meta_description}">
  <title>${article.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
    p { margin: 1rem 0; }
    ul, ol { margin: 1rem 0; padding-left: 2rem; }
  </style>
</head>
<body>
${article.content}
<hr>
<footer>
  <p><strong>Quality Score:</strong> ${score.total}/100 (${score.grade})</p>
  <p><strong>Word Count:</strong> ${article.content.replace(/<[^>]*>/g, '').length}</p>
  <p><strong>Meta Description:</strong> ${article.meta_description}</p>
</footer>
</body>
</html>`);

      // Update report
      appendFileSync(reportPath, `| ${i + 1} | ${keyword} | ${articleType} | ${language} | ${score.total}/100 | ${score.grade} | ${formatDuration(taskDuration)} |\n`);

      results.push({ keyword, type: articleType, language, score, duration: taskDuration });

      console.log(`[${i + 1}/${lines.length}] Done: ${article.title} (Score: ${score.total}/100 ${score.grade})`);
    } catch (error) {
      const taskDuration = Date.now() - taskStart;
      const errorMsg = error instanceof Error ? error.message : String(error);

      appendFileSync(reportPath, `| ${i + 1} | ${keyword} | ${articleType} | ${language} | Error | - | ${formatDuration(taskDuration)} |\n`);
      results.push({ keyword, type: articleType, language, score: { structure: 0, seo: 0, content: 0, image: 0, technical: 0, total: 0, grade: 'D' }, duration: taskDuration, error: errorMsg });

      console.error(`[${i + 1}/${lines.length}] Error: ${errorMsg}`);
    }
  }

  const totalDuration = Date.now() - startTime;
  const successCount = results.filter((r) => !r.error).length;
  const avgScore = results.filter((r) => !r.error).reduce((sum, r) => sum + r.score.total, 0) / successCount || 0;

  // Finalize report
  appendFileSync(reportPath, `

## Detailed Breakdown

${results
  .filter((r) => !r.error)
  .map((r, i) => `### ${i + 1}. ${r.keyword}
- **Type:** ${r.type}
- **Language:** ${r.language}
- **Structure:** ${r.score.structure}/25
- **SEO:** ${r.score.seo}/25
- **Content:** ${r.score.content}/30
- **Image:** ${r.score.image}/10
- **Technical:** ${r.score.technical}/10
- **Total:** ${r.score.total}/100 (${r.score.grade})
`)
  .join('\n')}

## Statistics

- **Total Articles:** ${lines.length}
- **Success:** ${successCount}
- **Errors:** ${lines.length - successCount}
- **Average Score:** ${avgScore.toFixed(1)}/100
- **Total Duration:** ${formatDuration(totalDuration)}
- **Average Duration:** ${formatDuration(totalDuration / lines.length)}

## Grade Distribution

| Grade | Count |
|-------|-------|
| A (90+) | ${results.filter((r) => r.score.grade === 'A').length} |
| B (75-89) | ${results.filter((r) => r.score.grade === 'B').length} |
| C (60-74) | ${results.filter((r) => r.score.grade === 'C').length} |
| D (<60) | ${results.filter((r) => r.score.grade === 'D').length} |
`);

  console.log('\n=== Generation Complete ===\n');
  console.log(`Output directory: ${outputDir}`);
  console.log(`Report: ${reportPath}`);
  console.log(`Success: ${successCount}/${lines.length}`);
  console.log(`Average Score: ${avgScore.toFixed(1)}/100`);
  console.log(`Total Duration: ${formatDuration(totalDuration)}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
