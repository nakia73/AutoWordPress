import { describe, it, expect } from 'vitest';
import { escapeShellArg, escapeShellArgs, isShellSafe } from '../shell-escape';

describe('escapeShellArg', () => {
  it('wraps simple strings in single quotes', () => {
    expect(escapeShellArg('hello')).toBe("'hello'");
  });

  it('handles strings with spaces', () => {
    expect(escapeShellArg('hello world')).toBe("'hello world'");
  });

  it('escapes single quotes', () => {
    expect(escapeShellArg("it's")).toBe("'it'\\''s'");
    expect(escapeShellArg("don't")).toBe("'don'\\''t'");
  });

  it('handles empty strings', () => {
    expect(escapeShellArg('')).toBe("''");
  });

  it('handles null/undefined', () => {
    expect(escapeShellArg(null as unknown as string)).toBe("''");
    expect(escapeShellArg(undefined as unknown as string)).toBe("''");
  });

  it('prevents command substitution', () => {
    const malicious = '$(whoami)';
    const escaped = escapeShellArg(malicious);
    // Single quotes prevent command substitution
    expect(escaped).toBe("'$(whoami)'");
    expect(escaped).not.toContain('\\$');
  });

  it('prevents backtick command substitution', () => {
    const malicious = '`rm -rf /`';
    const escaped = escapeShellArg(malicious);
    expect(escaped).toBe("'`rm -rf /`'");
  });

  it('handles special shell characters safely', () => {
    const special = 'test;ls|cat&echo';
    const escaped = escapeShellArg(special);
    expect(escaped).toBe("'test;ls|cat&echo'");
  });

  it('handles double quotes', () => {
    const withQuotes = 'say "hello"';
    const escaped = escapeShellArg(withQuotes);
    expect(escaped).toBe("'say \"hello\"'");
  });

  it('handles newlines', () => {
    const withNewline = "line1\nline2";
    const escaped = escapeShellArg(withNewline);
    expect(escaped).toBe("'line1\nline2'");
  });
});

describe('escapeShellArgs', () => {
  it('escapes multiple arguments', () => {
    const args = ['hello', 'world'];
    expect(escapeShellArgs(args)).toBe("'hello' 'world'");
  });

  it('handles empty array', () => {
    expect(escapeShellArgs([])).toBe('');
  });
});

describe('isShellSafe', () => {
  it('returns true for alphanumeric strings', () => {
    expect(isShellSafe('hello123')).toBe(true);
    expect(isShellSafe('Test_Name-123')).toBe(true);
  });

  it('returns false for strings with special characters', () => {
    expect(isShellSafe('hello world')).toBe(false);
    expect(isShellSafe('test;ls')).toBe(false);
    expect(isShellSafe('$(whoami)')).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(isShellSafe('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isShellSafe(null as unknown as string)).toBe(false);
    expect(isShellSafe(undefined as unknown as string)).toBe(false);
  });

  it('accepts custom patterns', () => {
    expect(isShellSafe('hello.world', /^[a-z.]+$/)).toBe(true);
    expect(isShellSafe('hello world', /^[a-z.]+$/)).toBe(false);
  });
});
