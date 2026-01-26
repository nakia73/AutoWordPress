// Argo Note - Article Actions API

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { inngest } from '@/lib/inngest/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const user = await requireAuth();
    const { articleId } = await params;
    const { action } = await request.json();

    // Verify article belongs to user
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        cluster: {
          product: {
            userId: user.id,
          },
        },
      },
      include: {
        cluster: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'generate': {
        // Trigger article generation
        await prisma.article.update({
          where: { id: article.id },
          data: { status: 'generating' },
        });

        await inngest.send({
          name: 'article/generate',
          data: {
            articleId: article.id,
            productId: article.cluster.productId,
            targetKeyword: article.targetKeyword || '',
            clusterId: article.clusterId,
          },
        });

        return NextResponse.json({ success: true, status: 'generating' });
      }

      case 'publish': {
        // Trigger WordPress sync
        await inngest.send({
          name: 'wordpress/sync',
          data: {
            articleId: article.id,
            siteId: article.cluster.product.siteId,
            action: 'create' as const,
          },
        });

        return NextResponse.json({ success: true, status: 'publishing' });
      }

      case 'unpublish': {
        if (!article.wpPostId) {
          return NextResponse.json(
            { error: 'Article is not published' },
            { status: 400 }
          );
        }

        // Trigger WordPress delete
        await inngest.send({
          name: 'wordpress/sync',
          data: {
            articleId: article.id,
            siteId: article.cluster.product.siteId,
            action: 'delete' as const,
          },
        });

        return NextResponse.json({ success: true, status: 'unpublishing' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Article action error:', error);
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    );
  }
}
