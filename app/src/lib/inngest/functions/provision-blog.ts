// Argo Note - Provision Blog Function
// Creates WordPress site on VPS via WP-CLI

import { inngest } from '../client';
import { prisma } from '@/lib/prisma/client';
import { encrypt } from '@/lib/crypto';
import { WPCLIClient } from '@/lib/vps/wp-cli';

const DEFAULT_THEME = process.env.WP_DEFAULT_THEME || 'developer';

export const provisionBlog = inngest.createFunction(
  {
    id: 'provision-blog',
    retries: 3,
    // Limit concurrent provisions to avoid VPS overload
    concurrency: {
      limit: 2,
    },
    onFailure: async ({ error, event }) => {
      // Update site status to provision_failed
      // In Inngest v3, the original event data is in event.data.event.data
      const originalEvent = event.data.event as { data?: { siteId?: string } };
      const siteId = originalEvent?.data?.siteId;
      if (siteId) {
        await prisma.site.update({
          where: { id: siteId },
          data: {
            status: 'provision_failed',
          },
        });

        // Update job status to failed
        await prisma.job.updateMany({
          where: {
            jobType: 'PROVISION_BLOG',
            payload: {
              path: ['data', 'site_id'],
              equals: siteId,
            },
            status: { in: ['pending', 'processing'] },
          },
          data: {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          },
        });
      }
    },
  },
  { event: 'blog/provision' },
  async ({ event, step }) => {
    const { siteId, subdomain, theme, userEmail } = event.data;
    const selectedTheme = theme || DEFAULT_THEME;

    // Step 1: Update site status to provisioning
    await step.run('update-status-provisioning', async () => {
      await prisma.site.update({
        where: { id: siteId },
        data: { status: 'provisioning' },
      });
    });

    // Step 2: Get site details
    const site = await step.run('get-site-details', async () => {
      return prisma.site.findUnique({
        where: { id: siteId },
        include: {
          user: {
            select: { email: true },
          },
        },
      });
    });

    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }

    const email = userEmail || site.user?.email || 'admin@argonote.app';

    // Step 3: Create WordPress site on VPS via WP-CLI
    const wpSite = await step.run('create-wordpress-site', async () => {
      const wpCli = new WPCLIClient();

      try {
        await wpCli.connect();

        // Check if site already exists
        const exists = await wpCli.siteExists(subdomain);
        if (exists) {
          throw new Error(`Site with subdomain "${subdomain}" already exists`);
        }

        // Create the site
        const createResult = await wpCli.createSite({
          slug: subdomain,
          title: `${subdomain} Blog`,
          email: email,
        });

        if (!createResult.success) {
          throw new Error(createResult.error || 'Failed to create WordPress site');
        }

        // Create application password for API access
        const appPassword = await wpCli.createApplicationPassword(
          'admin',
          `argo-note-${subdomain}`,
          createResult.url
        );

        if (!appPassword) {
          throw new Error('Failed to create application password');
        }

        return {
          blogId: createResult.blogId,
          wpSiteUrl: createResult.url!,
          wpAdminUrl: `${createResult.url}/wp-admin`,
          wpApiToken: appPassword.password,
          wpUsername: 'admin',
        };
      } finally {
        wpCli.disconnect();
      }
    });

    // Step 4: Configure theme
    await step.run('configure-theme', async () => {
      const wpCli = new WPCLIClient();

      try {
        await wpCli.connect();

        // Install theme if not already installed
        await wpCli.installTheme(selectedTheme, false);

        // Activate theme for this site
        await wpCli.activateThemeForSite(selectedTheme, wpSite.wpSiteUrl);

        // Flush rewrite rules
        await wpCli.flushRewriteRules(wpSite.wpSiteUrl);
      } finally {
        wpCli.disconnect();
      }
    });

    // Step 5: Configure site settings
    await step.run('configure-site-settings', async () => {
      const wpCli = new WPCLIClient();

      try {
        await wpCli.connect();

        // Set permalink structure
        await wpCli.updateOption('permalink_structure', '/%postname%/', wpSite.wpSiteUrl);

        // Set timezone
        await wpCli.updateOption('timezone_string', 'Asia/Tokyo', wpSite.wpSiteUrl);

        // Flush rewrite rules again after permalink change
        await wpCli.flushRewriteRules(wpSite.wpSiteUrl);
      } finally {
        wpCli.disconnect();
      }
    });

    // Step 6: Update site status to active
    await step.run('update-status-active', async () => {
      // P-002: Encrypt wpApiToken before storing
      const encryptedToken = encrypt(wpSite.wpApiToken);

      await prisma.site.update({
        where: { id: siteId },
        data: {
          status: 'active',
          wpSiteUrl: wpSite.wpSiteUrl,
          wpAdminUrl: wpSite.wpAdminUrl,
          wpApiToken: encryptedToken,
          wpUsername: wpSite.wpUsername,
          // Note: slug (subdomain) is already set when site was created
        },
      });
    });

    // Step 7: Update job status
    await step.run('update-job-status', async () => {
      await prisma.job.updateMany({
        where: {
          jobType: 'PROVISION_BLOG',
          payload: {
            path: ['data', 'site_id'],
            equals: siteId,
          },
          status: 'pending',
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      siteId,
      subdomain,
      wpSiteUrl: wpSite.wpSiteUrl,
      wpAdminUrl: wpSite.wpAdminUrl,
    };
  }
);
