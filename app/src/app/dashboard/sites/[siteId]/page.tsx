// Argo Note - Site Detail Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const user = await requireAuth();
  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId: user.id,
    },
    include: {
      products: {
        include: {
          articleClusters: {
            include: {
              articles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      schedules: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      customDomains: true,
    },
  });

  if (!site) {
    notFound();
  }

  const totalArticles = site.products.reduce(
    (acc, p) =>
      acc + p.articleClusters.reduce((a, c) => a + c.articles.length, 0),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/sites"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sites
            </Link>
            <span className="text-gray-400">/</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {site.slug}.argonote.app
            </h1>
            <Badge
              variant={
                site.status === 'active'
                  ? 'success'
                  : site.status === 'provisioning'
                  ? 'warning'
                  : 'secondary'
              }
            >
              {site.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {site.status === 'active' && (
            <a
              href={`https://${site.slug}.argonote.app`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Visit Site</Button>
            </a>
          )}
          <Link href={`/dashboard/sites/${site.id}/settings`}>
            <Button variant="outline">Settings</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Products</p>
            <p className="text-2xl font-bold">{site.products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Articles</p>
            <p className="text-2xl font-bold">{totalArticles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Schedules</p>
            <p className="text-2xl font-bold">
              {site.schedules.filter((s) => s.isActive).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Custom Domains</p>
            <p className="text-2xl font-bold">{site.customDomains.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Link href={`/dashboard/products/new?siteId=${site.id}`}>
            <Button size="sm">Add Product</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {site.products.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No products yet. Add your first product to start generating articles.
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {site.products.map((product) => {
                const articleCount = product.articleClusters.reduce(
                  (a, c) => a + c.articles.length,
                  0
                );
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {product.name || 'Unnamed Product'}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {articleCount} articles, {product.articleClusters.length} clusters
                      </p>
                    </div>
                    <Badge
                      variant={
                        product.status === 'completed'
                          ? 'success'
                          : product.status === 'analyzing'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Schedules</CardTitle>
          <Link href={`/dashboard/schedules/new?siteId=${site.id}`}>
            <Button size="sm" variant="outline">
              Create Schedule
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {site.schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No schedules yet. Create a schedule to automate article publishing.
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {site.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {schedule.cronExpression || 'Manual'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {schedule.articlesPerRun} articles per run,{' '}
                      {schedule.publishMode} mode
                    </p>
                  </div>
                  <Badge variant={schedule.isActive ? 'success' : 'secondary'}>
                    {schedule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
