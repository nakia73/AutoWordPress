// Argo Note - Article Detail Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { ArticleActions } from './article-actions';

const statusVariantMap: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  draft: 'secondary',
  generating: 'warning',
  review: 'default',
  published: 'success',
  archived: 'secondary',
  failed: 'destructive',
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const user = await requireAuth();
  const { articleId } = await params;

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
          product: {
            include: {
              site: true,
            },
          },
        },
      },
      generationLogs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!article) {
    notFound();
  }

  const latestLog = article.generationLogs[0];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/articles"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Articles
            </Link>
            <span className="text-gray-400">/</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {article.title || 'Untitled Article'}
            </h1>
            <Badge variant={statusVariantMap[article.status] || 'secondary'}>
              {article.status}
            </Badge>
          </div>
        </div>
        <ArticleActions article={article} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {article.content ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {article.status === 'generating'
                    ? 'Article is being generated...'
                    : article.status === 'draft'
                    ? 'Article content not yet generated.'
                    : 'No content available.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta Info */}
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Target Keyword</p>
                <p className="font-medium">{article.targetKeyword || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Search Intent</p>
                <p className="font-medium">{article.searchIntent || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Article Type</p>
                <p className="font-medium capitalize">{article.articleType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Meta Description</p>
                <p className="text-sm">{article.metaDescription || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDateTime(article.createdAt)}</p>
              </div>
              {article.publishedAt && (
                <div>
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="font-medium">{formatDateTime(article.publishedAt)}</p>
                </div>
              )}
              {article.wpPostId && (
                <div>
                  <p className="text-sm text-gray-500">WordPress Post ID</p>
                  <p className="font-medium">{article.wpPostId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/dashboard/products/${article.cluster.product.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {article.cluster.product.name || 'Unnamed Product'}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                Site: {article.cluster.product.site.slug}.argonote.app
              </p>
              <p className="text-sm text-gray-500">
                Cluster: {article.cluster.pillarKeyword || 'No pillar keyword'}
              </p>
            </CardContent>
          </Card>

          {/* Generation Log */}
          {latestLog && (
            <Card>
              <CardHeader>
                <CardTitle>Generation Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{latestLog.modelUsed || 'Unknown'}</p>
                </div>
                {latestLog.generationTimeMs && (
                  <div>
                    <p className="text-sm text-gray-500">Generation Time</p>
                    <p className="font-medium">
                      {(latestLog.generationTimeMs / 1000).toFixed(1)}s
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
