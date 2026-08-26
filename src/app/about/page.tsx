import React from 'react';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { User, Server, Shield, Code, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <TypedCommand command="cat ./about.md" prefix="user@cyberlog:~$" />

      <TerminalWindow pathLabel="terminal ~ /about.md">
        <div className="space-y-8 font-sans text-sm leading-relaxed text-terminal-text">
          <section className="space-y-4">
            <h1 className="text-xl font-bold font-mono text-terminal-green flex items-center gap-2 border-b border-terminal-green/20 pb-2">
              <User className="w-5 h-5" />
              <span>Anurag // Profile</span>
            </h1>
            <p>
              Hey, I&apos;m Anurag. I&apos;m a Cybersecurity Engineer and Full-Stack Web Developer. 
              My expertise lies in bridging the gap between secure engineering and modern web infrastructure.
            </p>
            <p>
              I spend most of my time auditing web applications, writing defensive security tools, 
              participating in Catch-The-Flag (CTF) events, and finding vulnerabilities before bad actors do.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold font-mono text-terminal-text flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Core Competencies</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 rounded border border-terminal-green/20 bg-terminal-green/5">
                <div className="text-terminal-green font-bold mb-2">&gt; Offensive Security</div>
                <ul className="space-y-1 text-terminal-muted">
                  <li>- Web Vulnerability Research (OWASP)</li>
                  <li>- Network Penetration Testing</li>
                  <li>- CTF Forensics & Reversing</li>
                </ul>
              </div>
              <div className="p-3 rounded border border-terminal-amber/20 bg-terminal-amber/5">
                <div className="text-terminal-amber font-bold mb-2">&gt; Defensive Engineering</div>
                <ul className="space-y-1 text-terminal-muted">
                  <li>- Zero-Trust Architecture</li>
                  <li>- Auth & Cryptography Standards</li>
                  <li>- Rate-Limiting & WAF Rule Dev</li>
                </ul>
              </div>
              <div className="p-3 rounded border border-cyan-500/20 bg-cyan-500/5">
                <div className="text-cyan-400 font-bold mb-2">&gt; Development</div>
                <ul className="space-y-1 text-terminal-muted">
                  <li>- TypeScript / Node.js / Next.js</li>
                  <li>- Python / Rust CLI Tools</li>
                  <li>- PostgreSQL / SQLite</li>
                </ul>
              </div>
              <div className="p-3 rounded border border-purple-500/20 bg-purple-500/5">
                <div className="text-purple-400 font-bold mb-2">&gt; Infrastructure</div>
                <ul className="space-y-1 text-terminal-muted">
                  <li>- Linux System Admin</li>
                  <li>- Docker & Container Security</li>
                  <li>- Automated CI/CD Pipelines</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </TerminalWindow>
    </div>
  );
}

