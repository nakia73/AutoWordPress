// Argo Note - Stream 02 WP-CLI Wrapper
// Executes WordPress CLI commands on the VPS

import { SSHClient, SSHExecuteResult } from './ssh-client';

// Default WordPress path on the VPS
const WP_PATH = process.env.WP_PATH || '/var/www/wordpress';
const WP_DOMAIN = process.env.WP_DOMAIN || 'argonote.app';

export interface WPSiteCreateOptions {
  slug: string;
  title: string;
  email: string;
}

export interface WPSiteInfo {
  blogId: number;
  url: string;
  registered: string;
  lastUpdated: string;
  public: boolean;
  archived: boolean;
  mature: boolean;
  spam: boolean;
  deleted: boolean;
}

export interface WPApplicationPassword {
  uuid: string;
  password: string;
  name: string;
}

export class WPCLIClient {
  private sshClient: SSHClient;
  private wpPath: string;

  constructor(wpPath?: string) {
    this.sshClient = new SSHClient();
    this.wpPath = wpPath || WP_PATH;
  }

  /**
   * Execute a WP-CLI command
   */
  private async wpCommand(command: string): Promise<SSHExecuteResult> {
    const fullCommand = `cd ${this.wpPath} && wp ${command} --allow-root`;
    return this.sshClient.execute(fullCommand);
  }

  /**
   * Connect to VPS
   */
  async connect(): Promise<void> {
    await this.sshClient.connect();
  }

  /**
   * Disconnect from VPS
   */
  disconnect(): void {
    this.sshClient.disconnect();
  }

