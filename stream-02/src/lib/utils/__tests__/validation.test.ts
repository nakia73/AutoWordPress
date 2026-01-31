import { describe, it, expect } from 'vitest';
import {
  validateSlug,
  validateEmail,
  validateSiteTitle,
  validateThemeName,
  validatePluginName,
  validateUsername,
  validateAppName,
  validateOptionKey,
  validateUrl,
} from '../validation';

describe('validateSlug', () => {
  it('accepts valid slugs', () => {
    expect(validateSlug('a').valid).toBe(true);
    expect(validateSlug('my-site').valid).toBe(true);
    expect(validateSlug('site123').valid).toBe(true);
    expect(validateSlug('my-site-123').valid).toBe(true);
  });

  it('rejects empty slugs', () => {
    const result = validateSlug('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Slug is required');
  });

  it('rejects slugs with invalid characters', () => {
    expect(validateSlug('My Site').valid).toBe(false);
    expect(validateSlug('site_name').valid).toBe(false);
    expect(validateSlug('site.name').valid).toBe(false);
  });

  it('rejects slugs starting or ending with hyphen', () => {
    expect(validateSlug('-mysite').valid).toBe(false);
    expect(validateSlug('mysite-').valid).toBe(false);
  });

  it('rejects slugs over 63 characters', () => {
    const longSlug = 'a'.repeat(64);
    expect(validateSlug(longSlug).valid).toBe(false);
  });

  it('rejects command injection attempts', () => {
    expect(validateSlug('$(whoami)').valid).toBe(false);
    expect(validateSlug('test;ls').valid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
    expect(validateEmail('user.name@example.co.jp').valid).toBe(true);
    expect(validateEmail('user+tag@example.com').valid).toBe(true);
  });

  it('rejects empty emails', () => {
    expect(validateEmail('').valid).toBe(false);
  });

  it('rejects invalid email formats', () => {
    expect(validateEmail('not-an-email').valid).toBe(false);
    expect(validateEmail('@example.com').valid).toBe(false);
    expect(validateEmail('user@').valid).toBe(false);
  });

  it('rejects emails over 254 characters', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    expect(validateEmail(longEmail).valid).toBe(false);
  });
});

describe('validateSiteTitle', () => {
  it('accepts valid titles', () => {
    expect(validateSiteTitle('My Site').valid).toBe(true);
    expect(validateSiteTitle('Site - 2024').valid).toBe(true);
    expect(validateSiteTitle("John's Blog").valid).toBe(true);
  });

  it('rejects empty titles', () => {
    expect(validateSiteTitle('').valid).toBe(false);
  });

  it('rejects titles over 200 characters', () => {
    const longTitle = 'a'.repeat(201);
    expect(validateSiteTitle(longTitle).valid).toBe(false);
  });

  it('rejects titles with dangerous characters', () => {
    expect(validateSiteTitle('$(whoami)').valid).toBe(false);
    expect(validateSiteTitle('test`ls`').valid).toBe(false);
    expect(validateSiteTitle('test;rm -rf').valid).toBe(false);
    expect(validateSiteTitle('test|cat /etc/passwd').valid).toBe(false);
  });
});

describe('validateThemeName', () => {
  it('accepts valid theme names', () => {
    expect(validateThemeName('twentytwentyfour').valid).toBe(true);
    expect(validateThemeName('theme-name').valid).toBe(true);
    expect(validateThemeName('theme_name').valid).toBe(true);
  });

  it('rejects empty theme names', () => {
    expect(validateThemeName('').valid).toBe(false);
  });

  it('rejects theme names with invalid characters', () => {
    expect(validateThemeName('Theme Name').valid).toBe(false);
    expect(validateThemeName('theme.name').valid).toBe(false);
    expect(validateThemeName('$(whoami)').valid).toBe(false);
  });
});

describe('validatePluginName', () => {
  it('accepts valid plugin names', () => {
    expect(validatePluginName('jetpack').valid).toBe(true);
    expect(validatePluginName('plugin-name').valid).toBe(true);
    expect(validatePluginName('plugin_name_123').valid).toBe(true);
  });

  it('rejects invalid plugin names', () => {
    expect(validatePluginName('').valid).toBe(false);
    expect(validatePluginName('Plugin Name').valid).toBe(false);
    expect(validatePluginName('../../../etc').valid).toBe(false);
  });
});

describe('validateUsername', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('admin').valid).toBe(true);
    expect(validateUsername('user_name').valid).toBe(true);
    expect(validateUsername('user-name').valid).toBe(true);
    expect(validateUsername('user@example.com').valid).toBe(true);
  });

  it('rejects invalid usernames', () => {
    expect(validateUsername('').valid).toBe(false);
    expect(validateUsername('user name').valid).toBe(false);
    expect(validateUsername('$(whoami)').valid).toBe(false);
  });
});

describe('validateAppName', () => {
  it('accepts valid app names', () => {
    expect(validateAppName('argo-note-site1').valid).toBe(true);
    expect(validateAppName('My App Name').valid).toBe(true);
  });

  it('rejects app names with dangerous characters', () => {
    expect(validateAppName('').valid).toBe(false);
    expect(validateAppName('app`ls`').valid).toBe(false);
    expect(validateAppName('app;rm -rf /').valid).toBe(false);
  });
});

describe('validateOptionKey', () => {
  it('accepts valid option keys', () => {
    expect(validateOptionKey('blogname').valid).toBe(true);
    expect(validateOptionKey('option_key').valid).toBe(true);
    expect(validateOptionKey('option-key').valid).toBe(true);
  });

  it('rejects invalid option keys', () => {
    expect(validateOptionKey('').valid).toBe(false);
    expect(validateOptionKey('option key').valid).toBe(false);
    expect(validateOptionKey('option.key').valid).toBe(false);
  });

  it('rejects keys over 191 characters', () => {
    const longKey = 'a'.repeat(192);
    expect(validateOptionKey(longKey).valid).toBe(false);
  });
});

describe('validateUrl', () => {
  it('accepts valid URLs', () => {
    expect(validateUrl('https://example.com').valid).toBe(true);
    expect(validateUrl('http://localhost:3000').valid).toBe(true);
    expect(validateUrl('https://sub.domain.co.jp/path').valid).toBe(true);
  });

  it('rejects empty URLs', () => {
    expect(validateUrl('').valid).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(validateUrl('not-a-url').valid).toBe(false);
    expect(validateUrl('ftp://example.com').valid).toBe(false);
    expect(validateUrl('javascript:alert(1)').valid).toBe(false);
  });
});
