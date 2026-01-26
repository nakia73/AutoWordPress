import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/auth';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      {/* Main content area with sidebar offset */}
      <main className="lg:pl-[280px] min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
