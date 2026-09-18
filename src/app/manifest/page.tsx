import React from 'react';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import {
  BookOpen, FolderGit2, User, Clock, ShieldCheck,
  Terminal, Globe, Cpu, Layers, Lock,
  ArrowRight, FileCode, Zap, Radio, Shield,
} from 'lucide-react';

export const metadata = {
  title: 'Site Manifest | Cyberlog',
  description: 'Everything about Cyberlog — what it is, why it exists, and what every section contains.',
};

interface SectionDef {
  id: string; title: string; route: string;
  icon: React.ElementType; color: string;
  borderColor: string; bgColor: string;
  tagline: string; description: string; details: string[];
}

const sections: SectionDef[] = [
  {
    id: '01', title: 'LOGS // /blog', route: '/blog', icon: BookOpen,
    color: 'text-terminal-green', borderColor: 'border-terminal-green/30', bgColor: 'bg-terminal-green/5',
    tagline: 'Threat writeups, CTF solves, and security research notes.',
    description: 'The blog is the core of Cyberlog. Every post is a technical writeup — something learned, broken, reverse-engineered, or built. No filler, no reposted news.',
    details: [
      'CTF challenge walkthroughs with full methodology',
      'Web application vulnerability research and PoC writeups',
      'Network penetration testing techniques and tooling notes',
      'Cryptography breakdowns — from weak implementations to proper design',
      'Auth engineering: JWT, TOTP, session management, lockouts',
      'Defensive tooling: WAF rules, rate limiting, anomaly detection',
    ],
  },
  {
    id: '02', title: 'PROJECTS // /projects', route: '/projects', icon: FolderGit2,
    color: 'text-cyan-400', borderColor: 'border-cyan-500/30', bgColor: 'bg-cyan-500/5',
    tagline: 'Security tools, utilities, and full-stack builds.',
    description: "Projects I've actually built and shipped — not tutorial clones. Focus on security tooling, custom infra, and full-stack systems that solve real problems.",
    details: [
      'Security-first web applications with documented threat models',
      'CLI tools for recon, enumeration, and data processing',
      "Custom auth systems — this site's own auth stack is one",
      'Network scanning utilities in Python and Rust',
      'Each project lists stack, problem, and source/demo links',
    ],
  },
  {
    id: '03', title: 'ABOUT // /about', route: '/about', icon: User,
    color: 'text-purple-400', borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/5',
    tagline: 'Who I am, what I do, and how to reach me.',
    description: "A full profile — not a resume. Covers my background in cybersecurity and full-stack development, core competencies, and all live contact channels.",
    details: [
      'Offensive security: web vuln research, network pentesting, CTF',
      'Defensive engineering: ZT architecture, auth systems, WAF',
      'Stack: TypeScript, Next.js, Node.js, Python, Rust, PostgreSQL',
      'Infra: Linux sysadmin, Docker, container security, CI/CD',
      'All contact channels listed and directly linked',
    ],
  },
  {
    id: '04', title: 'NOW // /now', route: '/now', icon: Clock,
    color: 'text-terminal-amber', borderColor: 'border-terminal-amber/30', bgColor: 'bg-terminal-amber/5',
    tagline: "What I'm actively working on right now.",
    description: "A living document updated manually when my focus shifts. Follows the \"now page\" convention by Derek Sivers — the honest answer to \"what are you up to?\"",
    details: [
      'Current research areas and active investigations',
      'Projects in progress or recently shipped',
      'Technologies being explored right now',
      'Reading list, courses, or certifications in progress',
      'Updated by me — never automated, never stale by design',
    ],
  },
  {
    id: '05', title: 'SECURITY // /security', route: '/security', icon: ShieldCheck,
    color: 'text-terminal-green', borderColor: 'border-terminal-green/30', bgColor: 'bg-terminal-green/5',
    tagline: "The site's own security architecture, fully disclosed.",
    description: "A public dossier of how this site protects itself and visitors. Every defensive layer documented — transparency about security design is itself a posture.",
    details: [
      'Zero-PII telemetry: IPs encoded with reversible cipher — never stored plaintext',
      'Zero-Trust auth: passphrase + math CAPTCHA + RFC 6238 TOTP 2FA',
      'Inactivity lockout: 5-min idle timeout + client terminal lock screen',
      'Postgres RLS on every table — anon keys are read-only',
      'RFC 9116 vulnerability disclosure: /.well-known/security.txt',
      'Weekly telemetry purge via pg_cron — 7-day retention only',
    ],
  },
  {
    id: '06', title: 'CONTACT // /contact', route: '/contact', icon: Globe,
    color: 'text-sky-400', borderColor: 'border-sky-500/30', bgColor: 'bg-sky-500/5',
    tagline: 'Interactive contact matrix — reach me through any channel.',
    description: "Terminal-style message form alongside a full matrix of every channel I monitor. For researchers, recruiters, or anyone wanting to connect.",
    details: [
      'Direct message form with server-side validation and spam protection',
      'Full channel matrix: email, GitHub, LinkedIn, Discord and more',
      'All channels live and monitored — not placeholder links',
      'Best for: research collaboration, job opportunities, bug reports',
    ],
  },
];

const stackItems = [
  { label: 'Framework', value: 'Next.js 14 (App Router)', icon: Zap },
  { label: 'Language', value: 'TypeScript (strict)', icon: FileCode },
  { label: 'Database', value: 'Supabase (PostgreSQL + RLS)', icon: Layers },
  { label: 'Auth', value: 'JOSE JWT + TOTP + Lockout', icon: Lock },
  { label: 'Hosting', value: 'Vercel (Edge + Serverless)', icon: Cpu },
  { label: 'Telemetry', value: 'Zero-PII custom system', icon: Radio },
];

