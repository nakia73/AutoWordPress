// Argo Note - Articles List Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';

const statusVariantMap: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  draft: 'secondary',
  generating: 'warning',
  review: 'default',
  published: 'success',
  archived: 'secondary',
  failed: 'destructive',
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { status?: string; productId?: string };
}) {
  const user = await requireAuth();

  const articles = await prisma.article.findMany({
    where: {
      cluster: {
        product: {
          userId: user.id,
          ...(searchParams.productId && { id: searchParams.productId }),
        },
      },
      ...(searchParams.status && { status: searchParams.status }),
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
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get article counts by status
  const statusCounts = await prisma.article.groupBy({
    by: ['status'],
    where: {
      cluster: {
        product: {
          userId: user.id,
        },
      },
    },
    _count: true,
  });

  const counts = {
    all: articles.length,
    draft: statusCounts.find((s) => s.status === 'draft')?._count || 0,
    generating: statusCounts.find((s) => s.status === 'generating')?._count || 0,
    review: statusCounts.find((s) => s.status === 'review')?._count || 0,
    published: statusCounts.find((s) => s.status === 'published')?._count || 0,
  };

  const currentFilter = searchParams.status || 'all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and review your generated articles
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/dashboard/articles">
          <Button
            variant={currentFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All ({counts.all})
          </Button>
        </Link>
        <Link href="/dashboard/articles?status=draft">
          <Button
            variant={currentFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
          >
            Draft ({counts.draft})
          </Button>
        </Link>
        <Link href="/dashboard/articles?status=generating">
          <Button
            variant={currentFilter === 'generating' ? 'default' : 'outline'}
            size="sm"
          >
            Generating ({counts.generating})
          </Button>
        </Link>
        <Link href="/dashboard/articles?status=review">
          <Button
            variant={currentFilter === 'review' ? 'default' : 'outline'}
            size="sm"
          >
            Review ({counts.review})
          </Button>
        </Link>
        <Link href="/dashboard/articles?status=published">
          <Button
            variant={currentFilter === 'published' ? 'default' : 'outline'}
            size="sm"
          >
            Published ({counts.published})
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchParams.status
                ? `No ${searchParams.status} articles found.`
                : 'No articles yet. Add a product to start generating articles.'}
            </p>
            <Link href="/dashboard/products/new">
              <Button>Add Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/dashboard/articles/${article.id}`}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        {article.title || 'Untitled Article'}
                      </Link>
                      <Badge variant={statusVariantMap[article.status] || 'secondary'}>
                        {article.status}
                      </Badge>
                    </div>
                    {article.targetKeyword && (
                      <p className="text-sm text-gray-600 mb-2">
                        Target: <span className="font-medium">{article.targetKeyword}</span>
                      </p>
                    )}
                    {article.metaDescription && (
                      <p className="text-sm text-gray-500 mb-3">
                        {truncate(article.metaDescription, 150)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Product:{' '}
                        <Link
                          href={`/dashboard/products/${article.cluster.product.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {article.cluster.product.name || 'Unnamed'}
                        </Link>
                      </span>
                      <span>
                        Site:{' '}
                        <Link
                          href={`/dashboard/sites/${article.cluster.product.siteId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {article.cluster.product.site.slug}
                        </Link>
                      </span>
                      <span>Type: {article.articleType}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Created {formatDate(article.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.status === 'review' && (
                      <Link href={`/dashboard/articles/${article.id}/review`}>
                        <Button size="sm">Review</Button>
                      </Link>
                    )}
                    {article.status === 'published' && article.wpPostId && (
                      <a
                        href={`https://${article.cluster.product.site.slug}.argonote.app/?p=${article.wpPostId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </a>
                    )}
                    <Link href={`/dashboard/articles/${article.id}`}>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
