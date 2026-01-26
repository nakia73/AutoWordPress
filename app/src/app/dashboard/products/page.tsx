// Argo Note - Products List Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';

export default async function ProductsPage() {
  const user = await requireAuth();

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    include: {
      site: true,
      articleClusters: {
        include: {
          articles: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your products and their article clusters
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You don&apos;t have any products yet.</p>
            <Link href="/dashboard/products/new">
              <Button>Add Your First Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const totalArticles = product.articleClusters.reduce(
              (acc, c) => acc + c.articles.length,
              0
            );
            const publishedArticles = product.articleClusters.reduce(
              (acc, c) =>
                acc + c.articles.filter((a) => a.status === 'published').length,
              0
            );

            return (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                          {product.name || 'Unnamed Product'}
                        </Link>
                        <Badge
                          variant={
                            product.status === 'completed'
                              ? 'success'
                              : product.status === 'analyzing'
                              ? 'warning'
                              : product.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {truncate(product.description, 150)}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Site:{' '}
                          <Link
                            href={`/dashboard/sites/${product.siteId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {product.site.slug}.argonote.app
                          </Link>
                        </span>
                        <span>{product.articleClusters.length} clusters</span>
                        <span>
                          {publishedArticles}/{totalArticles} articles published
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Added {formatDate(product.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.status === 'completed' && (
                        <Link href={`/dashboard/products/${product.id}/articles`}>
                          <Button variant="outline" size="sm">
                            View Articles
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
