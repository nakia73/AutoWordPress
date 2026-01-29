// Argo Note - Next.js Middleware
// Handles authentication and route protection

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/inngest (Inngest webhook)
     * - api/stripe/webhook (Stripe webhook)
     * - dev/ (development pages - no auth required)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/inngest|api/stripe/webhook|dev/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
