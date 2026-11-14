import { NextRequest, NextResponse } from 'next/server';
import { getRecentScans } from '@/server/db/scan-service';
import { getSessionUser } from '@/server/auth/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history
 * REST API to retrieve incident audit records.
 * Automatically scopes records by authenticated userId or visitorId.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const visitorId =
      req.headers.get('x-visitor-id') ||
      req.cookies.get('phishlens_visitor_id')?.value;

    const limitQuery = req.nextUrl.searchParams.get('limit');
    const limit = limitQuery ? parseInt(limitQuery, 10) : 50;

    const scans = sessionUser
      ? await getRecentScans(limit, undefined, sessionUser.id)
      : visitorId
      ? await getRecentScans(limit, visitorId)
      : [];

    return NextResponse.json(
      {
        total: scans.length,
        authenticated: Boolean(sessionUser),
        user: sessionUser ? { id: sessionUser.id, email: sessionUser.email } : null,
        visitorId: visitorId || 'anonymous',
        scans,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'FETCH_HISTORY_FAILED', message: error.message || 'Failed to retrieve scan history' },
      { status: 500 }
    );
  }
}
