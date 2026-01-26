// Argo Note - Complete Onboarding API
// POST /api/onboarding/complete
// Creates site, product, and triggers provisioning + analysis jobs

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/client';
import { inngest } from '@/lib/inngest/client';
import { z } from 'zod';

const schema = z.object({
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
  productUrl: z.string().url().optional().or(z.literal('')),
  productName: z.string().min(1).max(255),
  productDescription: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input
    const body = await request.json();
    const { subdomain, productUrl, productName, productDescription } =
      schema.parse(body);

    // Check if subdomain is available
    const existingSite = await prisma.site.findUnique({
      where: { slug: subdomain },
    });

    if (existingSite) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 409 }
      );
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
      },
    });

    // Create site
    const site = await prisma.site.create({
      data: {
        userId: user.id,
        slug: subdomain,
        status: 'provisioning',
      },
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        siteId: site.id,
        url: productUrl || `https://${subdomain}.argonote.app`,
        name: productName,
        description: productDescription,
      },
    });

    // Create provisioning job
    const provisionJob = await prisma.job.create({
      data: {
        jobType: 'PROVISION_BLOG',
        payload: {
          type: 'PROVISION_BLOG',
          data: {
            site_id: site.id,
            user_id: user.id,
            subdomain: subdomain,
            theme: 'generatepress',
          },
        },
        status: 'pending',
      },
    });

    // Create analysis job
    const analysisJob = await prisma.job.create({
      data: {
        jobType: 'ANALYZE_PRODUCT',
        payload: {
          type: 'ANALYZE_PRODUCT',
          data: {
            product_id: product.id,
            mode: productUrl ? 'url' : 'interactive',
            url: productUrl || undefined,
          },
        },
        status: 'pending',
      },
    });

    // Trigger Inngest events
    await Promise.all([
      inngest.send({
        name: 'blog/provision',
        data: {
          siteId: site.id,
          userId: user.id,
          subdomain: subdomain,
          theme: 'generatepress',
        },
      }),
      inngest.send({
        name: 'product/analyze',
        data: {
          productId: product.id,
          mode: productUrl ? 'url' : 'interactive',
          url: productUrl || undefined,
        },
      }),
    ]);

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: user.id,
        action: 'onboarding.complete',
        targetType: 'site',
        targetId: site.id,
        metadata: {
          subdomain,
          productName,
          hasProductUrl: !!productUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      site: {
        id: site.id,
        slug: site.slug,
        status: site.status,
      },
      product: {
        id: product.id,
        name: product.name,
      },
      jobs: {
        provision: provisionJob.id,
        analysis: analysisJob.id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
