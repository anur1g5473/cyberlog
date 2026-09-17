/**
 * IP Address Reversible Alphabet Codec
 * 
 * Translates IP addresses (IPv4 & IPv6) into an obfuscated, alphabet-based pseudo-hash
 * string for public/storage layers, and losslessly decodes it back to the exact Real IP
 * for authenticated admin inspection.
 * 
 * Mapping Scheme (Bijective 1-to-1):
 * - Digits 0-9   -> 'a' through 'j'
 * - Dot '.'      -> 'x'
 * - Colon ':'    -> 'z'
 * - Percent '%'  -> 'q'
 * - Dash '-'     -> 'v'
 * - IPv6 hex a-f -> 'A' through 'F'
 */

const DIGIT_TO_ALPHA: Record<string, string> = {
  '0': 'a',
  '1': 'b',
  '2': 'c',
  '3': 'd',
  '4': 'e',
  '5': 'f',
  '6': 'g',
  '7': 'h',
  '8': 'i',
  '9': 'j',
  '.': 'x',
  ':': 'z',
  '%': 'q',
  '-': 'v',
  '_': 'u',
  '/': 'w',
};

const ALPHA_TO_DIGIT: Record<string, string> = {
  'a': '0',
  'b': '1',
  'c': '2',
  'd': '3',
  'e': '4',
  'f': '5',
  'g': '6',
  'h': '7',
  'i': '8',
  'j': '9',
  'x': '.',
  'z': ':',
  'q': '%',
  'v': '-',
  'u': '_',
  'w': '/',
};

const HASH_PREFIX = 'HASH_';

/**
 * Encodes an IP address into an alphabet-based decryptable hash string.
 * Example: "192.168.1.1" -> "HASH_bjdxbgixbxb"
 * Example: "127.0.0.1"   -> "HASH_bchxaxaxb"
 */
export function encodeIp(ip: string | null | undefined): string {
  if (!ip || typeof ip !== 'string') return 'ANONYMOUS';
  const cleanIp = ip.trim();
  if (!cleanIp) return 'ANONYMOUS';

  // Preserve well-known administrative or system identifiers
  if (
    cleanIp === 'ROOT_ADMIN' ||
    cleanIp === 'ANONYMOUS' ||
    cleanIp === 'SYSTEM' ||
    cleanIp === 'AUTOMATED_CRON'
  ) {
    return cleanIp;
  }

  // If already encoded with our prefix, return as-is
  if (cleanIp.startsWith(HASH_PREFIX)) {
    return cleanIp;
  }

  // Normalize localhost notation
  const normalized = cleanIp === '::1' || cleanIp === 'localhost' ? '127.0.0.1' : cleanIp;

  let encoded = '';
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (DIGIT_TO_ALPHA[ch]) {
      encoded += DIGIT_TO_ALPHA[ch];
    } else if (ch >= 'a' && ch <= 'f') {
      encoded += ch.toUpperCase(); // IPv6 hex letters
    } else if (ch >= 'A' && ch <= 'F') {
      encoded += ch;
    } else {
      encoded += ch;
    }
  }

  return `${HASH_PREFIX}${encoded}`;
}

/**
 * Decodes an alphabet-encoded IP hash back into the real human-readable IP address.
 * Example: "HASH_bjdxbgixbxb" -> "192.168.1.1"
 * Example: "HASH_bchxaxaxb"   -> "127.0.0.1"
 */
export function decodeIp(encoded: string | null | undefined): string {
  if (!encoded || typeof encoded !== 'string') return 'ANONYMOUS';
  const clean = encoded.trim();
  if (!clean) return 'ANONYMOUS';

  // Preserve well-known administrative or system identifiers
  if (
    clean === 'ROOT_ADMIN' ||
    clean === 'ANONYMOUS' ||
    clean === 'SYSTEM' ||
    clean === 'AUTOMATED_CRON'
  ) {
    return clean;
  }

  // If already in standard IPv4 or IPv6 format, return directly
  if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(clean) || (clean.includes(':') && !clean.includes('HASH_'))) {
    return clean;
  }

  // Strip known prefixes
  let raw = clean;
  if (raw.startsWith(HASH_PREFIX)) {
    raw = raw.slice(HASH_PREFIX.length);
  } else if (raw.startsWith('NODE_') || raw.startsWith('NODE-')) {
    raw = raw.slice(5);
  } else if (raw.startsWith('hash_')) {
    raw = raw.slice(5);
  } else if (raw.startsWith('IP_') || raw.startsWith('ip_')) {
    raw = raw.slice(3);
  }

  let decoded = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ALPHA_TO_DIGIT[ch]) {
      decoded += ALPHA_TO_DIGIT[ch];
    } else if (ch >= 'A' && ch <= 'F') {
      decoded += ch.toLowerCase();
    } else {
      decoded += ch;
    }
  }

  // Verify decoded output format validity
  if (
    /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(decoded) ||
    decoded.includes(':') ||
    decoded === '127.0.0.1' ||
    decoded === '::1'
  ) {
    return decoded;
  }

  // Fallback to original string if decoding wasn't a valid IP (e.g. legacy SHA256 hashes)
  return clean;
}

/**
 * Helper to get a structured representation for UI display.
 */
export function formatIpDisplay(rawOrEncoded: string | null | undefined): {
  realIp: string;
  hash: string;
  isSpecialActor: boolean;
} {
  const input = rawOrEncoded || 'ANONYMOUS';
  const isSpecialActor = input === 'ROOT_ADMIN' || input === 'ANONYMOUS' || input === 'SYSTEM';

  if (isSpecialActor) {
    return {
      realIp: input,
      hash: input,
      isSpecialActor: true,
    };
  }

  const realIp = decodeIp(input);
  const hash = encodeIp(realIp);

  return {
    realIp,
    hash,
    isSpecialActor: false,
  };
}
