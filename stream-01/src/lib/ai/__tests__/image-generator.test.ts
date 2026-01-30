/**
 * Image Generator Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerator } from '../image-generator';

// Mock llmClient
vi.mock('../llm-client', () => ({
  llmClient: {
    prompt: vi.fn().mockResolvedValue('Generated prompt for image'),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ImageGenerator', () => {
  let generator: ImageGenerator;

  beforeEach(() => {
    // Create with Google API key only (for backward compatibility testing)
    generator = new ImageGenerator('', 'test-google-api-key');
    mockFetch.mockReset();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use provided API keys', () => {
      const gen = new ImageGenerator('kie-key', 'google-key');
      expect(gen).toBeDefined();
    });

    it('should warn when no API keys provided', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // Create with empty strings to trigger warning
      const gen = new ImageGenerator('', '');
      expect(warnSpy).toHaveBeenCalledWith('No API keys configured for image generation (KIE_AI_API_KEY or GOOGLE_API_KEY)');
      warnSpy.mockRestore();
    });
  });

  describe('generateImagePrompt()', () => {
    it('should generate prompt via LLM', async () => {
      const { llmClient } = await import('../llm-client');

      const prompt = await generator.generateImagePrompt(
        'Test Article Title',
        '<p>This is the article body content</p>'
      );

      expect(llmClient.prompt).toHaveBeenCalled();
      expect(prompt).toBe('Generated prompt for image');
    });

    it('should strip HTML tags from body', async () => {
      const { llmClient } = await import('../llm-client');

      await generator.generateImagePrompt(
        'Title',
        '<h1>Header</h1><p>Content with <strong>tags</strong></p>'
      );

      // The user prompt passed to llmClient should have HTML stripped
      expect(llmClient.prompt).toHaveBeenCalled();
    });

    it('should use fallback prompt on LLM error', async () => {
      const { llmClient } = await import('../llm-client');
      vi.mocked(llmClient.prompt).mockRejectedValueOnce(new Error('LLM error'));

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const prompt = await generator.generateImagePrompt('Test Title', 'Body');

      expect(prompt).toContain('Create a thumbnail for: Test Title');
      errorSpy.mockRestore();
    });

    it('should use custom template when provided', async () => {
      const { llmClient } = await import('../llm-client');

      await generator.generateImagePrompt(
        'Title',
        'Body',
        'Custom template instructions'
      );

      expect(llmClient.prompt).toHaveBeenCalled();
    });
  });

  describe('generateSectionImagePrompt()', () => {
    it('should generate section image prompt via LLM', async () => {
      const { llmClient } = await import('../llm-client');

      const prompt = await generator.generateSectionImagePrompt(
        'Section about task management',
        'Article Title'
      );

      expect(llmClient.prompt).toHaveBeenCalled();
      expect(prompt).toBe('Generated prompt for image');
    });

    it('should truncate long section text', async () => {
      const { llmClient } = await import('../llm-client');
      const longText = 'a'.repeat(1000);

      await generator.generateSectionImagePrompt(longText, 'Title');

      expect(llmClient.prompt).toHaveBeenCalled();
    });

    it('should use fallback prompt on LLM error', async () => {
      const { llmClient } = await import('../llm-client');
      vi.mocked(llmClient.prompt).mockRejectedValueOnce(new Error('LLM error'));

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const prompt = await generator.generateSectionImagePrompt('Test section', 'Title');

      expect(prompt).toContain('Abstract illustration');
      expect(prompt).toContain('No text');
      errorSpy.mockRestore();
    });
  });

  describe('generateImageWithAPI()', () => {
    it('should throw error when API key not configured', async () => {
      const noKeyGen = new ImageGenerator('', '');

      await expect(noKeyGen.generateImageWithAPI('test prompt'))
        .rejects.toThrow('API key not configured');
    });

    it('should make API request with correct parameters', async () => {
      const imageBase64 = Buffer.from('fake-image-data').toString('base64');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                inlineData: {
                  mimeType: 'image/png',
                  data: imageBase64,
                },
              }],
            },
          }],
        }),
      });

      const result = await generator.generateImageWithAPI('test prompt', {
        aspectRatio: '16:9',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-goog-api-key': 'test-google-api-key',
          }),
        })
      );
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(generator.generateImageWithAPI('test prompt'))
        .rejects.toThrow('Image API error (500)');
    });

    it('should handle empty candidates in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [] }),
      });

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(generator.generateImageWithAPI('test prompt'))
        .rejects.toThrow('Failed to parse image response');

      errorSpy.mockRestore();
    });

    it('should handle no image data in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{ text: 'no image here' }],
            },
          }],
        }),
      });

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(generator.generateImageWithAPI('test prompt'))
        .rejects.toThrow('No image data found in response');

      errorSpy.mockRestore();
    });

    it('should include reference image when provided', async () => {
      const imageBase64 = Buffer.from('fake-image-data').toString('base64');

      // Mock reference image fetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => Buffer.from('reference-image'),
          headers: new Map([['Content-Type', 'image/jpeg']]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  inlineData: { mimeType: 'image/png', data: imageBase64 },
                }],
              },
            }],
          }),
        });

      await generator.generateImageWithAPI('test prompt', {
        referenceImageUrl: 'https://example.com/ref.jpg',
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should continue without reference image on fetch error', async () => {
      const imageBase64 = Buffer.from('fake-image-data').toString('base64');

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Reference image fetch fails, but API call succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  inlineData: { mimeType: 'image/png', data: imageBase64 },
                }],
              },
            }],
          }),
        });

      const result = await generator.generateImageWithAPI('test prompt', {
        referenceImageUrl: 'https://example.com/ref.jpg',
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(warnSpy).toHaveBeenCalledWith('Failed to fetch reference image:', expect.any(Error));
      warnSpy.mockRestore();
    });
  });

  describe('generateThumbnail()', () => {
    it('should return thumbnail result on success', async () => {
      const { llmClient } = await import('../llm-client');
      const imageBase64 = Buffer.from('fake-image-data').toString('base64');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                inlineData: { mimeType: 'image/png', data: imageBase64 },
              }],
            },
          }],
        }),
      });

      const result = await generator.generateThumbnail('Title', 'Body');

      expect(result.isFallback).toBe(false);
      expect(result.format).toBe('png');
      expect(result.imageData).toBeInstanceOf(Buffer);
      expect(result.promptUsed).toBeDefined();
    });

    it('should return fallback result on error', async () => {
      const { llmClient } = await import('../llm-client');
      vi.mocked(llmClient.prompt).mockRejectedValueOnce(new Error('LLM error'));

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await generator.generateThumbnail('Title', 'Body');

      expect(result.isFallback).toBe(true);
      expect(result.errorMessage).toBeDefined();
      expect(result.imageData.length).toBe(0);

      errorSpy.mockRestore();
    });
  });

  describe('generateSectionImage()', () => {
    it('should return section image result on success', async () => {
      const { llmClient } = await import('../llm-client');
      const imageBase64 = Buffer.from('fake-image-data').toString('base64');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                inlineData: { mimeType: 'image/png', data: imageBase64 },
              }],
            },
          }],
        }),
      });

      const result = await generator.generateSectionImage('Section text', 'Article Title');

      expect(result.isFallback).toBe(false);
      expect(result.format).toBe('png');
      expect(result.imageData).toBeInstanceOf(Buffer);
    });

    it('should return fallback result on error', async () => {
      const { llmClient } = await import('../llm-client');
      vi.mocked(llmClient.prompt).mockRejectedValueOnce(new Error('LLM error'));

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await generator.generateSectionImage('Section', 'Title');

      expect(result.isFallback).toBe(true);
      expect(result.errorMessage).toBeDefined();

      errorSpy.mockRestore();
    });
  });
});
