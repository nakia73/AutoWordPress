// ArticlePublisher Unit Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticlePublisher } from '../article-publisher';
import { WordPressClient, WordPressAPIError } from '../client';

describe('ArticlePublisher', () => {
  let mockClient: {
    createPost: ReturnType<typeof vi.fn>;
    uploadMedia: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      createPost: vi.fn(),
      uploadMedia: vi.fn(),
    };
  });

  describe('publish', () => {
    it('should publish an article successfully without image', async () => {
      mockClient.createPost.mockResolvedValue({
        id: 123,
        link: 'https://test-site.argonote.app/test-article/',
      });

      const publisher = new ArticlePublisher(mockClient as unknown as WordPressClient);
      const result = await publisher.publish({
        title: 'Test Article',
        content: '<p>Test content</p>',
        status: 'publish',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        postId: 123,
        postUrl: 'https://test-site.argonote.app/test-article/',
      });
      expect(mockClient.uploadMedia).not.toHaveBeenCalled();
    });

    it('should publish an article with featured image', async () => {
      mockClient.uploadMedia.mockResolvedValue({
        id: 456,
        source_url: 'https://test-site.argonote.app/wp-content/uploads/image.webp',
      });
      mockClient.createPost.mockResolvedValue({
        id: 123,
        link: 'https://test-site.argonote.app/test-article/',
      });

      const publisher = new ArticlePublisher(mockClient as unknown as WordPressClient);
      const result = await publisher.publish({
        title: 'Test Article',
        content: '<p>Test content</p>',
        status: 'publish',
        featuredImage: {
          buffer: Buffer.from('fake-image-data'),
          filename: 'thumbnail.webp',
          mimeType: 'image/webp',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        postId: 123,
        postUrl: 'https://test-site.argonote.app/test-article/',
      });
      expect(mockClient.uploadMedia).toHaveBeenCalledWith(
        expect.any(Buffer),
        'thumbnail.webp',
        'image/webp'
      );
      expect(mockClient.createPost).toHaveBeenCalledWith({
        title: 'Test Article',
        content: '<p>Test content</p>',
        status: 'publish',
        featured_media: 456,
      });
    });

    it('should return error if image upload fails', async () => {
      mockClient.uploadMedia.mockRejectedValue(
        new WordPressAPIError('Upload failed', 500, 'Server error')
      );

      const publisher = new ArticlePublisher(mockClient as unknown as WordPressClient);
      const result = await publisher.publish({
        title: 'Test Article',
        content: '<p>Test content</p>',
        status: 'publish',
        featuredImage: {
          buffer: Buffer.from('fake-image-data'),
          filename: 'thumbnail.webp',
          mimeType: 'image/webp',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UPLOAD_ERROR');
      expect(mockClient.createPost).not.toHaveBeenCalled();
    });

    it('should return AUTH_ERROR for 401 status', async () => {
      mockClient.createPost.mockRejectedValue(
        new WordPressAPIError('Unauthorized', 401, 'Invalid credentials')
      );

      const publisher = new ArticlePublisher(mockClient as unknown as WordPressClient);
      const result = await publisher.publish({
        title: 'Test Article',
        content: '<p>Test content</p>',
        status: 'publish',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('AUTH_ERROR');
    });

    it('should return API_ERROR for other errors', async () => {
      mockClient.createPost.mockRejectedValue(
        new WordPressAPIError('Server error', 500, 'Internal error')
      );

      const publisher = new ArticlePublisher(mockClient as unknown as WordPressClient);
      const result = await publisher.publish({
        title: 'Test Article',
        content: '<p>Test content</p>',
        status: 'publish',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('API_ERROR');
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      mockClient.uploadMedia.mockResolvedValue({
        id: 789,
        source_url: 'https://test-site.argonote.app/wp-content/uploads/image.png',
      });

      const publisher = new ArticlePublisher(mockClient as unknown as WordPressClient);
      const result = await publisher.uploadImage(
        Buffer.from('fake-image-data'),
        'image.png',
        'image/png'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        mediaId: 789,
        url: 'https://test-site.argonote.app/wp-content/uploads/image.png',
      });
    });

    it('should return error on upload failure', async () => {
      mockClient.uploadMedia.mockRejectedValue(new Error('Network error'));

      const publisher = new ArticlePublisher(mockClient as unknown as WordPressClient);
      const result = await publisher.uploadImage(
        Buffer.from('fake-image-data'),
        'image.png',
        'image/png'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNKNOWN');
    });
  });
});
