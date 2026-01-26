// Argo Note - Check Subdomain Availability API
// POST /api/sites/check-availability

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';

const schema = z.object({
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
      message:
        'Subdomain must start and end with alphanumeric, contain only lowercase letters, numbers, and hyphens',
    }),
});

// Reserved subdomains
const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'dashboard',
  'blog',
  'mail',
  'smtp',
  'ftp',
  'cdn',
  'static',
  'assets',
  'images',
  'img',
  'js',
  'css',
  'support',
  'help',
  'docs',
  'status',
  'test',
  'dev',
  'staging',
  'prod',
  'production',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain } = schema.parse(body);

    // Check if reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return NextResponse.json({ available: false, reason: 'reserved' });
    }

    // Check if already taken
    const existingSite = await prisma.site.findUnique({
      where: { slug: subdomain },
    });

    if (existingSite) {
      return NextResponse.json({ available: false, reason: 'taken' });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { available: false, reason: 'invalid', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error checking subdomain availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
