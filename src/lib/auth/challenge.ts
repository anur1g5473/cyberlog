import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env';

export interface MathChallenge {
  num1: number;
  num2: number;
  operator: '+' | '-';
  token: string;
}

const SUCCESS_MESSAGES = [
  'Confirmed: human. Or a very good calculator. Welcome in.',
  'Math checks out. Bots hate this one trick.',
  'Access granted. You are, in fact, carbon-based.',
  'Verified. No bots were harmed in this login.',
  'CAPTCHA bypassed! (Because you actually solved it).',
  'Turing test passed. Welcome, fellow entity.',
];

/**
 * Creates a server-validated math challenge with a signed JWT token containing expected answer.
 * Token expires in 5 minutes to prevent replay attacks.
 */
export async function createMathChallenge(): Promise<MathChallenge> {
  const num1 = Math.floor(Math.random() * 50) + 10;
  const num2 = Math.floor(Math.random() * 40) + 1;
  const isAddition = Math.random() > 0.3;
  
  const operator: '+' | '-' = isAddition ? '+' : '-';
  const expectedResult = isAddition ? num1 + num2 : num1 - num2;

  const secret = new TextEncoder().encode(env.JWT_SECRET);
  
  const token = await new SignJWT({ expectedResult })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret);

  return {
    num1,
    num2,
    operator,
    token,
  };
}

/**
 * Validates submitted challenge answer against the signed JWT token.
 */
export async function verifyMathChallenge(
  token: string,
  userAnswer: number | string
): Promise<{ success: boolean; message: string }> {
  if (!token || userAnswer === undefined || userAnswer === '') {
    return { success: false, message: 'Math challenge response is required.' };
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    const expectedResult = payload.expectedResult as number;
    const parsedUserAnswer = Number(userAnswer);

    if (isNaN(parsedUserAnswer)) {
      return { success: false, message: 'Invalid mathematical answer format.' };
    }

    if (parsedUserAnswer !== expectedResult) {
      return { success: false, message: 'Math challenge failed. Try again.' };
    }

    const randomSuccess = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
    return { success: true, message: randomSuccess };
  } catch (err) {
    return { success: false, message: 'Math challenge session expired or invalid. Please refresh.' };
  }
}
