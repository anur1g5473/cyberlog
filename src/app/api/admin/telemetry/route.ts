import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getRecentVisitorLogs, getTelemetryStats } from '@/lib/db/telemetry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized root access' }, { status: 401 });
  }

  const [visitors, stats] = await Promise.all([
    getRecentVisitorLogs(35),
    getTelemetryStats(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      visitors,
      stats,
    },
  });
}
