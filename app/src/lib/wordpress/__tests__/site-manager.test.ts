// SiteManager Unit Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SiteManager } from '../site-manager';
import { WPCLIClient } from '@/lib/vps/wp-cli';

// Mock WPCLIClient
vi.mock('@/lib/vps/wp-cli', () => ({
  WPCLIClient: vi.fn(),
}));

describe('SiteManager', () => {
  let mockWpcli: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    siteExists: ReturnType<typeof vi.fn>;
    createSite: ReturnType<typeof vi.fn>;
    createApplicationPassword: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockWpcli = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn(),
      siteExists: vi.fn(),
      createSite: vi.fn(),
      createApplicationPassword: vi.fn(),
    };

    vi.mocked(WPCLIClient).mockImplementation(() => mockWpcli as unknown as WPCLIClient);
  });

  describe('create', () => {
    it('should create a site successfully', async () => {
      mockWpcli.siteExists.mockResolvedValue(false);
      mockWpcli.createSite.mockResolvedValue({
        success: true,
        blogId: 2,
        url: 'https://test-site.argonote.app',
      });
      mockWpcli.createApplicationPassword.mockResolvedValue({
        uuid: 'test-uuid',
        password: 'xxxx xxxx xxxx',
        name: 'argo-note-test-site',
      });

      const manager = new SiteManager(mockWpcli as unknown as WPCLIClient);
      const result = await manager.create('test-site', 'Test Site', 'test@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        siteId: 2,
        url: 'https://test-site.argonote.app',
        credentials: {
          username: 'admin',
          password: 'xxxx xxxx xxxx',
        },
      });
      expect(mockWpcli.disconnect).toHaveBeenCalled();
    });

    it('should return error if site already exists', async () => {
      mockWpcli.siteExists.mockResolvedValue(true);

      const manager = new SiteManager(mockWpcli as unknown as WPCLIClient);
      const result = await manager.create('existing-site', 'Existing Site', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SITE_EXISTS');
      expect(mockWpcli.createSite).not.toHaveBeenCalled();
      expect(mockWpcli.disconnect).toHaveBeenCalled();
    });

    it('should return error if site creation fails', async () => {
      mockWpcli.siteExists.mockResolvedValue(false);
      mockWpcli.createSite.mockResolvedValue({
        success: false,
        error: 'WP-CLI error: site creation failed',
      });

      const manager = new SiteManager(mockWpcli as unknown as WPCLIClient);
      const result = await manager.create('fail-site', 'Fail Site', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('WP_CLI_ERROR');
      expect(mockWpcli.disconnect).toHaveBeenCalled();
    });

    it('should return error if application password creation fails', async () => {
      mockWpcli.siteExists.mockResolvedValue(false);
      mockWpcli.createSite.mockResolvedValue({
        success: true,
        blogId: 3,
        url: 'https://new-site.argonote.app',
      });
      mockWpcli.createApplicationPassword.mockResolvedValue(null);

      const manager = new SiteManager(mockWpcli as unknown as WPCLIClient);
      const result = await manager.create('new-site', 'New Site', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('WP_CLI_ERROR');
      expect(result.error?.message).toBe('Failed to create application password');
      expect(mockWpcli.disconnect).toHaveBeenCalled();
    });

    it('should handle SSH connection errors', async () => {
      mockWpcli.connect.mockRejectedValue(new Error('SSH connection failed'));

      const manager = new SiteManager(mockWpcli as unknown as WPCLIClient);
      const result = await manager.create('test-site', 'Test Site', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SSH_ERROR');
      expect(mockWpcli.disconnect).toHaveBeenCalled();
    });
  });
});
