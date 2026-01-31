/**
 * Input Validation Utility
 *
 * Provides validation functions for user input to prevent
 * injection attacks and ensure data integrity.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a WordPress site slug.
 *
 * Slugs must:
 * - Start and end with alphanumeric character
 * - Contain only lowercase letters, numbers, and hyphens
 * - Be 1-63 characters long (DNS subdomain limit)
 *
 * @param slug - The slug to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateSlug(slug: string): ValidationResult {
  if (slug == null || slug === '') {
    return { valid: false, error: 'Slug is required' };
  }

  // Single character case
  if (slug.length === 1) {
    if (/^[a-z0-9]$/.test(slug)) {
      return { valid: true };
    }
    return { valid: false, error: 'Single character slug must be alphanumeric' };
  }

  // Multi-character case: must start/end with alphanumeric, middle can have hyphens
  // Max 63 characters (DNS label limit)
  if (slug.length > 63) {
    return { valid: false, error: 'Slug must be 63 characters or less' };
  }

  // Pattern: start with alphanumeric, middle can have hyphens, end with alphanumeric
  const pattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  if (!pattern.test(slug)) {
    return {
      valid: false,
      error: 'Slug must contain only lowercase letters, numbers, and hyphens, and must start and end with alphanumeric character',
    };
  }

  return { valid: true };
}

/**
 * Validate an email address.
 *
 * Uses a practical regex that covers most valid email formats.
 *
 * @param email - The email to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateEmail(email: string): ValidationResult {
  if (email == null || email === '') {
    return { valid: false, error: 'Email is required' };
  }

  // Max length check (RFC 5321)
  if (email.length > 254) {
    return { valid: false, error: 'Email must be 254 characters or less' };
  }

  // Practical email validation regex
  // Covers most valid addresses without being overly permissive
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailPattern.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate a site title.
 *
 * Titles must:
 * - Be 1-200 characters
 * - Not contain dangerous characters that could be used for injection
 *
 * @param title - The title to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateSiteTitle(title: string): ValidationResult {
  if (title == null || title === '') {
    return { valid: false, error: 'Site title is required' };
  }

  if (title.length > 200) {
    return { valid: false, error: 'Site title must be 200 characters or less' };
  }

  // Check for dangerous characters that could enable injection
  // These are shell metacharacters and control characters
  const dangerousPattern = /[`$\\;\|&<>\x00-\x1f\x7f]/;
  if (dangerousPattern.test(title)) {
    return {
      valid: false,
      error: 'Site title contains invalid characters',
    };
  }

  return { valid: true };
}

/**
 * Validate a WordPress theme name.
 *
 * Theme names should only contain:
 * - Lowercase letters
 * - Numbers
 * - Underscores
 * - Hyphens
 *
 * @param theme - The theme name to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateThemeName(theme: string): ValidationResult {
  if (theme == null || theme === '') {
    return { valid: false, error: 'Theme name is required' };
  }

  // Max reasonable length for a theme name
  if (theme.length > 100) {
    return { valid: false, error: 'Theme name must be 100 characters or less' };
  }

  const pattern = /^[a-z0-9_-]+$/;
  if (!pattern.test(theme)) {
    return {
      valid: false,
      error: 'Theme name must contain only lowercase letters, numbers, underscores, and hyphens',
    };
  }

  return { valid: true };
}

/**
 * Validate a WordPress plugin name.
 *
 * Plugin names should only contain:
 * - Lowercase letters
 * - Numbers
 * - Underscores
 * - Hyphens
 *
 * @param plugin - The plugin name to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validatePluginName(plugin: string): ValidationResult {
  if (plugin == null || plugin === '') {
    return { valid: false, error: 'Plugin name is required' };
  }

  // Max reasonable length for a plugin name
  if (plugin.length > 100) {
    return { valid: false, error: 'Plugin name must be 100 characters or less' };
  }

  const pattern = /^[a-z0-9_-]+$/;
  if (!pattern.test(plugin)) {
    return {
      valid: false,
      error: 'Plugin name must contain only lowercase letters, numbers, underscores, and hyphens',
    };
  }

  return { valid: true };
}

/**
 * Validate a WordPress username.
 *
 * Usernames should only contain safe characters.
 *
 * @param username - The username to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateUsername(username: string): ValidationResult {
  if (username == null || username === '') {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length > 60) {
    return { valid: false, error: 'Username must be 60 characters or less' };
  }

  // WordPress username restrictions
  // Allow letters, numbers, underscores, hyphens, dots, and @ (for email-style usernames)
  const pattern = /^[a-zA-Z0-9_.@-]+$/;
  if (!pattern.test(username)) {
    return {
      valid: false,
      error: 'Username must contain only letters, numbers, underscores, hyphens, dots, and @',
    };
  }

  return { valid: true };
}

/**
 * Validate an application password name.
 *
 * Application password names are displayed in WordPress admin,
 * so we allow more characters but still prevent injection.
 *
 * @param name - The application name to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateAppName(name: string): ValidationResult {
  if (name == null || name === '') {
    return { valid: false, error: 'Application name is required' };
  }

  if (name.length > 100) {
    return { valid: false, error: 'Application name must be 100 characters or less' };
  }

  // Check for dangerous characters
  const dangerousPattern = /[`$\\;\|&<>\x00-\x1f\x7f]/;
  if (dangerousPattern.test(name)) {
    return {
      valid: false,
      error: 'Application name contains invalid characters',
    };
  }

  return { valid: true };
}

/**
 * Validate an option key name.
 *
 * Option keys should be safe strings for WordPress options table.
 *
 * @param key - The option key to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateOptionKey(key: string): ValidationResult {
  if (key == null || key === '') {
    return { valid: false, error: 'Option key is required' };
  }

  if (key.length > 191) {
    return { valid: false, error: 'Option key must be 191 characters or less' };
  }

  // WordPress option keys - allow alphanumeric, underscores, hyphens
  const pattern = /^[a-zA-Z0-9_-]+$/;
  if (!pattern.test(key)) {
    return {
      valid: false,
      error: 'Option key must contain only letters, numbers, underscores, and hyphens',
    };
  }

  return { valid: true };
}

/**
 * Validate a URL.
 *
 * @param url - The URL to validate
 * @returns ValidationResult with valid status and optional error
 */
export function validateUrl(url: string): ValidationResult {
  if (url == null || url === '') {
    return { valid: false, error: 'URL is required' };
  }

  if (url.length > 2048) {
    return { valid: false, error: 'URL must be 2048 characters or less' };
  }

  // Use URL constructor for validation
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must use http or https protocol' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
