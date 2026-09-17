import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { env } from '@/lib/config/env';
import { recordPageView, getTelemetryStats } from '@/lib/db/telemetry';

export const dynamic = 'force-dynamic';

function generateVisitorHash(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || '127.0.0.1';
  const ua = req.headers.get('user-agent') || '';
  const salt = env.TELEMETRY_SALT || 'cyberlog_telemetry_salt_secret';

  return crypto
    .createHash('sha256')
    .update(`${ip}:${salt}:${ua.slice(0, 100)}`)
    .digest('hex');
}

export async function GET() {
  try {
    const stats = await getTelemetryStats();
    return NextResponse.json({
      success: true,
      data: stats,
      privacy: 'Zero-PII SHA-256 Salted Cryptographic Telemetry (GDPR Compliant)',
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
      visitorNode: visitorHash.slice(0, 8),
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
