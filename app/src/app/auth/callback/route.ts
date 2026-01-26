// Argo Note - Auth Callback Route
// Handles OAuth callback from Supabase Auth

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_exchange_error`);
    }

    if (data.user) {
      // Sync user to database
      try {
        await syncUserToDatabase(data.user);
      } catch (syncError) {
        console.error('[Auth Callback] syncUserToDatabase error:', syncError);
        // Continue with login even if sync fails - user can be synced later
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to error page if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

// Sync Supabase user to Prisma database
async function syncUserToDatabase(user: {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}) {
  const email = user.email;
  if (!email) return;

  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || undefined;
  const avatarUrl = user.user_metadata?.avatar_url || undefined;

  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email,
      name,
      avatarUrl,
    },
    create: {
      id: user.id,
      email,
      name,
      avatarUrl,
    },
  });
}
