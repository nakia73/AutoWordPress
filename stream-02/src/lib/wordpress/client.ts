// Argo Note - Stream 02 WordPress REST API Client

/**
 * Sanitize a filename for use in Content-Disposition header.
 * Removes characters that could enable header injection attacks.
 *
 * @param filename - The original filename
 * @returns Sanitized filename safe for HTTP headers
 */
function sanitizeFilename(filename: string): string {
  // Remove characters that could enable header injection
  // - Double quotes: could break out of quoted string
  // - Newlines (\n, \r): could inject new headers
  // - Backslashes: could be used for escaping
  // - Null bytes: could truncate strings in some contexts
  return filename
    .replace(/["\\]/g, '_')
    .replace(/[\r\n\x00]/g, '')
    .trim();
}

import type {
  WPPostRequest,
  WPPostResponse,
  WPPostStatus,
  WPMediaUploadResponse,
  WPClientOptions,
} from './types';
import { safeDecrypt } from '@/lib/crypto';

export class WordPressClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(options: WPClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    // WordPress Application Password authentication
    const credentials = Buffer.from(
      `${options.username}:${options.applicationPassword}`
    ).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/wp-json/wp/v2${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new WordPressAPIError(
        `WordPress API error: ${response.status} - ${errorText}`,
        response.status,
        errorText
      );
      throw error;
    }

    return response.json();
  }

  // Posts API
  async createPost(post: WPPostRequest): Promise<WPPostResponse> {
    return this.request<WPPostResponse>('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async updatePost(postId: number, post: Partial<WPPostRequest>): Promise<WPPostResponse> {
    return this.request<WPPostResponse>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    });
  }

  async getPost(postId: number): Promise<WPPostResponse> {
    return this.request<WPPostResponse>(`/posts/${postId}`);
  }

  async deletePost(postId: number, force = false): Promise<WPPostResponse> {
    return this.request<WPPostResponse>(
      `/posts/${postId}?force=${force}`,
      { method: 'DELETE' }
    );
  }

  async listPosts(params?: {
    page?: number;
    per_page?: number;
    status?: WPPostStatus | WPPostStatus[];
  }): Promise<WPPostResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.per_page) queryParams.set('per_page', String(params.per_page));
    if (params?.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      queryParams.set('status', statuses.join(','));
    }

    const query = queryParams.toString();
    return this.request<WPPostResponse[]>(`/posts${query ? `?${query}` : ''}`);
  }

  // Media API
  async uploadMedia(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<WPMediaUploadResponse> {
    const url = `${this.baseUrl}/wp-json/wp/v2/media`;

    // Convert Buffer to ArrayBuffer for fetch compatibility
    const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: mimeType });

    // Sanitize filename to prevent header injection
    const safeFilename = sanitizeFilename(filename);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Type': mimeType,
        Authorization: this.authHeader,
      },
      body: blob,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new WordPressAPIError(
        `WordPress Media Upload error: ${response.status}`,
        response.status,
        errorText
      );
    }

    return response.json();
  }

  // Categories API
  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    return this.request('/categories?per_page=100');
  }

  async createCategory(name: string, slug?: string): Promise<{ id: number; name: string; slug: string }> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    });
  }

  // Tags API
  async getTags(): Promise<Array<{ id: number; name: string; slug: string }>> {
    return this.request('/tags?per_page=100');
  }

  async createTag(name: string, slug?: string): Promise<{ id: number; name: string; slug: string }> {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify({ name, slug }),
    });
  }

  // Health check
  async checkConnection(): Promise<boolean> {
    try {
      await this.request('/users/me');
      return true;
    } catch {
      return false;
    }
  }
}

// Custom error class for WordPress API errors
export class WordPressAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody: string
  ) {
    super(message);
    this.name = 'WordPressAPIError';
  }

  // Get recommended action based on status code
  getRecommendedAction() {
    const handlers: Record<number, { action: string; retry: boolean; message: string }> = {
      401: {
        action: 'notify_user',
        retry: false,
        message: 'WordPress認証が無効です。再接続してください。',
      },
      403: {
        action: 'notify_user',
        retry: false,
        message: 'WordPress権限が不足しています。',
      },
      404: {
        action: 'notify_user',
        retry: false,
        message: '指定されたリソースが見つかりません。',
      },
      500: {
        action: 'retry_with_backoff',
        retry: true,
        message: 'WordPressサーバーエラー。しばらく待ってから再試行します。',
      },
      502: {
        action: 'retry_with_backoff',
        retry: true,
        message: 'WordPress接続エラー。しばらく待ってから再試行します。',
      },
      503: {
        action: 'retry_with_backoff',
        retry: true,
        message: 'WordPressが一時的に利用できません。しばらく待ってから再試行します。',
      },
    };

    return handlers[this.statusCode] || {
      action: 'notify_user',
      retry: false,
      message: `WordPress API エラー: ${this.statusCode}`,
    };
  }
}

// Factory function to create client from site data
export function createWordPressClient(site: {
  wpSiteUrl: string;
  wpUsername: string;
  wpApiToken: string;
}): WordPressClient {
  // Decrypt the token (safeDecrypt handles both encrypted and plain tokens)
  const decryptedToken = safeDecrypt(site.wpApiToken);

  if (!decryptedToken) {
    throw new Error('Failed to decrypt WordPress API token');
  }

  return new WordPressClient({
    baseUrl: site.wpSiteUrl,
    username: site.wpUsername,
    applicationPassword: decryptedToken,
  });
}
