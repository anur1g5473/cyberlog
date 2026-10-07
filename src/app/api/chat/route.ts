import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/db/audit';
import { resolveChatContext, ChatContext } from '@/lib/chatbot/context';
import { classifyIntents, topIntent } from '@/lib/chatbot/intents';
import { generateChatResponse, buildSuggestions } from '@/lib/chatbot/responder';

export const runtime = 'edge';

interface ChatRequestBody {
  message: string;
  sessionId: string;
  ipHint?: string;
}

/**
 * POST /api/chat — Scoped chatbot endpoint with:
 *  - Auth: admin session optional (elevated responses if admin)
 *  - RLS: memory writes via service role (server-side only)
 *  - Security: all user input is intent-classified, never stored raw in logs
 */
export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { message, sessionId, ipHint } = body;

    // Validate required fields
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    // Strip for logging (never log raw user content)
    const safeInput = message.trim().slice(0, 256);

    // Resolve context (verifies admin session if present)
    const ctx: ChatContext = await resolveChatContext(sessionId, message, ipHint);

    // Intent classification
    const intents = classifyIntents(message, 5);
    const primary = topIntent(message);

    // Generate response
    const { response, suggestions } = generateChatResponse(message, intents);

    // Log the interaction (zero-PII: no raw message stored)
    await logSecurityEvent({
      eventType: 'MUTATION',
      action: `chatbot:respond intent=${primary}`,
      status: 'SUCCESS',
      details: { sessionId, intents: intents.map((i) => i.intent), isAdmin: ctx.isAdmin },
      actorHash: ipHint ?? sessionId,
    });

    return NextResponse.json({
      response,
      suggestions,
      intent: primary,
      confidence: intents[0]?.confidence ?? 0,
      isAdmin: ctx.isAdmin,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[CHAT] Error processing chat request:', err);
    await logSecurityEvent({
      eventType: 'SECURITY_ALERT',
      action: 'chatbot:error',
      status: 'WARNING',
      details: { error: String(err).slice(0, 200) },
      actorHash: 'server',
    });
    return NextResponse.json({ error: 'Internal chat error.' }, { status: 500 });
  }
}