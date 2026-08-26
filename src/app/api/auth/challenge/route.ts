import { NextResponse } from 'next/server';
import { createMathChallenge } from '@/lib/auth/challenge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const challenge = await createMathChallenge();
    return NextResponse.json(challenge, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating math challenge:', error);
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
