import { NextRequest, NextResponse } from 'next/server';
import { getRecentScans } from '@/server/db/scan-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history
 * REST API to retrieve incident audit records.
 * Automatically scopes records by the visitor ID provided via header or cookie.
 */
export async function GET(req: NextRequest) {
  try {
    const visitorId =
      req.headers.get('x-visitor-id') ||
      req.cookies.get('phishlens_visitor_id')?.value;

    const limitQuery = req.nextUrl.searchParams.get('limit');
    const limit = limitQuery ? parseInt(limitQuery, 10) : 50;

    const scans = visitorId ? await getRecentScans(limit, visitorId) : [];

    return NextResponse.json(
      {
        total: scans.length,
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
