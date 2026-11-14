import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { createSessionToken } from '@/server/auth/jwt';
import { setSessionCookie } from '@/server/auth/session';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // If real Google OAuth credentials are provided, redirect to Google OAuth consent
  if (clientId && clientSecret && !clientId.includes('your-client-id')) {
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Developer / Demo Mode Fallback:
  // If Google credentials are not yet configured in .env, log in as verified demo user
  try {
    const demoEmail = 'analyst.demo@phishlens.internal';
    let user = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: demoEmail,
          name: 'Verified Security Operator',
          role: 'analyst',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          googleId: 'google-demo-id-883921',
        },
      });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.redirect(new URL('/?login=google_success', req.url));
    setSessionCookie(response, token);
    return response;
  } catch (err: any) {
    return NextResponse.redirect(new URL('/?error=google_oauth_pending', req.url));
  }
}
