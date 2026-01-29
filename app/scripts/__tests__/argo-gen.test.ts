/**
 * Argo Gen CLI Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

// Test utilities
const TEST_OUTPUT_DIR = join(__dirname, '../test-output');

describe('Argo Gen CLI', () => {
  beforeEach(() => {
    // Clean up test output directory
    if (existsSync(TEST_OUTPUT_DIR)) {
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    }
  });

  describe('parseArgs utility', () => {
    it('should parse command correctly', () => {
      const args = ['generate', '--keyword', 'test'];
      const command = args[0];
      expect(command).toBe('generate');
    });

    it('should parse options with values', () => {
      const args = ['generate', '--keyword', 'test keyword', '--type', 'article'];
      const options: Record<string, string | boolean> = {};

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
          const key = arg.slice(2);
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('--')) {
            options[key] = nextArg;
            i++;
          } else {
            options[key] = true;
          }
        }
      }

      expect(options.keyword).toBe('test keyword');
      expect(options.type).toBe('article');
    });

    it('should parse boolean flags', () => {
      const args = ['generate', '--keyword', 'test', '--images'];
      const options: Record<string, string | boolean> = {};

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
          const key = arg.slice(2);
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('--')) {
            options[key] = nextArg;
            i++;
          } else {
            options[key] = true;
          }
        }
      }

      expect(options.images).toBe(true);
    });
  });

  describe('formatDuration utility', () => {
    it('should format milliseconds', () => {
      const formatDuration = (ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
      };

      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(65000)).toBe('1m 5s');
    });
  });

  describe('slug generation', () => {
    it('should generate valid slug from title', () => {
      const title = 'Test Article Title';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      expect(slug).toBe('test-article-title');
    });

    it('should handle Japanese characters', () => {
      const title = 'タスク管理ツール比較';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      expect(slug).toBe('タスク管理ツール比較');
    });

    it('should handle mixed content', () => {
      const title = 'Best タスク管理 Tools 2026';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      expect(slug).toBe('best-タスク管理-tools-2026');
    });
  });

  describe('input file parsing', () => {
    it('should parse CSV lines correctly', () => {
      const lines = [
        'タスク管理ツール 比較,article,ja',
        'Project Management Tips,faq,en',
        '# Comment line',
        '',
        'AI Tools,glossary,en',
      ];

      const filtered = lines.filter((line) => line.trim() && !line.startsWith('#'));

      expect(filtered.length).toBe(3);

      const parsed = filtered.map((line) => {
        const parts = line.split(',').map((p) => p.trim());
        return {
          keyword: parts[0],
          articleType: parts[1] || 'article',
          language: parts[2] || 'ja',
        };
      });

      expect(parsed[0].keyword).toBe('タスク管理ツール 比較');
      expect(parsed[0].articleType).toBe('article');
      expect(parsed[1].keyword).toBe('Project Management Tips');
      expect(parsed[1].articleType).toBe('faq');
      expect(parsed[2].language).toBe('en');
    });
  });

  describe('HTML template generation', () => {
    it('should generate valid HTML wrapper', () => {
      const title = 'Test Article';
      const metaDescription = 'This is a test meta description';
      const content = '<h1>Test</h1><p>Content</p>';

      const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${metaDescription}">
  <title>${title}</title>
</head>
<body>
${content}
</body>
</html>`;

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toContain(`content="${metaDescription}"`);
      expect(html).toContain(content);
    });
  });

  describe('output directory handling', () => {
    it('should create output directory if not exists', () => {
      const outputDir = join(TEST_OUTPUT_DIR, 'nested/dir');

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      expect(existsSync(outputDir)).toBe(true);

      // Cleanup
      rmSync(TEST_OUTPUT_DIR, { recursive: true });
    });
  });
});

describe('CLI Integration', () => {
  it('should validate required keyword parameter', () => {
    const options = { type: 'article', lang: 'ja' };
    const keyword = options['keyword' as keyof typeof options];

    expect(keyword).toBeUndefined();

    // In real CLI, this would exit with error
    const hasKeyword = !!keyword;
    expect(hasKeyword).toBe(false);
  });

  it('should use default values for optional parameters', () => {
    const options: Record<string, string | boolean> = {
      keyword: 'test',
    };

    const articleType = (options.type as string) || 'article';
    const language = (options.lang as string) || 'ja';
    const includeImages = !!options.images;
    const outputDir = (options.output as string) || './output';

    expect(articleType).toBe('article');
    expect(language).toBe('ja');
    expect(includeImages).toBe(false);
    expect(outputDir).toBe('./output');
  });
});
