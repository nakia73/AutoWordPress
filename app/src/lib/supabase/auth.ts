// Argo Note - Auth Helper Functions
// Server-side auth utilities

import { createServerSupabaseClient } from './server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';

// Get current user (throws redirect if not authenticated)
export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

// Get current user (returns null if not authenticated)
export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// Get user with database record
export async function getUserWithProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      sites: true,
      products: true,
    },
  });

  return { authUser: user, profile };
}

// Sign out
export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}
