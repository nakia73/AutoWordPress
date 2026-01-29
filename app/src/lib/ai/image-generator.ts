// Argo Note - Image Generator Service
// kie.ai NanoBanana Pro (primary) + Google API (fallback)
// Based on Rapid-Note2's thumbnail_service.py and create-anything's gemini.js
//
// 画像生成モデル一覧:
// - kie.ai NanoBanana Pro: $0.09/image (primary)
// - Google Gemini 3 Pro Image (gemini-3-pro-image-preview): $0.134/image (fallback)
//   ※ Google Gemini 3系の画像生成モデル（2026年1月リリース）

import { llmClient } from './llm-client';

// API Keys
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY || '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';

// kie.ai API configuration (primary)
const KIE_API_BASE = 'https://api.kie.ai/api/v1';
const KIE_MODEL = 'nano-banana-pro';

// Google API configuration (fallback)
// Gemini 3 Pro Image (2026年1月リリース)
const GOOGLE_IMAGE_MODEL = 'gemini-3-pro-image-preview';
const GOOGLE_IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_IMAGE_MODEL}:generateContent`;

// Result types
export type ImageGenerationResult = {
  imageData: Buffer;
  promptUsed: string;
  format: 'png' | 'jpeg';
  isFallback: boolean;
  errorMessage?: string;
  provider?: 'kie.ai' | 'google';
};

export type ThumbnailResult = ImageGenerationResult & {
  catchphrase?: string;
};

// kie.ai API response types
interface KieTaskResponse {
  code: number;
  msg?: string;
  message?: string;
  data?: {
    taskId: string;
  };
}

interface KieStatusResponse {
  code: number;
  data?: {
    taskId: string;
    state: string;
    status?: string;
    resultJson?: string;
    url?: string;
    failMsg?: string;
    error?: string;
  };
}

// Default thumbnail prompt template (from Rapid-Note2)
const DEFAULT_THUMBNAIL_TEMPLATE = `[役割] Note.comアイキャッチ画像のデザイナー / タイポグラファー

[出力] 16:9 / 4K / 高コントラスト / スマホでも見やすい

[レイアウト]
- 右側：人物40〜45%（上半身/バストアップ）
- 左側：テキスト55〜60%（左揃え）
- 人物は左方向を見る（視線誘導）
- 整列・近接・対比を考慮したデザイン

[上下セーフマージン（重要）]
- 上下のセーフマージンを同一に固定：上 6% / 下 6%（画面高さに対して）
- テキストブロックはその範囲内に収め、上端・下端の余白が完全に一致するように配置

[タイポ（3段分割）]
- 記事内容から抽出したキーワードを3段に構成
- 1段目 HOOK：最短・最強ワード
- 2段目 PROMISE：ベネフィット（最大サイズ）
- 3段目 DETAIL：方法・結論
- 3段とも左揃え、階層が一目で分かるサイズ差をつける

[背景（記事内容から自動反映）]
- 記事の世界観に合う抽象背景（写真っぽい実景ではなく"デザイン背景"）
- 背景は2層構造：
  ①ベース：暗めグラデーション（人物と文字が映える）
  ②モチーフ：記事テーマに関連する"抽象アイコン/パターン/質感"を薄く反復
- 左側（文字側）は最もシンプルにして可読性優先

[人物処理（自然に浮かせる）]
- NO white outline / NO sticker cutout / NO thick border
- 自然な切り抜き、輪郭はソフトにアンチエイリアス
- 分離は「薄いリムライト（テーマ色）」＋「柔らかいドロップシャドウ」
- 顔は明るめ、清潔感、自然な笑顔

[品質]
4K, sharp focus, professional graphic design, strong alignment, clean layout, high contrast

