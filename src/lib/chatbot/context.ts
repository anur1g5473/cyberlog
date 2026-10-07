import { publicClient } from '@/lib/db/publicClient';
import { verifyAdminSession } from '@/lib/auth/session';
import { logSecurityEvent } from '@/lib/db/audit';

export interface ChatContext {
  sessionId: string;
  userId: string | null;
  isAdmin: boolean;
  intent: string | null;
  recentMessages: Array<{ user: string; bot: string; intent: string }>;
  conversationStart: string;
}

/**
 * Resolves chat context: verifies admin session for elevated access,
 * records the interaction, and builds scoped context for the responder.
 */
export async function resolveChatContext(
  sessionId: string,
  userInput: string,
  ipHint?: string
): Promise<ChatContext> {
  const isAdmin = await verifyAdminSession();
  const userId = isAdmin ? 'admin' : null;

  // Zero-PII intent extraction (keywords only — no content stored raw beyond what's needed)
  const lower = userInput.toLowerCase();
  let intent: string | null = null;
  if (lower.includes('security') || lower.includes('hack') || lower.includes('vulnerab')) intent = 'security';
  else if (lower.includes('blog') || lower.includes('post') || lower.includes('article')) intent = 'blog';
  else if (lower.includes('project') || lower.includes('tech') || lower.includes('stack')) intent = 'projects';
  else if (lower.includes('contact') || lower.includes('email') || lower.includes('reach')) intent = 'contact';
  else if (lower.includes('status') || lower.includes('health') || lower.includes('uptime')) intent = 'status';
  else if (lower.includes('help') || lower.includes('command') || lower.includes('menu')) intent = 'help';

  const recentMessages: Array<{ user: string; bot: string; intent: string }> = [];

  await logSecurityEvent({
    eventType: 'MUTATION',
    action: `chatbot:resolve_context intent=${intent ?? 'unknown'}`,
    status: 'SUCCESS',
    details: { sessionId, intent, isAdmin, ipHint },
    actorHash: ipHint ?? 'session-only',
  });

  return {
    sessionId,
    userId,
    isAdmin,
    intent,
    recentMessages,
    conversationStart: new Date().toISOString(),
  };
}