  /**
   * Create a new WordPress site in the multisite network
   */
  async createSite(options: WPSiteCreateOptions): Promise<{ success: boolean; blogId?: number; url?: string; error?: string }> {
    const { slug, title, email } = options;
    const url = `${slug}.${WP_DOMAIN}`;

    try {
      // Create the site
      const result = await this.wpCommand(
        `site create --slug="${slug}" --title="${title}" --email="${email}" --porcelain`
      );

      if (result.code !== 0) {
        return {
          success: false,
          error: result.stderr || 'Failed to create WordPress site',
        };
      }

      // The --porcelain flag returns just the blog ID
      const blogId = parseInt(result.stdout.trim(), 10);

      return {
        success: true,
        blogId,
        url: `https://${url}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get list of all sites in the multisite network
   */
  async getSiteList(): Promise<WPSiteInfo[]> {
    const result = await this.wpCommand('site list --format=json');

    if (result.code !== 0) {
      throw new Error(`Failed to get site list: ${result.stderr}`);
    }

    try {
      const sites = JSON.parse(result.stdout);
      return sites.map((site: Record<string, unknown>) => ({
        blogId: parseInt(String(site.blog_id), 10),
        url: String(site.url),
        registered: String(site.registered),
        lastUpdated: String(site.last_updated),
        public: site.public === '1',
        archived: site.archived === '1',
        mature: site.mature === '1',
        spam: site.spam === '1',
        deleted: site.deleted === '1',
      }));
    } catch {
      throw new Error('Failed to parse site list');
    }
  }

  /**
   * Check if a site exists by slug
   */
  async siteExists(slug: string): Promise<boolean> {
    const url = `https://${slug}.${WP_DOMAIN}`;
    const result = await this.wpCommand(`site list --url="${url}" --format=count`);

    if (result.code !== 0) {
      return false;
    }

    return parseInt(result.stdout.trim(), 10) > 0;
  }

  /**
   * Delete a site from the multisite network
   */
  async deleteSite(blogId: number): Promise<boolean> {
    const result = await this.wpCommand(`site delete ${blogId} --yes`);
    return result.code === 0;
  }

  /**
   * Create an application password for API access
   */
  async createApplicationPassword(
    username: string,
    appName: string,
    siteUrl?: string
  ): Promise<WPApplicationPassword | null> {
    const urlFlag = siteUrl ? `--url="${siteUrl}"` : '';
    const result = await this.wpCommand(
      `user application-password create "${username}" "${appName}" --porcelain ${urlFlag}`
    );

    if (result.code !== 0) {
      console.error('Failed to create application password:', result.stderr);
      return null;
    }

    // Output format: uuid password
    const parts = result.stdout.trim().split(/\s+/);
    if (parts.length >= 2) {
      return {
        uuid: parts[0],
        password: parts[1],
        name: appName,
      };
    }

    return null;
  }

  /**
   * Install and activate a theme
   */
  async installTheme(theme: string, activate: boolean = true): Promise<boolean> {
    // Check if theme is already installed
    const checkResult = await this.wpCommand(`theme is-installed ${theme}`);

    if (checkResult.code !== 0) {
      // Install the theme
      const installResult = await this.wpCommand(`theme install ${theme}`);
      if (installResult.code !== 0) {
        console.error('Failed to install theme:', installResult.stderr);
        return false;
      }
    }

    if (activate) {
      const activateResult = await this.wpCommand(`theme activate ${theme}`);
      return activateResult.code === 0;
    }

    return true;
  }

  /**
   * Activate a theme for a specific site
   */
  async activateThemeForSite(theme: string, siteUrl: string): Promise<boolean> {
    const result = await this.wpCommand(`theme activate ${theme} --url="${siteUrl}"`);
    return result.code === 0;
  }

  /**
   * Install and activate a plugin
   */
  async installPlugin(plugin: string, activate: boolean = true): Promise<boolean> {
    // Check if plugin is already installed
    const checkResult = await this.wpCommand(`plugin is-installed ${plugin}`);

    if (checkResult.code !== 0) {
      // Install the plugin
      const installResult = await this.wpCommand(`plugin install ${plugin}`);
      if (installResult.code !== 0) {
        console.error('Failed to install plugin:', installResult.stderr);
        return false;
      }
    }

    if (activate) {
      const activateResult = await this.wpCommand(`plugin activate ${plugin} --network`);
      return activateResult.code === 0;
    }

    return true;
  }

  /**
   * Get WordPress version
   */
  async getVersion(): Promise<string> {
    const result = await this.wpCommand('core version');
    if (result.code !== 0) {
      throw new Error('Failed to get WordPress version');
    }
    return result.stdout.trim();
  }

  /**
   * Check if WP-CLI is available
   */
  async checkWPCLI(): Promise<boolean> {
    try {
      await this.connect();
      const result = await this.wpCommand('--version');
      return result.code === 0;
    } catch {
      return false;
    } finally {
      this.disconnect();
    }
  }

  /**
   * Flush rewrite rules for a site
   */
  async flushRewriteRules(siteUrl?: string): Promise<boolean> {
    const urlFlag = siteUrl ? `--url="${siteUrl}"` : '';
    const result = await this.wpCommand(`rewrite flush ${urlFlag}`);
    return result.code === 0;
  }

  /**
   * Update site option
   */
  async updateOption(key: string, value: string, siteUrl?: string): Promise<boolean> {
    const urlFlag = siteUrl ? `--url="${siteUrl}"` : '';
    const result = await this.wpCommand(`option update "${key}" "${value}" ${urlFlag}`);
    return result.code === 0;
  }
}

/**
 * Create a WordPress site with full setup (convenience function)
 */
export async function provisionWordPressSite(options: {
  slug: string;
  title: string;
  email: string;
  theme?: string;
}): Promise<{
  success: boolean;
  blogId?: number;
  url?: string;
  applicationPassword?: WPApplicationPassword;
  error?: string;
}> {
  const wpCli = new WPCLIClient();

  try {
    await wpCli.connect();

    // Check if site already exists
    const exists = await wpCli.siteExists(options.slug);
    if (exists) {
      return {
        success: false,
        error: `Site with slug "${options.slug}" already exists`,
      };
    }

    // Create the site
    const createResult = await wpCli.createSite({
      slug: options.slug,
      title: options.title,
      email: options.email,
    });

    if (!createResult.success) {
      return createResult;
    }

    // Create application password for API access
    const appPassword = await wpCli.createApplicationPassword(
      'admin', // Assuming admin user
      `argo-note-${options.slug}`,
      createResult.url
    );

    // Activate theme if specified
    if (options.theme && createResult.url) {
      await wpCli.activateThemeForSite(options.theme, createResult.url);
    }

    return {
      success: true,
      blogId: createResult.blogId,
      url: createResult.url,
      applicationPassword: appPassword || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    wpCli.disconnect();
  }
}