[禁止]
white stroke, sticker outline, thick white border, harsh cutout edges,
読めない文字、誤字、余計な文章追加、背景ごちゃごちゃ、別人化、手の崩れ、ロゴの勝手な生成`;

export class ImageGenerator {
  private kieApiKey: string;
  private googleApiKey: string;

  constructor(kieApiKey?: string, googleApiKey?: string) {
    this.kieApiKey = kieApiKey || KIE_AI_API_KEY;
    this.googleApiKey = googleApiKey || GOOGLE_API_KEY;

    if (!this.kieApiKey && !this.googleApiKey) {
      console.warn('No API keys configured for image generation (KIE_AI_API_KEY or GOOGLE_API_KEY)');
    }
  }

  /**
   * Generate a final image prompt using LLM
   */
  async generateImagePrompt(
    title: string,
    body: string,
    template?: string
  ): Promise<string> {
    const cleanBody = body.replace(/<[^>]+>/g, '').slice(0, 1000);
    const outline = template || DEFAULT_THUMBNAIL_TEMPLATE;

    const systemPrompt = `あなたはNanoBanana Pro を使いこなすプロのプロンプトエンジニアです。
以下の記事情報とアウトライン（設計図）を元に、画像生成AIに入力するための「最終的な画像生成プロンプト」を作成してください。

NanoBanana Proは以下の能力を持っています：
- 日本語の高精度な描画（テロップ作成）
- 文脈理解を含むマルチモーダル能力
- 複雑なレイアウト指示の理解

あなたのタスク：
1. 記事のタイトルと本文を読み込み、最も効果的な「サムネイル用テロップ文言（3段構成）」を決定してください。
2. アウトラインに記載されたデザインルール（レイアウト、配色、タイポグラフィ、背景など）を、具体的な指示としてプロンプトに落とし込んでください。
3. 特に「日本語テキストの描画」に関する指示を明確に含めてください。

出力形式：
プロンプト文字列のみを出力してください。
説明や前置きは不要です。`;

    const userPrompt = `
# 記事情報
タイトル: ${title}
本文: ${cleanBody}

# 画像生成プロンプトのアウトライン
${outline}

# 最終プロンプト作成のお願い
上記のアウトラインに基づき、この記事に最適なサムネイル画像を生成するためのプロンプトを作成してください。
画像内に描画させる具体的な日本語テキスト（3段構成）を必ず含めてください。
`;

    try {
      const finalPrompt = await llmClient.prompt(systemPrompt, userPrompt);
      return finalPrompt.trim();
    } catch (error) {
      console.error('Failed to generate image prompt via LLM:', error);
      // Fallback to basic prompt
      return `Create a thumbnail for: ${title}. Theme: Tech/AI. Text: ${title.slice(0, 20)}`;
    }
  }

  /**
   * Generate section image prompt (no text overlay)
   */
  async generateSectionImagePrompt(
    sectionText: string,
    articleTitle: string
  ): Promise<string> {
    const systemPrompt = `あなたはブログ記事の挿絵（イメージ画像）を作成するプロンプトエンジニアです。
NanoBanana Pro を使用して、記事のセクション内容に合った抽象的で高品質な画像を生成するためのプロンプトを作成してください。

指示：
- テキストや文字は画像に含めないでください（No text）。
- 記事のテーマに合ったスタイル（モダン、ミニマル、テック、ビジネスなど）を指定してください。
- 16:9のアスペクト比に適した構図にしてください。
- 抽象的または象徴的な表現を優先してください（具体的な人物や複雑なシーンよりも、概念的なビジュアル）。

出力形式：
プロンプト文字列のみを出力してください。`;

    const userPrompt = `
記事タイトル: ${articleTitle}
セクション内容: ${sectionText.slice(0, 500)}

