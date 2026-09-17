import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { generateTotpSecret, getTotpUri, generateTotpCode } from '@/lib/auth/totp';
import { env } from '@/lib/config/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ success: false, message: 'Unauthorized root access' }, { status: 401 });
  }

  const existingSecret = process.env.AUTHENTICATOR || process.env.ADMIN_TOTP_SECRET || env.AUTHENTICATOR || env.ADMIN_TOTP_SECRET || '';
  const isConfigured = Boolean(existingSecret && existingSecret.trim().length > 0);

  // If already configured, show masked secret and status
  if (isConfigured) {
    return NextResponse.json({
      success: true,
      isConfigured: true,
      secretPreview: existingSecret.slice(0, 4) + '****************' + existingSecret.slice(-4),
      otpauthUri: getTotpUri(existingSecret),
      currentTestCode: generateTotpCode(existingSecret),
    });
  }

  // Otherwise generate a fresh secret for setup
  const generatedSecret = generateTotpSecret();
  const otpauthUri = getTotpUri(generatedSecret);

  return NextResponse.json({
    success: true,
    isConfigured: false,
    generatedSecret,
    otpauthUri,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUri)}`,
  });
}
