// Argo Note - Sites List Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default async function SitesPage() {
  const user = await requireAuth();

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    include: {
      products: {
        include: {
          articleClusters: {
            include: {
              articles: true,
            },
          },
        },
      },
      _count: {
        select: {
          products: true,
          schedules: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your WordPress sites
          </p>
        </div>
        <Link href="/dashboard/sites/new">
          <Button>Add Site</Button>
        </Link>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You don&apos;t have any sites yet.</p>
            <Link href="/dashboard/sites/new">
              <Button>Create Your First Site</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => {
            const totalArticles = site.products.reduce(
              (acc, p) =>
                acc +
                p.articleClusters.reduce((a, c) => a + c.articles.length, 0),
              0
            );
            const publishedArticles = site.products.reduce(
              (acc, p) =>
                acc +
                p.articleClusters.reduce(
                  (a, c) =>
                    a + c.articles.filter((art) => art.status === 'published').length,
                  0
                ),
              0
            );

            return (
              <Card key={site.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/dashboard/sites/${site.id}`}
                          className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                          {site.slug}.argonote.app
                        </Link>
                        <Badge
                          variant={
                            site.status === 'active'
                              ? 'success'
                              : site.status === 'provisioning'
                              ? 'warning'
                              : site.status === 'provision_failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {site.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Products</p>
                          <p className="text-lg font-medium">{site._count.products}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Articles</p>
                          <p className="text-lg font-medium">{totalArticles}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Published</p>
                          <p className="text-lg font-medium">{publishedArticles}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Schedules</p>
                          <p className="text-lg font-medium">{site._count.schedules}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-4">
                        Created {formatDate(site.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {site.status === 'active' && (
                        <a
                          href={`https://${site.slug}.argonote.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            Visit Site
                          </Button>
                        </a>
                      )}
                      <Link href={`/dashboard/sites/${site.id}`}>
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
