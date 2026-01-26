'use client';

// Argo Note - Dashboard Content Component
// Client component for interactive dashboard elements

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type DashboardContentProps = {
  profile: {
    id: string;
    email: string;
    name: string | null;
    subscriptionStatus: string;
    sites: Array<{
      id: string;
      slug: string;
      status: string;
      products: Array<{
        id: string;
        name: string | null;
        articleClusters: Array<{
          articles: Array<{
            id: string;
            title: string | null;
            status: string;
          }>;
        }>;
      }>;
    }>;
  };
};

export default function DashboardContent({ profile }: DashboardContentProps) {
  // Calculate stats
  const totalArticles = profile.sites.reduce((acc, site) => {
    return (
      acc +
      site.products.reduce((pAcc, product) => {
        return (
          pAcc +
          product.articleClusters.reduce((cAcc, cluster) => {
            return cAcc + cluster.articles.length;
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const publishedArticles = profile.sites.reduce((acc, site) => {
    return (
      acc +
      site.products.reduce((pAcc, product) => {
        return (
          pAcc +
          product.articleClusters.reduce((cAcc, cluster) => {
            return (
              cAcc +
              cluster.articles.filter((a) => a.status === 'published').length
            );
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const reviewArticles = profile.sites.reduce((acc, site) => {
    return (
      acc +
      site.products.reduce((pAcc, product) => {
        return (
          pAcc +
          product.articleClusters.reduce((cAcc, cluster) => {
            return (
              cAcc +
              cluster.articles.filter((a) => a.status === 'review').length
            );
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const totalProducts = profile.sites.reduce(
    (acc, site) => acc + site.products.length,
    0
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {profile.name || profile.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Sites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.sites.filter((s) => s.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500">
              {profile.sites.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-gray-500">across all sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles}</div>
            <p className="text-xs text-gray-500">
              {publishedArticles} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewArticles}</div>
            <Link
              href="/dashboard/articles?status=review"
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/products/new">
            <Button>Add Product</Button>
          </Link>
          <Link href="/dashboard/articles?status=review">
            <Button variant="outline">Review Articles</Button>
          </Link>
          <Link href="/dashboard/schedules/new">
            <Button variant="outline">Create Schedule</Button>
          </Link>
        </div>
      </div>

      {/* Sites List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Sites</CardTitle>
          <Link href="/dashboard/sites">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            {profile.sites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <Link
                    href={`/dashboard/sites/${site.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {site.slug}.argonote.app
                  </Link>
                  <p className="text-sm text-gray-500">
                    {site.products.length} products,{' '}
                    {site.products.reduce(
                      (acc, p) =>
                        acc +
                        p.articleClusters.reduce(
                          (a, c) => a + c.articles.length,
                          0
                        ),
                      0
                    )}{' '}
                    articles
                  </p>
                </div>
                <div className="flex items-center gap-3">
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
                  <a
                    href={`https://${site.slug}.argonote.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Visit
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
