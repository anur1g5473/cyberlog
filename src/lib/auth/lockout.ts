import { supabase } from '@/lib/db/supabase';

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  failedCount: number;
  message?: string;
}

// In-memory fallback map in case Supabase connection is down or table isn't migrated yet
const memoryLockoutStore = new Map<string, { failedCount: number; lockedUntil: number | null }>();

export function calculateLockoutDuration(failedCount: number): number {
  // Only trigger lockout on exact multiples of 3 attempts (3, 6, 9, 12...)
  if (failedCount <= 0 || failedCount % 3 !== 0) return 0;
  
  const lockIndex = Math.floor(failedCount / 3);
  if (lockIndex === 1) return 10;  // 3 failed attempts = 10s lockout
  if (lockIndex === 2) return 30;  // 6 failed attempts = 30s lockout
  if (lockIndex === 3) return 60;  // 9 failed attempts = 60s lockout
  
  const extraSteps = lockIndex - 3;
  const duration = 60 * Math.pow(2, extraSteps);
  return Math.min(duration, 600); // Max 10 minutes (600s)
}

export async function getLockoutStatus(identifier: string): Promise<LockoutStatus> {
  try {
    const { data: attempt, error } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .maybeSingle();

    if (!error && attempt) {
      if (attempt.lockedUntil && new Date(attempt.lockedUntil) > new Date()) {
        const remainingMs = new Date(attempt.lockedUntil).getTime() - Date.now();
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        return {
          isLocked: true,
          remainingSeconds,
          failedCount: attempt.failedCount || 0,
          message: `Security Lockout Active. Origin locked out for ${remainingSeconds} second(s).`,
        };
      }
      return {
        isLocked: false,
        remainingSeconds: 0,
        failedCount: attempt.failedCount || 0,
      };
    }
  } catch (err) {
    console.error('[LOCKOUT DB GET ERROR]:', err);
  }

  // Fallback to memory store if DB check returns no row or fails
  const mem = memoryLockoutStore.get(identifier);
  if (mem && mem.lockedUntil && mem.lockedUntil > Date.now()) {
    const remainingSeconds = Math.ceil((mem.lockedUntil - Date.now()) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      failedCount: mem.failedCount,
      message: `Security Lockout Active. Origin locked out for ${remainingSeconds} second(s).`,
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    failedCount: mem?.failedCount || 0,
  };
}

export async function recordFailedAttempt(identifier: string): Promise<LockoutStatus> {
  let currentFailedCount = 0;

  try {
    const { data: existing } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('identifier', identifier)
      .maybeSingle();

    if (existing) {
      currentFailedCount = existing.failedCount || 0;
    } else {
      const mem = memoryLockoutStore.get(identifier);
      if (mem) currentFailedCount = mem.failedCount;
    }
  } catch (err) {
    const mem = memoryLockoutStore.get(identifier);
    if (mem) currentFailedCount = mem.failedCount;
  }

  const newFailedCount = currentFailedCount + 1;
  const lockoutDurationSec = calculateLockoutDuration(newFailedCount);
  const now = Date.now();
  const lockedUntilMs = lockoutDurationSec > 0 ? now + lockoutDurationSec * 1000 : null;
  const lockedUntilIso = lockedUntilMs ? new Date(lockedUntilMs).toISOString() : null;

  // Update memory fallback store
  memoryLockoutStore.set(identifier, {
    failedCount: newFailedCount,
    lockedUntil: lockedUntilMs,
  });

  // Try updating Supabase database
  try {
    await supabase.from('login_attempts').upsert(
      {
        identifier,
        failedCount: newFailedCount,
        lockedUntil: lockedUntilIso,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: 'identifier' }
    );
  } catch (err) {
    console.error('[LOCKOUT DB UPSERT ERROR]:', err);
  }

  const remainingSeconds = lockoutDurationSec;
  const attemptsMod = newFailedCount % 3;
  const attemptsRemaining = attemptsMod === 0 ? 0 : 3 - attemptsMod;

  return {
    isLocked: remainingSeconds > 0,
    remainingSeconds,
    failedCount: newFailedCount,
    message: remainingSeconds > 0
      ? `Authentication threshold exceeded. Origin locked out for ${remainingSeconds} second(s).`
      : `Invalid passphrase. Warning: ${attemptsRemaining} attempt(s) remaining before lockout penalty.`,
  };
}

export async function resetLockout(identifier: string): Promise<void> {
  memoryLockoutStore.delete(identifier);
  try {
    await supabase.from('login_attempts').delete().eq('identifier', identifier);
  } catch (err) {
    console.error('[LOCKOUT RESET ERROR]:', err);
  }
}



