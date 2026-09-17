import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassphrase } from '@/lib/auth/passphrase';
import { getLockoutStatus, recordFailedAttempt, resetLockout } from '@/lib/auth/lockout';
import { verifyMathChallenge } from '@/lib/auth/challenge';
import { createAdminSession } from '@/lib/auth/session';
import { verifyTotpCode } from '@/lib/auth/totp';
import { env } from '@/lib/config/env';
import { logSecurityEvent } from '@/lib/db/audit';
import { encodeIp } from '@/lib/security/ipCodec';

function getActorHash(ip: string): string {
  return encodeIp(ip);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Identify origin (IP address)
    const forwarded = req.headers.get('x-forwarded-for');
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : req.ip || '127.0.0.1';
    const ip = rawIp === '::1' ? '127.0.0.1' : rawIp;
    const actorHash = getActorHash(ip);

    // 2. Check active lockout status before doing heavy cryptographic work
    const lockout = await getLockoutStatus(ip);
    if (lockout.isLocked) {
      await logSecurityEvent({
        eventType: 'AUTH_LOCKOUT',
        action: 'Blocked login attempt on locked origin',
        status: 'DENIED',
        details: { ip: actorHash, realIp: ip, remainingSeconds: lockout.remainingSeconds },
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
        details: { message: captchaCheck.message, origin: actorHash, realIp: ip },
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
        details: { failedCount: lockoutUpdate.failedCount, origin: actorHash, realIp: ip },
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
          details: { totpProvided: Boolean(totpCode), origin: actorHash, realIp: ip },
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
      details: { totpVerified: isTotpEnforced, origin: actorHash, realIp: ip },
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


