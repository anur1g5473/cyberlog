import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Validates candidate admin passphrase against configured stored hash in environment.
 * 
 * @param candidatePassphrase Plaintext passphrase submitted by caller
 * @returns boolean indicating match
 */
export async function verifyAdminPassphrase(candidatePassphrase: string): Promise<boolean> {
  if (!candidatePassphrase || typeof candidatePassphrase !== 'string') {
    return false;
  }

  const trimmed = candidatePassphrase.trim();

  // 1. Hash comparison check against bcrypt hash
  const hash = process.env.ADMIN_PASSPHRASE_HASH || env.ADMIN_PASSPHRASE_HASH;
  if (hash && hash.length > 0) {
    try {
      const isMatch = await bcrypt.compare(trimmed, hash);
      if (isMatch) return true;
    } catch (err) {
      console.error('[AUTH ERROR] Hash comparison failed:', err);
    }
  }

  // 2. Direct equality check against ADMIN_PASSPHRASE env if explicitly set
  if (process.env.ADMIN_PASSPHRASE && trimmed === process.env.ADMIN_PASSPHRASE) {
    return true;
  }

  return false;
}

/**
 * Utility to hash a new passphrase with standard work factor (10 salt rounds)
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(passphrase, salt);
}

