import React from 'react';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { ShieldCheck, Lock, EyeOff, Cpu, Server, FileCheck, ArrowRight, Fingerprint } from 'lucide-react';

export const metadata = {
  title: 'Security & Privacy Posture | Cyberlog',
  description: 'Zero-Trust architecture and Zero-PII telemetry.',
};

export default function SecurityPosturePage() {
  const defenseLayers = [
    {
      id: '01',
      title: 'Zero-PII Salted Telemetry',
      icon: EyeOff,
      badge: 'GDPR COMPLIANT',
      description: 'Zero tracking cookies. Visits generate an irreversible SHA-256 hash using a secret server salt.',
      tech: 'SHA-256(IP + TELEMETRY_SALT + UA). Raw IP addresses are immediately discarded from memory.',
    },
    {
      id: '02',
      title: 'Zero-Trust Multi-Layer Auth',
      icon: Lock,
      badge: 'TIMING-SAFE & TOTP',
      description: 'Timing-safe passphrase check, server-validated Math CAPTCHA, and RFC 6238 TOTP 2FA.',
      tech: 'HMAC-SHA1 RFC 6238 TOTP with +/- 30s drift tolerance and constant-time comparison.',
    },
    {
      id: '03',
      title: 'Dual-Layer Inactivity Lockout',
      icon: Cpu,
      badge: '5-MIN TIMEOUT',
      description: 'Sessions terminate after 5 minutes of idle time. Client terminal lock screen intercepts input.',
      tech: 'Client event listeners monitor user interaction while JOSE JWT sessions verify lastActive timestamp.',
    },
    {
      id: '04',
      title: 'Micro-Segmented Row-Level Security',
      icon: Server,
      badge: '100% POSTGRES RLS',
      description: 'Every table is locked behind Supabase Row Level Security. Anon keys have read-only access where appropriate.',
      tech: 'PostgreSQL policies enforce service_role authorization on mutations. Direct client writes are rejected.',
    },
    {
      id: '05',
      title: 'RFC 9116 Vulnerability Disclosure',
      icon: FileCheck,
      badge: 'RESPONSIBLE DISCLOSURE',
      description: 'Standardized vulnerability disclosure documentation published via machine-readable RFC 9116.',
      tech: 'Available at /.well-known/security.txt with canonical URI and disclosure policy.',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      <TypedCommand command="cat /etc/security/posture.dossier --detailed" prefix="$ " />

      <TerminalWindow pathLabel="defense-intel ~ /posture">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-terminal-green/20 pb-3">
            <div>
              <div className="flex items-center gap-2 text-terminal-green font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>CYBERLOG SECURITY & PRIVACY DOSSIER</span>
              </div>
              <p className="text-terminal-muted text-[11px] mt-0.5">
                Zero-Trust Defensive Architecture &bull; Zero-PII Telemetry &bull; RFC 9116
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green font-bold">
              POSTURE: HARDENED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {defenseLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div key={layer.id} className="p-3 rounded border border-terminal-green/20 bg-terminal-surface space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 text-terminal-green font-bold">
                      <Icon className="w-4 h-4" />
                      <span>{layer.id} // {layer.title}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-terminal-green/10 text-terminal-green">
                      {layer.badge}
                    </span>
                  </div>
                  <p className="text-terminal-text/80 text-[11px]">{layer.description}</p>
                  <div className="text-[10px] text-terminal-muted p-1.5 rounded bg-black/50 border border-terminal-green/10">
                    <span className="text-terminal-green font-bold">TECH: </span>
                    {layer.tech}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-terminal-green/20 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-terminal-muted text-[11px]">
              RFC 9116: <code className="text-terminal-green">/.well-known/security.txt</code>
            </span>
            <div className="flex items-center gap-2">
              <a
                href="/.well-known/security.txt"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green font-bold hover:bg-terminal-green/20"
              >
                View security.txt
              </a>
              <Link href="/contact" className="flex items-center gap-1 text-terminal-muted hover:text-terminal-text">
                <span>Contact</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
