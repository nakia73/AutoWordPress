// Argo Note - Products API

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { siteId, name, url, description } = body;

    // Validate site belongs to user
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: user.id,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        siteId,
        name,
        url,
        description,
        status: 'pending',
      },
    });

    // Create job for product analysis
    const job = await prisma.job.create({
      data: {
        jobType: 'ANALYZE_PRODUCT',
        payload: {
          type: 'ANALYZE_PRODUCT',
          data: {
            product_id: product.id,
            mode: 'url',
            url,
          },
        },
        status: 'pending',
      },
    });

    // Trigger Inngest function for product analysis
    await inngest.send({
      name: 'product/analyze',
      data: {
        productId: product.id,
        mode: 'url',
        url,
      },
    });

    return NextResponse.json({ product, job });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');

    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
        ...(siteId && { siteId }),
      },
      include: {
        site: true,
        articleClusters: {
          include: {
            articles: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
