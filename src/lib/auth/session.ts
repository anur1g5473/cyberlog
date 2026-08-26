import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { env } from '../config/env';

const COOKIE_NAME = 'admin_session';

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || env.JWT_SECRET;
  if (!secret) {
    console.warn('[SECURITY WARNING] JWT_SECRET is not defined in environment variables.');
  }
  return new TextEncoder().encode(secret || 'jwt_secret_must_be_configured_in_env');
}

export interface AdminSessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

async function isSecureHttps(): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') return false;
  try {
    const headerList = await headers();
    const host = headerList.get('host') || '';
    const proto = headerList.get('x-forwarded-proto') || '';
    if (host.includes('localhost') || host.includes('127.0.0.1')) return false;
    return proto === 'https' || process.env.VERCEL === '1';
  } catch {
    return false;
  }
}

/**
 * Creates an encrypted JWT session cookie for authenticated admin.
 */
export async function createAdminSession(): Promise<string> {
  const secretKey = getJwtSecretKey();
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);

  const secure = await isSecureHttps();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  });

  return token;
}

/**
 * Verifies if current request has a valid active admin session cookie.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return false;

    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload.role === 'admin';
  } catch (err) {
    return false;
  }
}

/**
 * Destroys the admin session cookie on logout.
 */
export async function clearAdminSession(): Promise<void> {
  const secure = await isSecureHttps();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