export default function ManifestPage() {
  return (
    <div className="space-y-8">
      <TypedCommand command="cat ./site.manifest --verbose" prefix="user@cyberlog:~$" />

      <TerminalWindow pathLabel="terminal ~ /manifest">
        <div className="space-y-6 text-sm leading-relaxed">
          <div className="space-y-3 border-b border-terminal-green/20 pb-5">
            <div className="flex items-center gap-2 font-mono text-terminal-green font-bold text-lg">
              <Terminal className="w-5 h-5" />
              <span>CYBERLOG // SITE MANIFEST</span>
            </div>
            <p className="text-terminal-text/90 font-sans">
              Cyberlog is a personal security research log and engineering portfolio — a public record
              of how I think, what I build, and what I break. This page explains every section of the
              site in full: what it contains, why it exists, and what to expect.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="p-2.5 rounded border border-terminal-green/20 bg-terminal-green/5">
                <div className="text-terminal-green font-bold mb-1">&gt; PURPOSE</div>
                <div className="text-terminal-muted">Public research log + engineering portfolio</div>
              </div>
              <div className="p-2.5 rounded border border-terminal-amber/20 bg-terminal-amber/5">
                <div className="text-terminal-amber font-bold mb-1">&gt; AUDIENCE</div>
                <div className="text-terminal-muted">Security researchers, engineers, recruiters</div>
              </div>
              <div className="p-2.5 rounded border border-cyan-500/20 bg-cyan-500/5">
                <div className="text-cyan-400 font-bold mb-1">&gt; POSTURE</div>
                <div className="text-terminal-muted">Zero-Trust, Zero-PII, fully self-audited</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-mono font-bold text-terminal-green flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>WHY I BUILT THIS</span>
            </h2>
            <div className="font-sans text-terminal-text/85 space-y-2 text-sm">
              <p>
                Most security portfolios are GitHub profile dumps or PDF resumes. Neither shows how
                someone actually thinks through a problem. I wanted something different — a live,
                searchable, growing record of real work.
              </p>
              <p>
                The blog format forces me to document methodology, not just outcomes. Writing a CTF
                writeup or vulnerability analysis demands a level of clarity that a commit history
                never does. If I can&apos;t explain it clearly in writing, I probably don&apos;t fully understand it.
              </p>
              <p>
                The site itself is also a project. The auth stack, telemetry system, admin console,
                and security architecture are all real, production-grade implementations — documented
                in the security dossier, not hidden behind abstractions.
              </p>
            </div>
          </div>
        </div>
      </TerminalWindow>

      {/* ── Section breakdown ── */}
      <div className="space-y-4">
        <div className="font-mono text-xs text-terminal-muted tracking-widest px-1">
          // SECTION BREAKDOWN — WHAT LIVES WHERE
        </div>
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <TerminalWindow key={section.id} pathLabel={`manifest ~ ${section.route}`}>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex items-center gap-2 font-bold text-sm ${section.color}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{section.id} // {section.title}</span>
                  </div>
                  <Link
                    href={section.route}
                    className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition hover:opacity-80 ${section.color} ${section.borderColor} ${section.bgColor}`}
                  >
                    <span>OPEN</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className={`text-[11px] px-2.5 py-1.5 rounded border font-bold ${section.borderColor} ${section.bgColor} ${section.color}`}>
                  &gt; {section.tagline}
                </div>
                <p className="text-terminal-text/80 text-[11px] font-sans leading-relaxed">
                  {section.description}
                </p>
                <div className="space-y-1 pl-2 border-l-2 border-terminal-green/20">
                  {section.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-terminal-muted">
                      <span className="text-terminal-green/60 shrink-0 mt-0.5">—</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TerminalWindow>
          );
        })}
      </div>

      {/* ── Tech stack ── */}
      <TerminalWindow pathLabel="manifest ~ /stack">
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-center gap-2 font-bold text-terminal-green text-sm">
            <Cpu className="w-4 h-4" />
            <span>HOW THIS SITE IS BUILT</span>
          </div>
          <p className="text-terminal-text/80 font-sans text-[11px] leading-relaxed">
            Cyberlog is a fully custom-built Next.js application — no off-the-shelf CMS, no template.
            Every component, API route, auth flow, and database schema was designed and implemented
            from scratch with security as a first-class concern.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {stackItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-2.5 rounded border border-terminal-green/20 bg-black/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-terminal-muted text-[9px] font-bold tracking-widest">
                    <Icon className="w-3 h-3 text-terminal-green" />
                    <span>{item.label}</span>
                  </div>
                  <div className="text-terminal-text text-[11px] font-bold">{item.value}</div>
                </div>
              );
            })}
          </div>
          <div className="pt-2 border-t border-terminal-green/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-terminal-muted text-[11px]">
              Built in public. Security-first. No Google Analytics. No tracking cookies.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/security" className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold text-terminal-green border border-terminal-green/30 bg-terminal-green/5 hover:bg-terminal-green/15 transition">
                <ShieldCheck className="w-3 h-3" />
                <span>Security Dossier</span>
              </Link>
              <Link href="/about" className="flex items-center gap-1 text-[11px] text-terminal-muted hover:text-terminal-text transition">
                <span>About me</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}

