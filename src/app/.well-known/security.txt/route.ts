import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const securityTxt = `# RFC 9116 Responsible Vulnerability Disclosure Policy
Contact: mailto:anuragsoni5473@gmail.com
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: en
Canonical: https://cyberlog.tech/.well-known/security.txt
Policy: https://cyberlog.tech/security
Acknowledgments: https://cyberlog.tech/about
Encryption: https://cyberlog.tech/about#pgp-key

# Defensive Principles
# - Origin Telemetry: Obfuscated cryptographic origin encoding with root admin audit ledger
# - Zero-Trust Admin: Dual-layer 5-minute inactivity termination + Argon2 / Timing-safe HMAC
# - Micro-Segmentation: 100% Supabase PostgreSQL Row-Level Security
`;

  return new NextResponse(securityTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
