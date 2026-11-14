import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/server/auth/session';
import { prisma } from '@/server/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);

    if (user) {
      // Authenticated user has unlimited scans
      const userScansCount = await prisma.scan.count({
        where: { userId: user.id },
      });

      return NextResponse.json({
        authenticated: true,
        user,
        isUnlimited: true,
        scansCount: userScansCount,
      });
    }

    // Guest / Anonymous User: calculate scans used across IP, deviceHash, and visitorId
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const deviceHash = req.headers.get('x-device-hash') || 'unknown';
    const visitorId =
      req.headers.get('x-visitor-id') ||
      req.cookies.get('phishlens_visitor_id')?.value ||
      'anonymous';

    // Strict multi-vector check: any scan matching device, IP, or visitorId counts towards the 10 limit
    const conditions: any[] = [];
    if (deviceHash && deviceHash !== 'unknown' && deviceHash !== 'server-environment') {
      conditions.push({ deviceHash });
    }
    if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
      conditions.push({ ipAddress });
    }
    if (visitorId && visitorId !== 'anonymous') {
      conditions.push({ visitorId });
    }

    let scansUsed = 0;
    if (conditions.length > 0) {
      scansUsed = await prisma.scan.count({
        where: {
          userId: null,
          OR: conditions,
        },
      });
    }

    const maxAllowed = 10;
    const remainingScans = Math.max(0, maxAllowed - scansUsed);

    return NextResponse.json({
      authenticated: false,
      user: null,
      isUnlimited: false,
      scansUsed,
      maxAllowed,
      remainingScans,
      limitReached: scansUsed >= maxAllowed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'CHECK_FAILED', message: err?.message || 'Failed to determine session state' },
      { status: 500 }
    );
  }
}
