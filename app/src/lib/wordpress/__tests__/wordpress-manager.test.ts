// WordPressManager Integration Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WordPressManager } from '../wordpress-manager';

// Mock dependencies
const mockWpcliInstance = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  siteExists: vi.fn(),
  createSite: vi.fn(),
  createApplicationPassword: vi.fn(),
};

const mockWpClientInstance = {
  createPost: vi.fn(),
  uploadMedia: vi.fn(),
};

vi.mock('@/lib/vps/wp-cli', () => ({
  WPCLIClient: class {
    connect = mockWpcliInstance.connect;
    disconnect = mockWpcliInstance.disconnect;
    siteExists = mockWpcliInstance.siteExists;
    createSite = mockWpcliInstance.createSite;
    createApplicationPassword = mockWpcliInstance.createApplicationPassword;
  },
}));

vi.mock('../client', () => ({
  WordPressClient: class {
    createPost = mockWpClientInstance.createPost;
    uploadMedia = mockWpClientInstance.uploadMedia;
    constructor() {}
  },
  WordPressAPIError: class extends Error {
    constructor(
      message: string,
      public statusCode: number,
      public responseBody: string
    ) {
      super(message);
    }
  },
}));

describe('WordPressManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWpcliInstance.connect.mockResolvedValue(undefined);
    mockWpcliInstance.disconnect.mockReturnValue(undefined);
  });

  describe('createSite', () => {
    it('should create a site successfully', async () => {
      mockWpcliInstance.siteExists.mockResolvedValue(false);
      mockWpcliInstance.createSite.mockResolvedValue({
        success: true,
        blogId: 2,
        url: 'https://my-blog.argonote.app',
      });
      mockWpcliInstance.createApplicationPassword.mockResolvedValue({
        uuid: 'test-uuid',
        password: 'app-password-here',
        name: 'argo-note-my-blog',
      });

      const manager = new WordPressManager();
      const result = await manager.createSite({
        slug: 'my-blog',
        title: 'My Blog',
        email: 'user@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        siteId: 2,
        url: 'https://my-blog.argonote.app',
        credentials: {
          username: 'admin',
          password: 'app-password-here',
        },
      });
    });

    it('should return error if site exists', async () => {
      mockWpcliInstance.siteExists.mockResolvedValue(true);

      const manager = new WordPressManager();
      const result = await manager.createSite({
        slug: 'existing-blog',
        title: 'Existing Blog',
        email: 'user@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SITE_EXISTS');
    });
  });

  describe('postArticle', () => {
    it('should post an article successfully', async () => {
      mockWpClientInstance.createPost.mockResolvedValue({
        id: 123,
        link: 'https://my-blog.argonote.app/hello-world/',
      });

      const manager = new WordPressManager();
      const result = await manager.postArticle({
        siteUrl: 'https://my-blog.argonote.app',
        credentials: {
          username: 'admin',
          password: 'app-password-here',
        },
        article: {
          title: 'Hello World',
          content: '<p>This is my first post!</p>',
          status: 'publish',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        postId: 123,
        postUrl: 'https://my-blog.argonote.app/hello-world/',
      });
    });

    it('should post an article with featured image', async () => {
      mockWpClientInstance.uploadMedia.mockResolvedValue({
        id: 456,
        source_url: 'https://my-blog.argonote.app/wp-content/uploads/thumb.webp',
      });
      mockWpClientInstance.createPost.mockResolvedValue({
        id: 123,
        link: 'https://my-blog.argonote.app/hello-world/',
      });

      const manager = new WordPressManager();
      const result = await manager.postArticle({
        siteUrl: 'https://my-blog.argonote.app',
        credentials: {
          username: 'admin',
          password: 'app-password-here',
        },
        article: {
          title: 'Hello World',
          content: '<p>This is my first post!</p>',
          status: 'publish',
          featuredImage: {
            buffer: Buffer.from('fake-image'),
            filename: 'thumb.webp',
            mimeType: 'image/webp',
          },
        },
      });

      expect(result.success).toBe(true);
      expect(mockWpClientInstance.uploadMedia).toHaveBeenCalled();
      expect(mockWpClientInstance.createPost).toHaveBeenCalledWith({
        title: 'Hello World',
        content: '<p>This is my first post!</p>',
        status: 'publish',
        featured_media: 456,
      });
    });
  });
});
