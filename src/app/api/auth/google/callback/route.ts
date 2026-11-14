import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/server/db/prisma';
import { createSessionToken } from '@/server/auth/jwt';
import { setSessionCookie } from '@/server/auth/session';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=google_auth_cancelled', req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token } = tokenRes.data;

    // Fetch user profile from Google
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { sub: googleId, email, name, picture } = profileRes.data;

    if (!email) {
      return NextResponse.redirect(new URL('/?error=google_missing_email', req.url));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email: normalizedEmail }],
      },
    });

    if (user) {
      // Update googleId and image if not already set
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          image: user.image || picture,
          name: user.name || name,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          googleId,
          name: name || normalizedEmail.split('@')[0],
          image: picture,
          role: 'user',
        },
      });
    }

    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.redirect(new URL('/?login=google_success', req.url));
    setSessionCookie(response, sessionToken);
    return response;
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(err?.message || 'google_auth_failed')}`, req.url));
  }
}
