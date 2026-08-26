'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Shield, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-terminal-green/20 bg-bg/80 backdrop-blur-md font-mono text-xs text-terminal-muted py-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-terminal-green/10 border border-terminal-green/20 text-terminal-green">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-terminal-text font-bold flex items-center gap-2">
              <span>CYBERLOG</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-green/20 text-terminal-green font-mono">
                v1.0.0
              </span>
            </div>
            <p className="text-terminal-muted text-[11px] mt-0.5">
              Personal Cybersecurity Portfolio & Research Log
            </p>
          </div>
        </div>

        {/* Center: Quote */}
        <div className="text-center md:text-left text-terminal-muted/80 text-[11px] max-w-sm">
          <span className="text-terminal-green">&gt;</span> &quot;Security is a process, not a product.&quot; — Bruce Schneier
        </div>

        {/* Right: View Source & Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/anur1g5473/cyberlog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-terminal-green/30 bg-terminal-green/5 text-terminal-green hover:bg-terminal-green/15 transition shadow-sm"
          >
            <Github className="w-4 h-4" />
            <span>view source</span>
          </a>
          <Link
            href="/admin/login"
            className="text-terminal-muted hover:text-terminal-red transition flex items-center gap-1"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>sys_admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
