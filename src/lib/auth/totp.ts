import crypto from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodes a Base32 string into a Buffer.
 */
function base32Decode(base32: string): Buffer {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanBase32.length; i++) {
    const char = cleanBase32[i];
    const index = BASE32_CHARS.indexOf(char);
    if (index === -1) {
      continue; // Skip invalid characters
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Encodes a Buffer into a Base32 string.
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Generates a random 20-byte Base32 TOTP secret for Google Authenticator.
 */
export function generateTotpSecret(): string {
  const randomBytes = crypto.randomBytes(20);
  return base32Encode(randomBytes);
}

/**
 * Computes an RFC 6238 TOTP 6-digit code for a given secret and counter.
 */
export function generateTotpCode(secret: string, timestampMs = Date.now()): string {
  const key = base32Decode(secret);
  const epochSeconds = Math.floor(timestampMs / 1000);
  const timeStep = Math.floor(epochSeconds / 30);

  // 8-byte big-endian counter buffer
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(timeStep));

  // Compute HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();

  // Dynamic truncation (RFC 4226 / 6238)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binaryCode % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verifies a 6-digit TOTP code against a secret with a +/- 1 step (30s) drift tolerance.
 */
export function verifyTotpCode(inputCode: string, secret: string): boolean {
  if (!inputCode || !secret) return false;
  const cleanCode = inputCode.trim();
  if (cleanCode.length !== 6) return false;

  const now = Date.now();
  const timeSteps = [-30000, 0, 30000]; // Check T-1, T, T+1 for clock sync

  for (const delta of timeSteps) {
    const expected = generateTotpCode(secret, now + delta);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expected))) {
      return true;
    }
  }

  return false;
}

/**
 * Builds standard otpauth URI for QR code generators / Google Authenticator.
 */
export function getTotpUri(secret: string, accountName = 'anurag@cyberlog', issuer = 'Cyberlog Security'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
