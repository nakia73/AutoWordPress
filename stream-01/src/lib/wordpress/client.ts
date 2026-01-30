// Stream A Stub - WordPressClient
// This is a stub for standalone development.
// The actual implementation is in Stream W and will be integrated later.

export interface WordPressClientConfig {
  baseUrl: string;
  username: string;
  applicationPassword: string;
}

export interface MediaUploadResult {
  id: number;
  source_url: string;
}

/**
 * Stub WordPressClient for Stream A standalone development.
 * Section image service uses this optionally for uploading images to WordPress.
 * In standalone mode, images are returned as base64 instead.
 */
export class WordPressClient {
  constructor(_config: WordPressClientConfig) {
    // Stub - no-op in standalone mode
  }

  async uploadMedia(
    _imageData: Buffer,
    _filename: string,
    _mimeType: string
  ): Promise<MediaUploadResult> {
    throw new Error(
      'WordPressClient is a stub in Stream A standalone mode. ' +
      'Images will be returned as base64 instead of being uploaded to WordPress.'
    );
  }
}
