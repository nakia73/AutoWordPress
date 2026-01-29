#!/usr/bin/env npx tsx

/**
 * Argo Note - Article Generator CLI
 *
 * Usage:
 *   npx tsx scripts/argo-gen.ts generate --keyword "タスク管理" --type article --lang ja
 *   npx tsx scripts/argo-gen.ts generate --keyword "Project Management" --type faq --lang en --images
 *   npx tsx scripts/argo-gen.ts batch --input keywords.txt --output ./output
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

// Load environment variables
import { config } from 'dotenv';
config({ path: join(__dirname, '../.env.local') });
config({ path: join(__dirname, '../.env') });

import { articleGenerator } from '../src/lib/ai/article-generator';
import type { ArticleType, ArticleContent } from '../src/types';

// Parse command line arguments
function parseArgs(): {
  command: string;
  options: Record<string, string | boolean>;
} {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: Record<string, string | boolean> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return { command, options };
}

// Format duration
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

// Save article to file
function saveArticle(
  article: ArticleContent,
  outputDir: string,
  format: 'html' | 'json' | 'both' = 'both'
): { htmlPath?: string; jsonPath?: string } {
  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const slug = article.title
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseName = `${slug}-${timestamp}`;

  const result: { htmlPath?: string; jsonPath?: string } = {};

  if (format === 'html' || format === 'both') {
    const htmlPath = join(outputDir, `${baseName}.html`);
    const htmlContent = `<!DOCTYPE html>
<html lang="${article.article_type === 'article' ? 'ja' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${article.meta_description}">
  <title>${article.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
    p { margin: 1rem 0; }
    ul, ol { margin: 1rem 0; padding-left: 2rem; }
    img { max-width: 100%; height: auto; }
    code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; }
  </style>
</head>
<body>
${article.content}
</body>
</html>`;
    writeFileSync(htmlPath, htmlContent);
    result.htmlPath = htmlPath;
  }

  if (format === 'json' || format === 'both') {
    const jsonPath = join(outputDir, `${baseName}.json`);
    const metadata = {
      title: article.title,
      target_keyword: article.target_keyword,
      article_type: article.article_type,
      meta_description: article.meta_description,
      search_intent: article.search_intent,
      word_count: article.content.replace(/<[^>]*>/g, '').length,
      section_images_generated: article.sectionImagesGenerated || 0,
      generated_at: new Date().toISOString(),
    };
    writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
    result.jsonPath = jsonPath;
  }

  return result;
}

// Generate command
async function generateCommand(options: Record<string, string | boolean>) {
  const keyword = options.keyword as string;
  const productName = (options.product as string) || 'Generic Product';
  const productDescription = (options.description as string) || 'A product or service';
  const articleType = (options.type as ArticleType) || 'article';
  const language = (options.lang as 'ja' | 'en') || 'ja';
  const includeImages = !!options.images;
  const outputDir = (options.output as string) || './output';
  const format = (options.format as 'html' | 'json' | 'both') || 'both';

  if (!keyword) {
    console.error('Error: --keyword is required');
    process.exit(1);
  }

  console.log('\n=== Argo Note Article Generator ===\n');
  console.log(`Keyword: ${keyword}`);
  console.log(`Type: ${articleType}`);
  console.log(`Language: ${language}`);
  console.log(`Include Images: ${includeImages}`);
  console.log('');

  const startTime = Date.now();

  try {
    console.log('Generating article...\n');

    const article = await articleGenerator.generate({
      targetKeyword: keyword,
      productName,
      productDescription,
      articleType,
      language,
      includeImages,
    });

    const duration = Date.now() - startTime;
    const wordCount = article.content.replace(/<[^>]*>/g, '').length;

    console.log('\n=== Generation Complete ===\n');
    console.log(`Title: ${article.title}`);
    console.log(`Word Count: ${wordCount.toLocaleString()}`);
    console.log(`Duration: ${formatDuration(duration)}`);

    // Save files
    const saved = saveArticle(article, outputDir, format);
    console.log('\nFiles saved:');
    if (saved.htmlPath) console.log(`  HTML: ${saved.htmlPath}`);
    if (saved.jsonPath) console.log(`  JSON: ${saved.jsonPath}`);

    console.log('\nDone!');
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Batch command
async function batchCommand(options: Record<string, string | boolean>) {
  const inputFile = options.input as string;
  const outputDir = (options.output as string) || './output';
  const parallel = parseInt((options.parallel as string) || '1', 10);
  const format = (options.format as 'html' | 'json' | 'both') || 'both';

  if (!inputFile) {
    console.error('Error: --input is required');
    process.exit(1);
  }

  if (!existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const lines = readFileSync(inputFile, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'));

  console.log('\n=== Argo Note Batch Generator ===\n');
  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Tasks: ${lines.length}`);
  console.log(`Parallel: ${parallel}`);
  console.log('');

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  // Process in batches
  for (let i = 0; i < lines.length; i += parallel) {
    const batch = lines.slice(i, i + parallel);
    const promises = batch.map(async (line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      const keyword = parts[0];
      const articleType = (parts[1] as ArticleType) || 'article';
      const language = (parts[2] as 'ja' | 'en') || 'ja';

      const taskNum = i + idx + 1;
      console.log(`[${taskNum}/${lines.length}] Generating: ${keyword}`);

      try {
        const article = await articleGenerator.generate({
          targetKeyword: keyword,
          productName: 'Generic Product',
          productDescription: 'A product or service',
          articleType,
          language,
          includeImages: false,
        });

        saveArticle(article, outputDir, format);
        console.log(`[${taskNum}/${lines.length}] Done: ${article.title}`);
        successCount++;
      } catch (error) {
        console.error(`[${taskNum}/${lines.length}] Error: ${error instanceof Error ? error.message : error}`);
        errorCount++;
      }
    });

    await Promise.all(promises);
  }

  const duration = Date.now() - startTime;
  console.log('\n=== Batch Complete ===\n');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Duration: ${formatDuration(duration)}`);
}

// Help command
function helpCommand() {
  console.log(`
Argo Note - Article Generator CLI

Usage:
  npx tsx scripts/argo-gen.ts <command> [options]

Commands:
  generate    Generate a single article
  batch       Generate multiple articles from a file
  help        Show this help message

Generate Options:
  --keyword <text>       Target keyword (required)
  --product <name>       Product name (default: Generic Product)
  --description <text>   Product description
  --type <type>          Article type: article, faq, glossary (default: article)
  --lang <lang>          Language: ja, en (default: ja)
  --images               Include image generation
  --output <dir>         Output directory (default: ./output)
  --format <format>      Output format: html, json, both (default: both)

Batch Options:
  --input <file>         Input file with keywords (required)
  --output <dir>         Output directory (default: ./output)
  --parallel <n>         Parallel tasks (default: 1)
  --format <format>      Output format: html, json, both (default: both)

Input File Format (CSV):
  keyword,type,language
  タスク管理ツール 比較,article,ja
  Project Management Tips,faq,en

Examples:
  # Generate a single article
  npx tsx scripts/argo-gen.ts generate --keyword "タスク管理" --type article --lang ja

  # Generate with images
  npx tsx scripts/argo-gen.ts generate --keyword "AI Tools" --lang en --images

  # Batch generation
  npx tsx scripts/argo-gen.ts batch --input keywords.txt --output ./articles --parallel 2
`);
}

// Main
async function main() {
  const { command, options } = parseArgs();

  switch (command) {
    case 'generate':
      await generateCommand(options);
      break;
    case 'batch':
      await batchCommand(options);
      break;
    case 'help':
    default:
      helpCommand();
      break;
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
