import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { getAllLoginAttempts, resetLockout } from '@/lib/auth/lockout';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized root access' }, { status: 401 });
  }

  const attempts = await getAllLoginAttempts();
  return NextResponse.json({ success: true, data: attempts });
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized root access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { identifier } = body;
    if (!identifier) {
      return NextResponse.json({ success: false, message: 'Identifier required' }, { status: 400 });
    }

    await resetLockout(identifier);
    const updated = await getAllLoginAttempts();
    return NextResponse.json({ success: true, message: 'Lockout penalty cleared', data: updated });
  } catch (err) {
    console.error('Failed to reset lockout:', err);
    return NextResponse.json({ success: false, message: 'Failed to reset lockout' }, { status: 500 });
  }
}
