// Argo Note - Section Image Service
// Generates and inserts images for article sections (H2/H3 headings)
// Based on Rapid-Note2's section_image_service.py

import { imageGenerator } from './image-generator';
import { WordPressClient } from '../wordpress/client';

// Simple HTML parser for extracting headings
type HeaderInfo = {
  tag: 'h2' | 'h3';
  text: string;
  index: number; // Position in the original HTML
  nextContent: string; // Text content after the heading for context
};

/**
 * Parse HTML and extract headers with their context
 */
function extractHeaders(html: string): HeaderInfo[] {
  const headers: HeaderInfo[] = [];
  const headerRegex = /<(h[23])>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = headerRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase() as 'h2' | 'h3';
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    const index = match.index;

    // Get next content for context (up to 200 characters of text after the heading)
    const afterHeader = html.slice(index + match[0].length);
    const nextContent = afterHeader.replace(/<[^>]+>/g, ' ').trim().slice(0, 200);

    if (text) {
      headers.push({
        tag,
        text,
        index,
        nextContent,
      });
    }
  }

  return headers;
}

/**
 * Insert an image tag after a heading in HTML
 */
function insertImageAfterHeader(
  html: string,
  headerIndex: number,
  headerMatch: string,
  imageUrl: string,
  altText: string
): string {
  const insertPosition = headerIndex + headerMatch.length;
  const figureHtml = `\n<figure><img src="${imageUrl}" alt="${altText}" /></figure>\n`;

  return (
    html.slice(0, insertPosition) +
    figureHtml +
    html.slice(insertPosition)
  );
}

export type SectionImageOptions = {
  maxImages?: number; // Maximum number of images to generate (default: 5)
  uploadToWordPress?: boolean; // Whether to upload to WordPress
  siteId?: string; // Site ID for WordPress upload
  referenceImageUrl?: string; // Reference image for style consistency
};

export type SectionImageResult = {
  processedHtml: string;
  imagesGenerated: number;
  errors: string[];
};

export class SectionImageService {
  private wpClient?: WordPressClient;

  constructor(wpClient?: WordPressClient) {
    this.wpClient = wpClient;
  }

  /**
   * Set WordPress client for image uploads
   */
  setWordPressClient(client: WordPressClient) {
    this.wpClient = client;
  }

  /**
   * Process an article and insert section images
   */
  async processArticleImages(
    articleHtml: string,
    articleTitle: string,
    options?: SectionImageOptions
  ): Promise<SectionImageResult> {
    const maxImages = options?.maxImages ?? 5;
    const errors: string[] = [];
    let processedHtml = articleHtml;
    let imagesGenerated = 0;

    // Extract headers
    const headers = extractHeaders(articleHtml);

    if (headers.length === 0) {
      return {
        processedHtml,
        imagesGenerated: 0,
        errors: ['No headers found for section images'],
      };
    }

    // Process headers in reverse order to maintain correct indices
    const headersToProcess = headers.slice(0, maxImages).reverse();

    for (const header of headersToProcess) {
      try {
        const sectionContext = `見出し: ${header.text}\n内容: ${header.nextContent}`;

        console.log(`Generating image for section: ${header.text}`);

        // Generate image
        const result = await imageGenerator.generateSectionImage(
          sectionContext,
          articleTitle,
          { referenceImageUrl: options?.referenceImageUrl }
        );

        if (result.isFallback || result.imageData.length === 0) {
          errors.push(`Failed to generate image for section: ${header.text} - ${result.errorMessage}`);
          continue;
        }

        let imageUrl: string;

        // Upload to WordPress if client is available
        if (options?.uploadToWordPress && this.wpClient) {
          try {
            const uploadResult = await this.wpClient.uploadMedia(
              result.imageData,
              `section-${imagesGenerated}.png`,
              'image/png'
            );
            imageUrl = uploadResult.source_url;
          } catch (uploadError) {
            errors.push(`Failed to upload image for section: ${header.text} - ${uploadError}`);
            continue;
          }
        } else {
          // For testing/development, use data URL
          imageUrl = `data:image/png;base64,${result.imageData.toString('base64')}`;
        }

        // Find the header in the current HTML (may have shifted due to previous insertions)
        const headerRegex = new RegExp(
          `<${header.tag}>[\\s\\S]*?${escapeRegex(header.text)}[\\s\\S]*?</${header.tag}>`,
          'i'
        );
        const match = processedHtml.match(headerRegex);

        if (match && match.index !== undefined) {
          processedHtml = insertImageAfterHeader(
            processedHtml,
            match.index,
            match[0],
            imageUrl,
            header.text
          );
          imagesGenerated++;
          console.log(`Inserted image for section: ${header.text}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Error processing section "${header.text}": ${errorMessage}`);
      }
    }

    return {
      processedHtml,
      imagesGenerated,
      errors,
    };
  }

  /**
   * Generate images for specific sections without inserting them
   */
  async generateSectionImages(
    articleHtml: string,
    articleTitle: string,
    options?: { maxImages?: number; referenceImageUrl?: string }
  ): Promise<Array<{ header: string; imageData: Buffer; error?: string }>> {
    const maxImages = options?.maxImages ?? 5;
    const headers = extractHeaders(articleHtml);
    const results: Array<{ header: string; imageData: Buffer; error?: string }> = [];

    for (const header of headers.slice(0, maxImages)) {
      try {
        const sectionContext = `見出し: ${header.text}\n内容: ${header.nextContent}`;

        const result = await imageGenerator.generateSectionImage(
          sectionContext,
          articleTitle,
          { referenceImageUrl: options?.referenceImageUrl }
        );

        results.push({
          header: header.text,
          imageData: result.imageData,
          error: result.isFallback ? result.errorMessage : undefined,
        });
      } catch (error) {
        results.push({
          header: header.text,
          imageData: Buffer.alloc(0),
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Default instance
export const sectionImageService = new SectionImageService();
