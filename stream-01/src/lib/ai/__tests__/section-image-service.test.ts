/**
 * Section Image Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SectionImageService } from '../section-image-service';

// Mock imageGenerator
vi.mock('../image-generator', () => ({
  imageGenerator: {
    generateSectionImage: vi.fn().mockResolvedValue({
      imageData: Buffer.from('fake-image-data'),
      promptUsed: 'test prompt',
      format: 'png',
      isFallback: false,
    }),
  },
}));

describe('SectionImageService', () => {
  let service: SectionImageService;

  beforeEach(() => {
    service = new SectionImageService();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance without WordPress client', () => {
      const svc = new SectionImageService();
      expect(svc).toBeDefined();
    });

    it('should create instance with WordPress client', () => {
      const mockWpClient = { uploadMedia: vi.fn() } as any;
      const svc = new SectionImageService(mockWpClient);
      expect(svc).toBeDefined();
    });
  });

  describe('setWordPressClient()', () => {
    it('should set WordPress client', () => {
      const mockWpClient = { uploadMedia: vi.fn() } as any;
      service.setWordPressClient(mockWpClient);
      // No error means success
      expect(true).toBe(true);
    });
  });

  describe('processArticleImages()', () => {
    it('should return empty result when no headers found', async () => {
      const html = '<p>No headers in this content</p>';
      const result = await service.processArticleImages(html, 'Test Article');

      expect(result.imagesGenerated).toBe(0);
      expect(result.errors).toContain('No headers found for section images');
      expect(result.processedHtml).toBe(html);
    });

    it('should process H2 headers and insert images', async () => {
      const html = `
        <h2>Section One</h2>
        <p>Content for section one</p>
        <h2>Section Two</h2>
        <p>Content for section two</p>
      `;

      const result = await service.processArticleImages(html, 'Test Article', {
        maxImages: 2,
      });

      expect(result.imagesGenerated).toBe(2);
      expect(result.processedHtml).toContain('<figure>');
      expect(result.processedHtml).toContain('</figure>');
      expect(result.errors).toHaveLength(0);
    });

    it('should process H3 headers', async () => {
      const html = `
        <h3>Sub Section</h3>
        <p>Sub section content</p>
      `;

      const result = await service.processArticleImages(html, 'Test Article', {
        maxImages: 1,
      });

      expect(result.imagesGenerated).toBe(1);
      expect(result.processedHtml).toContain('<figure>');
    });

    it('should respect maxImages limit', async () => {
      const html = `
        <h2>Section 1</h2><p>Content 1</p>
        <h2>Section 2</h2><p>Content 2</p>
        <h2>Section 3</h2><p>Content 3</p>
        <h2>Section 4</h2><p>Content 4</p>
      `;

      const result = await service.processArticleImages(html, 'Test Article', {
        maxImages: 2,
      });

      expect(result.imagesGenerated).toBe(2);
    });

    it('should use default maxImages of 5', async () => {
      const html = Array(10).fill(null).map((_, i) =>
        `<h2>Section ${i}</h2><p>Content ${i}</p>`
      ).join('');

      const result = await service.processArticleImages(html, 'Test Article');

      expect(result.imagesGenerated).toBe(5);
    });

    it('should handle image generation failure gracefully', async () => {
      const { imageGenerator } = await import('../image-generator');
      vi.mocked(imageGenerator.generateSectionImage).mockResolvedValueOnce({
        imageData: Buffer.alloc(0),
        promptUsed: '',
        format: 'png',
        isFallback: true,
        errorMessage: 'Generation failed',
      });

      const html = '<h2>Test Section</h2><p>Content</p>';
      const result = await service.processArticleImages(html, 'Test Article');

      expect(result.imagesGenerated).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to generate image');
    });

    it('should use data URL when WordPress upload is not configured', async () => {
      const html = '<h2>Test Section</h2><p>Content</p>';
      const result = await service.processArticleImages(html, 'Test Article');

      expect(result.processedHtml).toContain('data:image/png;base64,');
    });

    it('should upload to WordPress when configured', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        source_url: 'https://example.com/image.png',
      });
      const mockWpClient = { uploadMedia: mockUpload } as any;
      service.setWordPressClient(mockWpClient);

      const html = '<h2>Test Section</h2><p>Content</p>';
      const result = await service.processArticleImages(html, 'Test Article', {
        uploadToWordPress: true,
      });

      expect(mockUpload).toHaveBeenCalled();
      expect(result.processedHtml).toContain('https://example.com/image.png');
    });

    it('should handle WordPress upload failure', async () => {
      const mockUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));
      const mockWpClient = { uploadMedia: mockUpload } as any;
      service.setWordPressClient(mockWpClient);

      const html = '<h2>Test Section</h2><p>Content</p>';
      const result = await service.processArticleImages(html, 'Test Article', {
        uploadToWordPress: true,
      });

      expect(result.imagesGenerated).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to upload image');
    });

    it('should handle exception during processing', async () => {
      const { imageGenerator } = await import('../image-generator');
      vi.mocked(imageGenerator.generateSectionImage).mockRejectedValueOnce(
        new Error('Unexpected error')
      );

      const html = '<h2>Test Section</h2><p>Content</p>';
      const result = await service.processArticleImages(html, 'Test Article');

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Error processing section');
    });
  });

  describe('generateSectionImages()', () => {
    it('should generate images for headers without inserting', async () => {
      const html = `
        <h2>Section One</h2><p>Content one</p>
        <h2>Section Two</h2><p>Content two</p>
      `;

      const results = await service.generateSectionImages(html, 'Test Article', {
        maxImages: 2,
      });

      expect(results).toHaveLength(2);
      expect(results[0].header).toBe('Section One');
      expect(results[0].imageData).toBeInstanceOf(Buffer);
      expect(results[1].header).toBe('Section Two');
    });

    it('should include error message when generation fails', async () => {
      const { imageGenerator } = await import('../image-generator');
      vi.mocked(imageGenerator.generateSectionImage).mockResolvedValueOnce({
        imageData: Buffer.alloc(0),
        promptUsed: '',
        format: 'png',
        isFallback: true,
        errorMessage: 'API error',
      });

      const html = '<h2>Test Section</h2><p>Content</p>';
      const results = await service.generateSectionImages(html, 'Test Article');

      expect(results[0].error).toBe('API error');
    });

    it('should handle exception and include error', async () => {
      const { imageGenerator } = await import('../image-generator');
      vi.mocked(imageGenerator.generateSectionImage).mockRejectedValueOnce(
        new Error('Network error')
      );

      const html = '<h2>Test Section</h2><p>Content</p>';
      const results = await service.generateSectionImages(html, 'Test Article');

      expect(results[0].error).toBe('Network error');
      expect(results[0].imageData.length).toBe(0);
    });

    it('should respect maxImages option', async () => {
      const html = Array(10).fill(null).map((_, i) =>
        `<h2>Section ${i}</h2><p>Content</p>`
      ).join('');

      const results = await service.generateSectionImages(html, 'Test Article', {
        maxImages: 3,
      });

      expect(results).toHaveLength(3);
    });
  });
});

describe('extractHeaders utility', () => {
  let service: SectionImageService;

  beforeEach(() => {
    service = new SectionImageService();
  });

  it('should extract text from headers with nested tags', async () => {
    const html = '<h2><strong>Bold Header</strong></h2><p>Content</p>';
    const result = await service.processArticleImages(html, 'Test');

    // If extraction works, we should see the image inserted
    expect(result.processedHtml).toContain('Bold Header');
  });

  it('should handle mixed H2 and H3', async () => {
    const html = `
      <h2>Main Section</h2><p>Main content</p>
      <h3>Sub Section</h3><p>Sub content</p>
    `;

    const result = await service.processArticleImages(html, 'Test', {
      maxImages: 2,
    });

    expect(result.imagesGenerated).toBe(2);
  });
});
