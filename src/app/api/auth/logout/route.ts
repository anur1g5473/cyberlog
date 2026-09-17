import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/db/audit';

export async function POST() {
  await logSecurityEvent({
    eventType: 'LOGOUT',
    action: 'Admin Session Terminated',
    status: 'SUCCESS',
    actorHash: 'ROOT_ADMIN',
  });
  await clearAdminSession();
  return NextResponse.json({ success: true, message: 'Logged out successfully.' });
}

