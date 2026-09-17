import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminPassphrase } from '@/lib/auth/passphrase';
import { getLockoutStatus, recordFailedAttempt, resetLockout } from '@/lib/auth/lockout';
import { verifyMathChallenge } from '@/lib/auth/challenge';
import { createAdminSession } from '@/lib/auth/session';
import { verifyTotpCode } from '@/lib/auth/totp';
import { env } from '@/lib/config/env';
import { logSecurityEvent } from '@/lib/db/audit';

function getActorHash(ip: string, userAgent = ''): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${env.TELEMETRY_SALT}:${userAgent.slice(0, 50)}`)
    .digest('hex')
    .slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Identify origin (IP address)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';
    const actorHash = getActorHash(ip, userAgent);

    // 2. Check active lockout status before doing heavy cryptographic work
    const lockout = await getLockoutStatus(ip);
    if (lockout.isLocked) {
      await logSecurityEvent({
        eventType: 'AUTH_LOCKOUT',
        action: 'Blocked login attempt on locked origin',
        status: 'DENIED',
        details: { ip: ip.slice(0, 7) + '.***', remainingSeconds: lockout.remainingSeconds },
        actorHash,
      });

      return NextResponse.json(
        {
          success: false,
          message: lockout.message,
          remainingSeconds: lockout.remainingSeconds,
          isLocked: true,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { passphrase, challengeToken, challengeAnswer, totpCode } = body;

    // 3. Verify Server-Validated Math Challenge
    const captchaCheck = await verifyMathChallenge(challengeToken, challengeAnswer);
    if (!captchaCheck.success) {
      const lockoutUpdate = await recordFailedAttempt(ip);

      await logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        action: 'Failed Math Challenge / Bot Defense',
        status: 'WARNING',
        details: { message: captchaCheck.message },
        actorHash,
      });

      return NextResponse.json(
        {
          success: false,
          message: captchaCheck.message,
          isLocked: lockoutUpdate.isLocked,
          remainingSeconds: lockoutUpdate.remainingSeconds,
        },
        { status: 400 }
      );
    }

    // 4. Verify Passphrase (Timing-Safe constant-time check)
    const isPassphraseValid = await verifyAdminPassphrase(passphrase);

    if (!isPassphraseValid) {
      const lockoutUpdate = await recordFailedAttempt(ip);

      await logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        action: 'Invalid Master Passphrase',
        status: 'DENIED',
        details: { failedCount: lockoutUpdate.failedCount },
        actorHash,
      });

      return NextResponse.json(
        {
          success: false,
          message: lockoutUpdate.message,
          isLocked: lockoutUpdate.isLocked,
          remainingSeconds: lockoutUpdate.remainingSeconds,
        },
        { status: 401 }
      );
    }

    // 5. Zero-Trust TOTP 2FA Verification (If configured or enforced in production)
    const totpSecret = process.env.AUTHENTICATOR || process.env.ADMIN_TOTP_SECRET || env.AUTHENTICATOR || env.ADMIN_TOTP_SECRET;
    const isTotpEnforced = Boolean(totpSecret && totpSecret.trim().length > 0);

    if (isTotpEnforced) {
      if (!totpCode || !verifyTotpCode(totpCode, totpSecret)) {
        const lockoutUpdate = await recordFailedAttempt(ip);

        await logSecurityEvent({
          eventType: 'AUTH_FAILURE',
          action: 'Invalid or missing Google Authenticator TOTP code',
          status: 'DENIED',
          details: { totpProvided: Boolean(totpCode) },
          actorHash,
        });

        return NextResponse.json(
          {
            success: false,
            message: 'Invalid or expired Google Authenticator 2FA code.',
            requiresTotp: true,
            isLocked: lockoutUpdate.isLocked,
            remainingSeconds: lockoutUpdate.remainingSeconds,
          },
          { status: 401 }
        );
      }
    }

    // 6. Successful Zero-Trust Authentication
    await resetLockout(ip);
    await createAdminSession();

    await logSecurityEvent({
      eventType: 'AUTH_SUCCESS',
      action: 'Root Admin Authenticated (Zero-Trust Session Issued)',
      status: 'SUCCESS',
      details: { totpVerified: isTotpEnforced },
      actorHash,
    });

    return NextResponse.json({
      success: true,
      message: 'Access granted. Welcome back admin.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server authentication processing error.' },
      { status: 500 }
    );
  }
}

