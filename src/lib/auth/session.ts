import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-cybersecurity-admin-jwt-key-2026-secure-random'
);

export interface AdminSessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Creates an encrypted JWT session cookie for authenticated admin.
 */
export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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

    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload.role === 'admin';
  } catch (err) {
    return false;
  }
}

/**
 * Destroys the admin session cookie on logout.
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
