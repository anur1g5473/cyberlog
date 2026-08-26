/**
 * Environment configuration validator & getter.
 * Centralized location for all system configuration constants.
 */

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  ADMIN_PASSPHRASE_HASH: process.env.ADMIN_PASSPHRASE_HASH || '',
  ADMIN_PASSPHRASE: process.env.ADMIN_PASSPHRASE || '',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-cybersecurity-admin-jwt-key-2026-secure-random',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: process.env.NODE_ENV !== 'production',
};

/**
 * Validates critical environment variables on server boot.
 */
export function validateEnv() {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 16) {
    console.warn('[SECURITY WARNING] JWT_SECRET is missing or insecurely short.');
  }
}
