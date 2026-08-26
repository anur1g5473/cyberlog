import { supabase } from '@/lib/db/supabase';

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  failedCount: number;
  message?: string;
}

export function calculateLockoutDuration(failedCount: number): number {
  if (failedCount < 3) return 0;
  if (failedCount < 6) return 10;
  if (failedCount < 9) return 30;
  if (failedCount < 12) return 60;
  
  const extraSteps = Math.floor((failedCount - 12) / 3) + 1;
  const duration = 60 * Math.pow(2, extraSteps);
  return Math.min(duration, 600);
}

export async function getLockoutStatus(identifier: string): Promise<LockoutStatus> {
  try {
    const { data: attempt, error } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .single();

    if (error || !attempt) {
      return { isLocked: false, remainingSeconds: 0, failedCount: 0 };
    }

    if (attempt.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
      const remainingMs = new Date(attempt.lockedUntil).getTime() - Date.now();
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return {
        isLocked: true,
        remainingSeconds,
        failedCount: attempt.failedCount,
        message: `Security Lockout Active. System unresponsive to this origin for ${remainingSeconds} second(s).`,
      };
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      failedCount: attempt.failedCount || 0,
    };
  } catch (error) {
    console.error('[LOCKOUT DB ERROR]:', error);
    return { isLocked: false, remainingSeconds: 0, failedCount: 0 };
  }
}

export async function recordFailedAttempt(identifier: string): Promise<LockoutStatus> {
  try {
    const { data: existing } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .single();

    const newFailedCount = ((existing?.failedCount) || 0) + 1;
    const lockoutDurationSec = calculateLockoutDuration(newFailedCount);
    
    let lockedUntil: string | null = null;
    if (lockoutDurationSec > 0) {
      lockedUntil = new Date(Date.now() + lockoutDurationSec * 1000).toISOString();
    }

    await supabase.from('login_attempts').upsert({
      identifier,
      failedCount: newFailedCount,
      lockedUntil,
      updatedAt: new Date().toISOString(),
    });

    const remainingSeconds = lockoutDurationSec;
    return {
      isLocked: remainingSeconds > 0,
      remainingSeconds,
      failedCount: newFailedCount,
      message: remainingSeconds > 0
        ? `Authentication threshold exceeded. Origin locked out for ${remainingSeconds} seconds.`
        : `Invalid passphrase. Warning: ${3 - (newFailedCount % 3)} attempt(s) remaining before lockout penalty.`,
    };
  } catch (error) {
    console.error('[LOCKOUT RECORD ERROR]:', error);
    return { isLocked: false, remainingSeconds: 0, failedCount: 1 };
  }
}

export async function resetLockout(identifier: string): Promise<void> {
  try {
    await supabase.from('login_attempts').delete().eq('identifier', identifier);
  } catch (error) {
    console.error('[LOCKOUT RESET ERROR]:', error);
  }
}

