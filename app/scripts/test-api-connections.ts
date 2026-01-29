#!/usr/bin/env npx tsx
/**
 * Stream A API Connection Tests
 * 各APIキーの動作確認テスト
 *
 * 実行: npx tsx scripts/test-api-connections.ts
 */

import 'dotenv/config';

// 結果を保存
const results: { name: string; status: 'success' | 'fail'; message: string; latency?: number }[] = [];

// ============================================
// 1. Gemini API テスト
// ============================================
async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, message: 'GEMINI_API_KEY not configured' };
  }

  const model = 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "Hello" and nothing else.' }] }],
        generationConfig: { maxOutputTokens: 50 },
      }),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: `HTTP ${response.status}: ${error}`, latency };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { success: true, message: `Response: "${text.trim()}"`, latency };
  } catch (error) {
    return { success: false, message: `Error: ${error}`, latency: Date.now() - start };
  }
}

// ============================================
// 2. Anthropic Claude API テスト
// ============================================
async function testClaudeAPI() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === '' || apiKey === 'sk-ant-...') {
    return { success: false, message: 'ANTHROPIC_API_KEY not configured' };
  }

  const url = 'https://api.anthropic.com/v1/messages';
  const model = 'claude-haiku-4-5';

  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say "Hello" and nothing else.' }],
      }),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: `HTTP ${response.status}: ${error}`, latency };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return { success: true, message: `Response: "${text.trim()}"`, latency };
  } catch (error) {
    return { success: false, message: `Error: ${error}`, latency: Date.now() - start };
  }
}

// ============================================
// 3. Tavily Search API テスト
// ============================================
async function testTavilyAPI() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey === '' || apiKey === 'tvly-...') {
    return { success: false, message: 'TAVILY_API_KEY not configured' };
  }

  const url = 'https://api.tavily.com/search';

  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: 'test query',
        max_results: 1,
      }),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: `HTTP ${response.status}: ${error}`, latency };
    }

    const data = await response.json();
    const resultCount = data.results?.length || 0;
    return { success: true, message: `Got ${resultCount} results`, latency };
  } catch (error) {
    return { success: false, message: `Error: ${error}`, latency: Date.now() - start };
  }
}

// ============================================
// 4. kie.ai API テスト (非同期なのでタスク作成のみ)
// ============================================
async function testKieAiAPI() {
  const apiKey = process.env.KIE_AI_API_KEY;
  if (!apiKey || apiKey === '' || apiKey === '...') {
    return { success: false, message: 'KIE_AI_API_KEY not configured' };
  }

  const url = 'https://api.kie.ai/api/v1/jobs/createTask';

  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'nano-banana-pro',
        input: {
          prompt: 'A simple test image of a blue circle',
          aspect_ratio: '1:1',
          resolution: '1K',
        },
      }),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: `HTTP ${response.status}: ${error}`, latency };
    }

    const data = await response.json();
    if (data.code === 200 && data.data?.taskId) {
      return { success: true, message: `Task created: ${data.data.taskId}`, latency };
    } else {
      return { success: false, message: `API error: ${data.msg || data.message || JSON.stringify(data)}`, latency };
    }
  } catch (error) {
    return { success: false, message: `Error: ${error}`, latency: Date.now() - start };
  }
}

// ============================================
// 5. Google Gemini Image API テスト
// ============================================
async function testGoogleImageAPI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === '' || apiKey === '...') {
    return { success: false, message: 'GOOGLE_API_KEY not configured' };
  }

  // まずモデルが利用可能か確認
  const model = 'gemini-3-pro-image-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Generate a simple blue circle image' }] }],
        generationConfig: {
          response_modalities: ['IMAGE'],
        },
      }),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const error = await response.text();
      // モデルが見つからない場合は代替チェック
      if (response.status === 404) {
        return { success: false, message: `Model ${model} not available. Check model name.`, latency };
      }
      return { success: false, message: `HTTP ${response.status}: ${error.slice(0, 200)}`, latency };
    }

    const data = await response.json();
    const hasImage = data.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
    return { success: true, message: hasImage ? 'Image generated successfully' : 'Text response (no image)', latency };
  } catch (error) {
    return { success: false, message: `Error: ${error}`, latency: Date.now() - start };
  }
}

// ============================================
// メイン実行
// ============================================
async function main() {
  console.log('='.repeat(60));
  console.log('Stream A - API Connection Tests');
  console.log('='.repeat(60));
  console.log();

  // 1. Gemini API
  console.log('1. Testing Gemini API (gemini-3-flash-preview)...');
  const geminiResult = await testGeminiAPI();
  results.push({
    name: 'Gemini API',
    status: geminiResult.success ? 'success' : 'fail',
    message: geminiResult.message,
    latency: geminiResult.latency,
  });
  console.log(`   ${geminiResult.success ? '✅' : '❌'} ${geminiResult.message}`);
  if (geminiResult.latency) console.log(`   Latency: ${geminiResult.latency}ms`);
  console.log();

  // 2. Claude API
  console.log('2. Testing Anthropic Claude API (claude-haiku-4-5)...');
  const claudeResult = await testClaudeAPI();
  results.push({
    name: 'Claude API',
    status: claudeResult.success ? 'success' : 'fail',
    message: claudeResult.message,
    latency: claudeResult.latency,
  });
  console.log(`   ${claudeResult.success ? '✅' : '❌'} ${claudeResult.message}`);
  if (claudeResult.latency) console.log(`   Latency: ${claudeResult.latency}ms`);
  console.log();

  // 3. Tavily API
  console.log('3. Testing Tavily Search API...');
  const tavilyResult = await testTavilyAPI();
  results.push({
    name: 'Tavily API',
    status: tavilyResult.success ? 'success' : 'fail',
    message: tavilyResult.message,
    latency: tavilyResult.latency,
  });
  console.log(`   ${tavilyResult.success ? '✅' : '❌'} ${tavilyResult.message}`);
  if (tavilyResult.latency) console.log(`   Latency: ${tavilyResult.latency}ms`);
  console.log();

  // 4. kie.ai API
  console.log('4. Testing kie.ai NanoBanana Pro API...');
  const kieResult = await testKieAiAPI();
  results.push({
    name: 'kie.ai API',
    status: kieResult.success ? 'success' : 'fail',
    message: kieResult.message,
    latency: kieResult.latency,
  });
  console.log(`   ${kieResult.success ? '✅' : '❌'} ${kieResult.message}`);
  if (kieResult.latency) console.log(`   Latency: ${kieResult.latency}ms`);
  console.log();

  // 5. Google Image API
  console.log('5. Testing Google Gemini Image API (gemini-3-pro-image-preview)...');
  const googleImageResult = await testGoogleImageAPI();
  results.push({
    name: 'Google Image API',
    status: googleImageResult.success ? 'success' : 'fail',
    message: googleImageResult.message,
    latency: googleImageResult.latency,
  });
  console.log(`   ${googleImageResult.success ? '✅' : '❌'} ${googleImageResult.message}`);
  if (googleImageResult.latency) console.log(`   Latency: ${googleImageResult.latency}ms`);
  console.log();

  // サマリー
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'fail').length;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  console.log();

  results.forEach(r => {
    console.log(`${r.status === 'success' ? '✅' : '❌'} ${r.name}: ${r.message}`);
  });

  // 終了コード
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
