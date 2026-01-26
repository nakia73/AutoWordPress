// Argo Note - Image Generator Service
// NanoBanana Pro (gemini-3-pro-image-preview) for thumbnail and section images
// Based on Rapid-Note2's thumbnail_service.py

import { llmClient } from './llm-client';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.LITELLM_API_KEY || '';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';
const IMAGE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`;

// Result types
export type ImageGenerationResult = {
  imageData: Buffer;
  promptUsed: string;
  format: 'png' | 'jpeg';
  isFallback: boolean;
  errorMessage?: string;
};

export type ThumbnailResult = ImageGenerationResult & {
  catchphrase?: string;
};

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
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GOOGLE_API_KEY;
    if (!this.apiKey) {
      console.warn('Google API key not configured for image generation');
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

    const systemPrompt = `あなたはNanoBanana Pro (gemini-3-pro-image-preview) を使いこなすプロのプロンプトエンジニアです。
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
NanoBanana Proに入力するプロンプト文字列のみを出力してください。
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
NanoBanana Pro (gemini-3-pro-image-preview) を使用して、記事のセクション内容に合った抽象的で高品質な画像を生成するためのプロンプトを作成してください。

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
   * Call NanoBanana Pro REST API to generate image
   */
  async generateImageWithAPI(
    prompt: string,
    options?: {
      aspectRatio?: '16:9' | '1:1' | '4:3';
      referenceImageUrl?: string;
    }
  ): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
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

    const response = await fetch(IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
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
