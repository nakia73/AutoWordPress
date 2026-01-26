// Argo Note - New Product Page

import { requireAuth } from '@/lib/supabase/auth';
import { prisma } from '@/lib/prisma/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NewProductForm } from './new-product-form';

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { siteId?: string };
}) {
  const user = await requireAuth();

  // Get user's sites for the form
  const sites = await prisma.site.findMany({
    where: {
      userId: user.id,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (sites.length === 0) {
    redirect('/onboarding');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to Products
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            Add a product to generate SEO-optimized articles for it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewProductForm
            sites={sites}
            defaultSiteId={searchParams.siteId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
