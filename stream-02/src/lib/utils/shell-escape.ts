/**
 * Shell Escape Utility
 *
 * Provides secure shell argument escaping to prevent command injection attacks.
 * Uses single-quote wrapping with proper escaping for the safest approach.
 */

/**
 * Escape a string for safe use as a shell argument.
 *
 * Uses single-quote wrapping which prevents interpretation of:
 * - Variable expansion ($VAR)
 * - Command substitution ($(cmd) or `cmd`)
 * - Special characters (;, |, &, <, >, etc.)
 *
 * Single quotes within the string are handled by ending the quoted section,
 * adding an escaped single quote, and starting a new quoted section.
 *
 * @example
 * escapeShellArg("hello world") // "'hello world'"
 * escapeShellArg("it's") // "'it'\\''s'"
 * escapeShellArg("$(whoami)") // "'$(whoami)'" (safe, not executed)
 *
 * @param arg - The string to escape
 * @returns The escaped string safe for shell use
 */
export function escapeShellArg(arg: string): string {
  // Handle null/undefined gracefully
  if (arg == null) {
    return "''";
  }

  // Convert to string if needed
  const str = String(arg);

  // Empty string case
  if (str === '') {
    return "''";
  }

  // Single-quote wrapping strategy:
  // 1. Wrap entire string in single quotes
  // 2. For any single quote in the string: end quotes, add escaped quote, restart quotes
  // Example: "it's" becomes 'it'\''s'
  return "'" + str.replace(/'/g, "'\\''") + "'";
}

/**
 * Escape multiple arguments and join them with spaces.
 *
 * @param args - Array of strings to escape
 * @returns Space-separated escaped arguments
 */
export function escapeShellArgs(args: string[]): string {
  return args.map(escapeShellArg).join(' ');
}

/**
 * Validates that a value is safe for use in a shell command context
 * WITHOUT escaping. This is for values that should only contain
 * alphanumeric characters and safe symbols.
 *
 * @param value - The value to validate
 * @param allowedPattern - Regex pattern of allowed characters (default: alphanumeric, dash, underscore)
 * @returns true if safe, false if contains unsafe characters
 */
export function isShellSafe(value: string, allowedPattern: RegExp = /^[a-zA-Z0-9_-]+$/): boolean {
  if (value == null || value === '') {
    return false;
  }
  return allowedPattern.test(value);
}
