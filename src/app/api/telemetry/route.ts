import { NextRequest, NextResponse } from 'next/server';
import { recordPageView, getTelemetryStats } from '@/lib/db/telemetry';
import { encodeIp } from '@/lib/security/ipCodec';

export const dynamic = 'force-dynamic';

function generateVisitorHash(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const rawIp = forwarded ? forwarded.split(',')[0].trim() : req.ip || '127.0.0.1';
  const ip = rawIp === '::1' ? '127.0.0.1' : rawIp;
  return encodeIp(ip);
}

export async function GET() {
  try {
    const stats = await getTelemetryStats();
    return NextResponse.json({
      success: true,
      data: stats,
      privacy: 'Origin-Hashed Real-Time Telemetry & Session Monitoring',
    });
  } catch (error) {
    console.error('Telemetry GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve telemetry stats' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path : '/';

    const visitorHash = generateVisitorHash(req);
    await recordPageView(visitorHash, path);

    const stats = await getTelemetryStats();

    return NextResponse.json({
      success: true,
      visitorNode: visitorHash.slice(0, 16),
      stats,
    });
  } catch (error) {
    console.error('Telemetry POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record telemetry' },
      { status: 500 }
    );
  }
}

