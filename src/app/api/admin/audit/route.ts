import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getRecentAuditLogs } from '@/lib/db/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized root access' }, { status: 401 });
  }

  const logs = await getRecentAuditLogs(30);
  return NextResponse.json({ success: true, data: logs });
}
