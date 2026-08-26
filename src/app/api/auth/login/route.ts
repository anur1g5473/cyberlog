import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassphrase } from '@/lib/auth/passphrase';
import { getLockoutStatus, recordFailedAttempt, resetLockout } from '@/lib/auth/lockout';
import { verifyMathChallenge } from '@/lib/auth/challenge';
import { createAdminSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    // 1. Identify origin (IP address)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || '127.0.0.1';

    // 2. Check active lockout status before doing heavy cryptographic work
    const lockout = await getLockoutStatus(ip);
    if (lockout.isLocked) {
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
    const { passphrase, challengeToken, challengeAnswer } = body;

    // 3. Verify Server-Validated Math Challenge
    const captchaCheck = await verifyMathChallenge(challengeToken, challengeAnswer);
    if (!captchaCheck.success) {
      const lockoutUpdate = await recordFailedAttempt(ip);
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

    // 5. Successful Authentication -> Reset lockout counter & issue HttpOnly JWT session
    await resetLockout(ip);
    await createAdminSession();

    return NextResponse.json({
      success: true,
      message: captchaCheck.message || 'Access granted. Welcome back admin.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server authentication processing error.' },
      { status: 500 }
    );
  }
}
