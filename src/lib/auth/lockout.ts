import { supabase } from '@/lib/db/supabase';
import { encodeIp, decodeIp } from '@/lib/security/ipCodec';

export interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  failedCount: number;
  message?: string;
}

export interface LoginAttemptRecord {
  id?: string;
  identifier: string;
  decodedIp: string;
  failedCount: number;
  lockedUntil: string | null;
  updatedAt?: string;
  isLocked: boolean;
  remainingSeconds: number;
}

// In-memory fallback map in case Supabase connection is down or table isn't migrated yet
const memoryLockoutStore = new Map<string, { failedCount: number; lockedUntil: number | null }>();

export function calculateLockoutDuration(failedCount: number): number {
  if (failedCount <= 0 || failedCount % 3 !== 0) return 0;
  
  const lockIndex = Math.floor(failedCount / 3);
  if (lockIndex === 1) return 10;  // 3 failed attempts = 10s lockout
  if (lockIndex === 2) return 30;  // 6 failed attempts = 30s lockout
  if (lockIndex === 3) return 60;  // 9 failed attempts = 60s lockout
  
  const extraSteps = lockIndex - 3;
  const duration = 60 * Math.pow(2, extraSteps);
  return Math.min(duration, 600); // Max 10 minutes (600s)
}

function normalizeIdentifier(identifier: string): string {
  if (!identifier) return 'ANONYMOUS';
  return identifier.startsWith('HASH_') ? identifier : encodeIp(identifier);
}

export async function getLockoutStatus(rawIdentifier: string): Promise<LockoutStatus> {
  const identifier = normalizeIdentifier(rawIdentifier);

  try {
    const { data: attempt, error } = await supabase
      .from('login_attempts')
      .select('*')
      .or(`identifier.eq.${identifier},identifier.eq.${rawIdentifier}`)
      .order('updatedAt', { ascending: false })
      .limit(1)
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

  const mem = memoryLockoutStore.get(identifier) || memoryLockoutStore.get(rawIdentifier);
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

export async function recordFailedAttempt(rawIdentifier: string): Promise<LockoutStatus> {
  const identifier = normalizeIdentifier(rawIdentifier);
  let currentFailedCount = 0;

  try {
    const { data: existing } = await supabase
      .from('login_attempts')
      .select('*')
      .or(`identifier.eq.${identifier},identifier.eq.${rawIdentifier}`)
      .order('updatedAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      currentFailedCount = existing.failedCount || 0;
    } else {
      const mem = memoryLockoutStore.get(identifier) || memoryLockoutStore.get(rawIdentifier);
      if (mem) currentFailedCount = mem.failedCount;
    }
  } catch (err) {
    const mem = memoryLockoutStore.get(identifier) || memoryLockoutStore.get(rawIdentifier);
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
  if (rawIdentifier !== identifier) {
    memoryLockoutStore.set(rawIdentifier, {
      failedCount: newFailedCount,
      lockedUntil: lockedUntilMs,
    });
  }

  // Try updating Supabase database with the decryptable hash representation
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

export async function resetLockout(rawIdentifier: string): Promise<void> {
  const identifier = normalizeIdentifier(rawIdentifier);
  memoryLockoutStore.delete(identifier);
  memoryLockoutStore.delete(rawIdentifier);

  try {
    await supabase
      .from('login_attempts')
      .delete()
      .or(`identifier.eq.${identifier},identifier.eq.${rawIdentifier}`);
  } catch (err) {
    console.error('[LOCKOUT RESET ERROR]:', err);
  }
}

/**
 * Retrieves all login attempt records enriched with decoded Real IPs.
 */
export async function getAllLoginAttempts(): Promise<LoginAttemptRecord[]> {
  try {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('*')
      .order('updatedAt', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      return data.map((item) => {
        const isLocked = Boolean(item.lockedUntil && new Date(item.lockedUntil) > new Date());
        const remainingSeconds = isLocked
          ? Math.max(0, Math.ceil((new Date(item.lockedUntil).getTime() - Date.now()) / 1000))
          : 0;

        return {
          id: item.id,
          identifier: item.identifier,
          decodedIp: decodeIp(item.identifier),
          failedCount: item.failedCount || 0,
          lockedUntil: item.lockedUntil || null,
          updatedAt: item.updatedAt || item.created_at,
          isLocked,
          remainingSeconds,
        };
      });
    }
  } catch (err) {
    console.error('[LOCKOUT GET ALL ERROR]:', err);
  }

  // Fallback to memory store
  const results: LoginAttemptRecord[] = [];
  const seen = new Set<string>();

  memoryLockoutStore.forEach((val, key) => {
    const decoded = decodeIp(key);
    if (seen.has(decoded)) return;
    seen.add(decoded);

    const isLocked = Boolean(val.lockedUntil && val.lockedUntil > Date.now());
    const remainingSeconds = isLocked ? Math.max(0, Math.ceil((val.lockedUntil! - Date.now()) / 1000)) : 0;

    results.push({
      identifier: key,
      decodedIp: decoded,
      failedCount: val.failedCount,
      lockedUntil: val.lockedUntil ? new Date(val.lockedUntil).toISOString() : null,
      isLocked,
      remainingSeconds,
    });
  });

  return results;
}