このセクションの内容を表す挿絵のプロンプトを作成してください。
`;

    try {
      const finalPrompt = await llmClient.prompt(systemPrompt, userPrompt);
      return finalPrompt.trim();
    } catch (error) {
      console.error('Failed to generate section image prompt:', error);
      return `Abstract illustration for: ${sectionText.slice(0, 50)}. Style: Modern, Tech. No text.`;
    }
  }

  /**
   * Generate image using kie.ai API (primary provider)
   * Cost: $0.09/image
   */
  private async generateWithKieAI(
    prompt: string,
    options?: {
      aspectRatio?: '16:9' | '1:1' | '4:3';
      resolution?: '1K' | '2K';
    }
  ): Promise<Buffer> {
    if (!this.kieApiKey) {
      throw new Error('KIE_AI_API_KEY not configured');
    }

    const aspectRatio = options?.aspectRatio || '16:9';
    const resolution = options?.resolution || '2K';

    // Step 1: Create task
    const createTaskUrl = `${KIE_API_BASE}/jobs/createTask`;
    const requestBody = {
      model: KIE_MODEL,
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        resolution,
        output_format: 'png',
      },
    };

    console.log('[kie.ai] Creating image generation task...');

    const createResponse = await fetch(createTaskUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.kieApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`kie.ai task creation failed (${createResponse.status}): ${errorText}`);
    }

    const createResult: KieTaskResponse = await createResponse.json();

    if (createResult.code !== 200 || !createResult.data?.taskId) {
      throw new Error(`kie.ai task rejected: ${createResult.msg || createResult.message || 'Unknown error'}`);
    }

    const taskId = createResult.data.taskId;
    console.log(`[kie.ai] Task created: ${taskId}`);

    // Step 2: Poll for completion
    const maxAttempts = 60; // 5 minutes max (60 * 5s)
    let imageUrl: string | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5s interval

      const pollUrl = `${KIE_API_BASE}/jobs/recordInfo?taskId=${taskId}`;
      const pollResponse = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${this.kieApiKey}` },
      });

      if (!pollResponse.ok) {
        console.warn(`[kie.ai] Poll failed (attempt ${attempt + 1})`);
        continue;
      }

      const pollResult: KieStatusResponse = await pollResponse.json();
      const data = pollResult.data;

      if (!data) continue;

      const status = (data.state || data.status || '').toUpperCase();
      console.log(`[kie.ai] Status: ${status} (attempt ${attempt + 1})`);

      if (status === 'SUCCESS' || status === 'SUCCEEDED' || status === 'COMPLETED') {
        // Extract URL from resultJson or direct field
        if (data.resultJson) {
          try {
            const resObj = JSON.parse(data.resultJson);
            if (resObj.resultUrls && Array.isArray(resObj.resultUrls) && resObj.resultUrls.length > 0) {
              imageUrl = resObj.resultUrls[0];
            } else {
              imageUrl = resObj.url || resObj.imageUrl;
            }
          } catch (e) {
            console.warn('[kie.ai] Failed to parse resultJson');
          }
        }

        if (!imageUrl) {
          imageUrl = data.url;
        }

        break;
      } else if (status === 'FAIL' || status === 'FAILED') {
        throw new Error(`kie.ai task failed: ${data.failMsg || data.error || 'Unknown error'}`);
      }
    }

    if (!imageUrl) {
      throw new Error('kie.ai: Timed out waiting for image generation');
    }

    // Step 3: Download image
    console.log('[kie.ai] Downloading generated image...');
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from kie.ai: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(imageBuffer);
  }

  /**
   * Generate image using Google API (fallback provider)
   * Cost: $0.134/image
   */
  private async generateWithGoogleAPI(
    prompt: string,
    options?: {
      aspectRatio?: '16:9' | '1:1' | '4:3';
      referenceImageUrl?: string;
    }
  ): Promise<Buffer> {
    if (!this.googleApiKey) {
      throw new Error('GOOGLE_API_KEY not configured');
    }

    const aspectRatio = options?.aspectRatio || '16:9';

    // Build request parts
    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
    ];

    // If reference image is provided, download and include it
    if (options?.referenceImageUrl) {
      try {
        const imgResponse = await fetch(options.referenceImageUrl, { signal: AbortSignal.timeout(10000) });
        if (imgResponse.ok) {
          const imgBuffer = await imgResponse.arrayBuffer();
          const imgData = Buffer.from(imgBuffer).toString('base64');
          const mimeType = imgResponse.headers.get('Content-Type') || 'image/png';

          contentParts.push({
            inlineData: {
              mimeType,
              data: imgData,
            },
          });
        }
      } catch (error) {
        console.warn('Failed to fetch reference image:', error);
      }
    }

    // REST API request
    const requestBody = {
      contents: [
        {
          parts: contentParts,
        },
      ],
      generationConfig: {
        response_modalities: ['IMAGE'],
        image_config: {
          aspect_ratio: aspectRatio,
        },
      },
    };

    console.log('[Google API] Generating image...');

    const response = await fetch(GOOGLE_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.googleApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // Extract image data from response
    try {
      const candidates = result.candidates || [];
      if (candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const parts = candidates[0]?.content?.parts || [];
      if (parts.length === 0) {
        throw new Error('No parts in response');
      }

      // Find image data
      for (const part of parts) {
        const inlineData = part.inlineData;
        if (inlineData && inlineData.mimeType?.startsWith('image/')) {
          return Buffer.from(inlineData.data, 'base64');
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      console.error('Failed to parse image API response:', error);
      throw new Error(`Failed to parse image response: ${error}`);
    }
  }

  /**
   * Generate image with kie.ai as primary, Google API as fallback
   */
  async generateImageWithAPI(
    prompt: string,
    options?: {
      aspectRatio?: '16:9' | '1:1' | '4:3';
      referenceImageUrl?: string;
    }
  ): Promise<Buffer> {
    // For backward compatibility, check if only old-style API key was provided
    if (!this.kieApiKey && !this.googleApiKey) {
      throw new Error('API key not configured');
    }

    // Try kie.ai first (primary, 33% cheaper)
    if (this.kieApiKey) {
      try {
        return await this.generateWithKieAI(prompt, {
          aspectRatio: options?.aspectRatio,
        });
      } catch (error) {
        console.warn('[kie.ai] Failed, falling back to Google API:', error);

        // Fallback to Google API
        if (this.googleApiKey) {
          return await this.generateWithGoogleAPI(prompt, options);
        }

        throw error;
      }
    }

    // If no kie.ai key, use Google API directly
    return await this.generateWithGoogleAPI(prompt, options);
  }

  /**
   * Generate a thumbnail image for an article
   */
  async generateThumbnail(
    title: string,
    body: string,
    options?: {
      template?: string;
      referenceImageUrl?: string;
    }
  ): Promise<ThumbnailResult> {
    try {
      // Step 1: Generate image prompt
      const imagePrompt = await this.generateImagePrompt(
        title,
        body,
        options?.template
      );

      // Step 2: Generate image
      const imageData = await this.generateImageWithAPI(imagePrompt, {
        aspectRatio: '16:9',
        referenceImageUrl: options?.referenceImageUrl,
      });

      return {
        imageData,
        promptUsed: imagePrompt,
        format: 'png',
        isFallback: false,
        provider: this.kieApiKey ? 'kie.ai' : 'google',
      };
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return {
        imageData: Buffer.alloc(0),
        promptUsed: '',
        format: 'png',
        isFallback: true,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate a section image (no text overlay)
   */
  async generateSectionImage(
    sectionText: string,
    articleTitle: string,
    options?: {
      referenceImageUrl?: string;
    }
  ): Promise<ImageGenerationResult> {
    try {
      // Step 1: Generate section image prompt
      const imagePrompt = await this.generateSectionImagePrompt(
        sectionText,
        articleTitle
      );

      // Step 2: Generate image
      const imageData = await this.generateImageWithAPI(imagePrompt, {
        aspectRatio: '16:9',
        referenceImageUrl: options?.referenceImageUrl,
      });

      return {
        imageData,
        promptUsed: imagePrompt,
        format: 'png',
        isFallback: false,
        provider: this.kieApiKey ? 'kie.ai' : 'google',
      };
    } catch (error) {
      console.error('Section image generation failed:', error);
      return {
        imageData: Buffer.alloc(0),
        promptUsed: '',
        format: 'png',
        isFallback: true,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Default instance
export const imageGenerator = new ImageGenerator();
