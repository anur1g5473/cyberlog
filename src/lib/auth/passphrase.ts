import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Validates candidate admin passphrase against configured stored hash or env fallback.
 * Uses bcrypt's built-in timing-safe constant time string comparison.
 * 
 * @param candidatePassphrase Plaintext passphrase submitted by caller
 * @returns boolean indicating match
 */
export async function verifyAdminPassphrase(candidatePassphrase: string): Promise<boolean> {
  if (!candidatePassphrase || typeof candidatePassphrase !== 'string') {
    return false;
  }

  // 1. If stored hash is present, check against hash
  if (env.ADMIN_PASSPHRASE_HASH && env.ADMIN_PASSPHRASE_HASH.length > 0) {
    try {
      return await bcrypt.compare(candidatePassphrase, env.ADMIN_PASSPHRASE_HASH);
    } catch (err) {
      console.error('[AUTH ERROR] Hash comparison failed:', err);
      return false;
    }
  }

  // 2. Fallback to direct env plaintext check with timing-safe comparison logic
  // (Used for initial bootstrapping before hash generation)
  const expected = env.ADMIN_PASSPHRASE;
  if (!expected) return false;

  return constantTimeCompare(candidatePassphrase, expected);
}

/**
 * Utility to hash a new passphrase with standard work factor (10 salt rounds)
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(passphrase, salt);
}

/**
 * Constant time string comparison to mitigate timing side-channel attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
