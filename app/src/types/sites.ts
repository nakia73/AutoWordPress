// Argo Note - Site Type Definitions
// Based on: docs/architecture/02_Backend_Database.md
// Integration fixes from: docs/architecture/08_Integration_Risk_Report.md IR-012, IR-025

// Site Status - IR-025: Added pending, provision_failed, deleted
export const SITE_STATUS = {
  PENDING: 'pending',
  PROVISIONING: 'provisioning',
  PROVISION_FAILED: 'provision_failed',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const;

export type SiteStatus = (typeof SITE_STATUS)[keyof typeof SITE_STATUS];

// Site provisioning result
export type SiteProvisioningResult = {
  success: boolean;
  site_url?: string;
  wp_admin_url?: string;
  wp_username?: string;
  error?: string;
};

// Site configuration
export type SiteConfig = {
  subdomain: string;
  theme: string;
  language: 'en' | 'ja';
  timezone: string;
};

// Default theme for MVP
export const DEFAULT_THEME = 'generatepress';

// Subdomain validation
export const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export function isValidSubdomain(subdomain: string): boolean {
  return SUBDOMAIN_REGEX.test(subdomain);
}
