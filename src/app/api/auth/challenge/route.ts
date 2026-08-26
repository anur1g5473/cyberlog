import { NextResponse } from 'next/server';
import { createMathChallenge } from '@/lib/auth/challenge';

export async function GET() {
  try {
    const challenge = await createMathChallenge();
    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error generating math challenge:', error);
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
