/**
 * Image Generation Test Script
 *
 * テスト内容:
 * 1. ImageGenerator でサムネイル画像を生成
 * 2. SectionImageService でセクション画像を生成
 *
 * 実行方法:
 * npx tsx scripts/test-image-generation.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import 'dotenv/config';

// テスト用のモックコンテンツ
const TEST_TITLE = 'Claude AIを使った効率的なプログラミング入門';
const TEST_BODY = `
<h1>Claude AIを使った効率的なプログラミング入門</h1>
<p>近年、AIを活用したプログラミング支援ツールが注目を集めています。特にClaude AIは、コード生成から説明、デバッグまで幅広いタスクをサポートできる強力なツールです。</p>

<h2>Claude AIとは何か</h2>
<p>Claude AIはAnthropic社が開発した大規模言語モデルです。自然言語処理に優れ、プログラミングの質問に対して詳細で正確な回答を提供できます。コードの生成、レビュー、説明など多様なタスクに対応しています。</p>

<h2>プログラミング効率化の3つの方法</h2>
<p>Claude AIを活用することで、以下の3つの方法でプログラミング効率を向上させることができます。</p>
<ul>
  <li>コード生成: 要件を伝えるだけで実装コードを生成</li>
  <li>デバッグ支援: エラーメッセージから原因を特定</li>
  <li>コードレビュー: ベストプラクティスに基づいた改善提案</li>
</ul>

<h2>実践的な使い方のコツ</h2>
<p>効果的にClaude AIを活用するためのコツを紹介します。具体的なコンテキストを提供し、段階的に質問を進めることで、より良い結果が得られます。</p>

<h3>プロンプトの書き方</h3>
<p>明確で具体的なプロンプトを書くことが重要です。何を達成したいのか、どのような制約があるのかを明示しましょう。</p>

<h2>まとめ</h2>
<p>Claude AIは、プログラミングの効率を大幅に向上させる強力なツールです。適切に活用することで、開発時間を短縮し、コード品質を向上させることができます。</p>
`;

async function testImageGeneration() {
  console.log('='.repeat(60));
  console.log('Image Generation Test');
  console.log('='.repeat(60));
  console.log('');

  // Check API keys
  const kieApiKey = process.env.KIE_AI_API_KEY;
  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  console.log('API Keys Status:');
  console.log(`  - KIE_AI_API_KEY: ${kieApiKey ? '✓ Set' : '✗ Not set'}`);
  console.log(`  - GOOGLE_API_KEY: ${googleApiKey ? '✓ Set' : '✗ Not set'}`);
  console.log('');

  if (!kieApiKey && !googleApiKey) {
    console.error('❌ No API keys configured. Cannot proceed with image generation.');
    process.exit(1);
  }

  // Dynamic import to ensure env vars are loaded
  const { imageGenerator } = await import('../src/lib/ai/image-generator');
  const { sectionImageService } = await import('../src/lib/ai/section-image-service');

  // Create output directory
  const outputDir = path.join(process.cwd(), 'test-results', 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Test 1: Thumbnail Generation
  console.log('━'.repeat(60));
  console.log('Test 1: Thumbnail Generation');
  console.log('━'.repeat(60));
  console.log(`Title: ${TEST_TITLE}`);
  console.log('');

  try {
    console.log('Generating thumbnail...');
    const startTime = Date.now();

    const thumbnailResult = await imageGenerator.generateThumbnail(
      TEST_TITLE,
      TEST_BODY
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (thumbnailResult.isFallback) {
      console.log(`❌ Thumbnail generation failed: ${thumbnailResult.errorMessage}`);
    } else {
      const outputPath = path.join(outputDir, 'thumbnail.png');
      fs.writeFileSync(outputPath, thumbnailResult.imageData);

      console.log(`✓ Thumbnail generated successfully!`);
      console.log(`  - Provider: ${thumbnailResult.provider}`);
      console.log(`  - Duration: ${duration}s`);
      console.log(`  - File size: ${(thumbnailResult.imageData.length / 1024).toFixed(1)} KB`);
      console.log(`  - Saved to: ${outputPath}`);
      console.log(`  - Prompt used (first 200 chars):`);
      console.log(`    ${thumbnailResult.promptUsed.slice(0, 200)}...`);
    }
  } catch (error) {
    console.error(`❌ Thumbnail generation error:`, error);
  }

  console.log('');

  // Test 2: Section Image Generation
  console.log('━'.repeat(60));
  console.log('Test 2: Section Image Generation');
  console.log('━'.repeat(60));
  console.log('');

  try {
    console.log('Processing article for section images (max 2 for testing)...');
    const startTime = Date.now();

    const sectionResult = await sectionImageService.processArticleImages(
      TEST_BODY,
      TEST_TITLE,
      { maxImages: 2 }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✓ Section image processing completed!`);
    console.log(`  - Duration: ${duration}s`);
    console.log(`  - Images generated: ${sectionResult.imagesGenerated}`);

    if (sectionResult.errors.length > 0) {
      console.log(`  - Errors:`);
      sectionResult.errors.forEach(err => console.log(`    - ${err}`));
    }

    // Save processed HTML
    const htmlOutputPath = path.join(outputDir, 'processed-article.html');

    // Extract base64 images and save them separately
    const imgRegex = /src="data:image\/png;base64,([^"]+)"/g;
    let match;
    let imgIndex = 0;
    let processedHtml = sectionResult.processedHtml;

    while ((match = imgRegex.exec(sectionResult.processedHtml)) !== null) {
      const imgPath = path.join(outputDir, `section-${imgIndex + 1}.png`);
      const imgBuffer = Buffer.from(match[1], 'base64');
      fs.writeFileSync(imgPath, imgBuffer);
      console.log(`  - Saved section image: section-${imgIndex + 1}.png (${(imgBuffer.length / 1024).toFixed(1)} KB)`);

      // Replace data URL with local file reference in HTML
      processedHtml = processedHtml.replace(
        `data:image/png;base64,${match[1]}`,
        `section-${imgIndex + 1}.png`
      );
      imgIndex++;
    }

    // Add basic HTML wrapper
    const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${TEST_TITLE}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a1a1a; }
    h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h3 { color: #555; }
    figure { margin: 20px 0; text-align: center; }
    figure img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
${processedHtml}
</body>
</html>`;

    fs.writeFileSync(htmlOutputPath, fullHtml);
    console.log(`  - Saved HTML: ${htmlOutputPath}`);

  } catch (error) {
    console.error(`❌ Section image generation error:`, error);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Test Complete!');
  console.log('='.repeat(60));
  console.log(`Output directory: ${outputDir}`);
  console.log('');
  console.log('Open processed-article.html in a browser to view the results.');
}

testImageGeneration().catch(console.error);
