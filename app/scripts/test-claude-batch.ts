#!/usr/bin/env npx tsx
/**
 * Claude Batch API Integration Test
 *
 * 実行: npx tsx scripts/test-claude-batch.ts
 *
 * テスト内容:
 * 1. バッチ作成
 * 2. ステータス確認
 * 3. 結果取得
 */

import 'dotenv/config';
import {
  ClaudeBatchClient,
  createArticleBatchRequests,
  mapBatchResultsToArticles,
  type BatchRequest,
  type BatchStatus,
} from '../src/lib/ai/claude-batch-client';

// ============================================
// テスト設定
// ============================================

const TEST_REQUESTS: BatchRequest[] = [
  {
    customId: 'test-001',
    model: 'claude-haiku-4-5',
    maxTokens: 100,
    system: 'You are a helpful assistant. Keep responses brief.',
    messages: [{ role: 'user', content: 'Say "Hello, Batch API!" and nothing else.' }],
  },
  {
    customId: 'test-002',
    model: 'claude-haiku-4-5',
    maxTokens: 100,
    system: 'You are a helpful assistant. Keep responses brief.',
    messages: [{ role: 'user', content: 'Say "Batch processing works!" and nothing else.' }],
  },
];

// ============================================
// メインテスト
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('Claude Batch API Integration Test');
  console.log('='.repeat(60));
  console.log();

  // API キー確認
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set');
    process.exit(1);
  }
  console.log('✅ ANTHROPIC_API_KEY is configured');
  console.log();

  try {
    const client = new ClaudeBatchClient();

    // ============================================
    // Test 1: バッチ作成
    // ============================================
    console.log('1. Creating batch with 2 requests...');
    const createResult = await client.createBatch(TEST_REQUESTS);

    console.log(`   ✅ Batch created: ${createResult.batchId}`);
    console.log(`   Status: ${createResult.status}`);
    console.log(`   Expires at: ${createResult.expiresAt}`);
    console.log();

    // ============================================
    // Test 2: ステータス確認
    // ============================================
    console.log('2. Checking batch status...');
    const status = await client.getBatchStatus(createResult.batchId);

    console.log(`   ✅ Status retrieved`);
    console.log(`   Processing status: ${status.processingStatus}`);
    console.log(`   Request counts:`, status.requestCounts);
    console.log();

    // ============================================
    // Test 3: 完了まで待機（短いポーリング間隔でテスト）
    // ============================================
    console.log('3. Waiting for batch completion...');
    console.log('   (Polling every 10 seconds, max 5 minutes)');

    let completedStatus: BatchStatus;
    try {
      completedStatus = await client.waitForCompletion(createResult.batchId, {
        pollIntervalMs: 10000, // 10秒（テスト用）
        maxWaitMs: 5 * 60 * 1000, // 5分
        onProgress: (s) => {
          console.log(
            `   ... ${s.processingStatus}: ${s.requestCounts.succeeded} succeeded, ${s.requestCounts.processing} processing`
          );
        },
      });

      console.log(`   ✅ Batch completed!`);
      console.log(`   Final status: ${completedStatus.processingStatus}`);
      console.log(`   Request counts:`, completedStatus.requestCounts);
      console.log();

      // ============================================
      // Test 4: 結果取得
      // ============================================
      console.log('4. Retrieving results...');
      const results = await client.getAllResults(createResult.batchId);

      console.log(`   ✅ Retrieved ${results.length} results`);
      console.log();

      for (const result of results) {
        console.log(`   [${result.customId}]`);
        console.log(`   Type: ${result.type}`);
        if (result.content) {
          console.log(`   Content: "${result.content.trim()}"`);
        }
        if (result.usage) {
          console.log(`   Tokens: ${result.usage.inputTokens} in, ${result.usage.outputTokens} out`);
        }
        if (result.error) {
          console.log(`   Error: ${result.error.type} - ${result.error.message}`);
        }
        console.log();
      }
    } catch (error) {
      // タイムアウトの場合はバッチをキャンセル
      console.log(`   ⚠️ Timeout or error: ${error}`);
      console.log('   Canceling batch...');

      const cancelStatus = await client.cancelBatch(createResult.batchId);
      console.log(`   Canceled. Status: ${cancelStatus.processingStatus}`);
      console.log();
    }

    // ============================================
    // Test 5: バッチ一覧
    // ============================================
    console.log('5. Listing recent batches...');
    const batches = await client.listBatches(5);

    console.log(`   ✅ Found ${batches.length} batches`);
    for (const batch of batches) {
      console.log(
        `   - ${batch.batchId}: ${batch.processingStatus} (${batch.requestCounts.succeeded}/${batch.requestCounts.processing + batch.requestCounts.succeeded + batch.requestCounts.errored})`
      );
    }
    console.log();

    // ============================================
    // Test 6: 記事生成ヘルパーのテスト
    // ============================================
    console.log('6. Testing article batch helpers...');

    const articleRequests = createArticleBatchRequests([
      {
        articleId: 'article-test-001',
        keyword: 'React Hooks',
        productName: 'Test Product',
        language: 'ja',
      },
    ]);

    console.log(`   ✅ Created ${articleRequests.length} article request(s)`);
    console.log(`   Custom ID: ${articleRequests[0].customId}`);
    console.log(`   Model: ${articleRequests[0].model || 'default'}`);
    console.log();

    // ============================================
    // 完了
    // ============================================
    console.log('='.repeat(60));
    console.log('All tests completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
