import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PRODUCTION_URL = 'https://tur2tur.com';

function getOrigin(request: Request): string {
  // 1. Explicit site URL (check both env var names)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (siteUrl) {
    return siteUrl.replace(/\/$/, '');
  }
  // 2. Forwarded host (reverse proxy / Hostinger)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  // 3. Host header — if it's internal (0.0.0.0, localhost), use production URL
  const host = request.headers.get('host') ?? '';
  const isInternal = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0') || host.includes(':3000');
  if (isInternal) {
    return PRODUCTION_URL;
  }
  return `https://${host}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const nextParam = searchParams.get('next') ?? `/${locale}/dashboard`;
  // Prevent open redirect — only allow relative paths
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : `/${locale}/dashboard`;

  const origin = getOrigin(request);

  // Handle OAuth errors from Supabase (e.g. bad_oauth_state)
  if (error) {
    console.error('[auth/callback] OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/${locale}/auth/login?error=${error}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[auth/callback] Code exchange failed:', exchangeError.message);
  }

  return NextResponse.redirect(`${origin}/${locale}/auth/login?error=auth_failed`);
}
