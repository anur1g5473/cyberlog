import { classifyIntents, IntentMatch } from './intents';

interface ResponsePlan {
  intent: string;
  response: string;
  suggestions: string[];
}

const SECURITY_RESPONSES: ResponsePlan[] = [
  {
    intent: 'security',
    response: 'CyberLog runs 10+ defense layers: bcrypt passwords, IP lockouts, HMAC anti-bot, TOTP 2FA, Postgres RLS, audit logs, service role isolation, cache invalidation, enumeration resistance, and session timeouts.',
    suggestions: ['How does bcrypt work here?', 'Tell me about lockouts.', 'What about 2FA?'],
  },
  {
    intent: 'security',
    response: 'Passwords are hashed with bcrypt (cost 12) on registration. I never store or return plaintext. Login does a server-side math challenge before any credential check.',
    suggestions: ['How does the math challenge work?', 'What about session timeout?'],
  },
  {
    intent: 'security',
    response: 'IP-level lockouts are enforced in the login route: after 6 failed attempts the identifier gets a 15-minute lockout logged to the audit table.',
    suggestions: ['Where can I see audit logs?', 'What happens during a lockout?'],
  },
];

const BLOG_RESPONSES: ResponsePlan[] = [
  {
    intent: 'blog',
    response: 'Posts are written in markdown, then run through preprocessBlogMarkdown (lib/utils/markdownUtils.ts) before rendering with ReactMarkdown. Headings become `##`/`###`, lists become bullets, emphasis is preserved.',
    suggestions: ['Can I use inline HTML?', 'What about math formulas?'],
  },
  {
    intent: 'blog',
    response: 'Each post has a unique slug URL like /blog/your-post-title. Slugs are lowercase and hyphenated with a UNIQUE constraint. Browse them at /posts.',
    suggestions: ['How do I set the slug?', 'Can I change a slug?'],
  },
];