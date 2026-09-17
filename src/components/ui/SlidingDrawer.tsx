'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ShieldCheck, Terminal, FileCode, Layers, Radio, ExternalLink, Cpu, Globe, Compass } from 'lucide-react';

export function SlidingDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [telemetry, setTelemetry] = useState<{ uniqueNodes: number; totalHits: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/telemetry')
      .then((r) => r.json())
      .then((d) => d.success && setTelemetry(d.data))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const links = [
    { label: '01 // ROOT', href: '/', icon: Terminal },
    { label: '02 // WRITEUPS', href: '/posts', icon: FileCode },
    { label: '03 // PROJECTS', href: '/projects', icon: Layers },
    { label: '04 // PROFILE', href: '/about', icon: Cpu },
    { label: '05 // DIRECTIVES', href: '/now', icon: Radio },
    { label: '06 // COMMS', href: '/contact', icon: Globe },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-mono text-xs">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-terminal-surface border-l border-terminal-green/30 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
            <div className="flex items-center gap-1.5 text-terminal-green font-bold">
              <Compass className="w-4 h-4 animate-spin" />
              <span>TACTICAL HUD</span>
            </div>
            <button onClick={onClose} className="p-1 text-terminal-muted hover:text-terminal-green">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 rounded bg-black/60 border border-terminal-green/20 space-y-1.5">
            <div className="flex justify-between text-terminal-green text-[10px] font-bold">
              <span>ZERO-PII TELEMETRY</span>
              <span className="text-terminal-muted">LIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-1 rounded bg-terminal-green/5 border border-terminal-green/10">
                <div className="text-[9px] text-terminal-muted">NODES</div>
                <div className="font-bold text-terminal-green">{telemetry?.uniqueNodes ?? '...'}</div>
              </div>
              <div className="p-1 rounded bg-terminal-green/5 border border-terminal-green/10">
                <div className="text-[9px] text-terminal-muted">HITS</div>
                <div className="font-bold text-terminal-amber">{telemetry?.totalHits ?? '...'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[9px] text-terminal-muted font-bold tracking-wider mb-1">NAVIGATION</div>
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded transition border ${
                    isActive
                      ? 'bg-terminal-green/15 text-terminal-green border-terminal-green/40 font-bold'
                      : 'text-terminal-text border-transparent hover:border-terminal-green/20 hover:bg-terminal-green/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="text-[9px] text-terminal-green font-bold">ACTIVE</span>}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-terminal-green/10">
            <div className="text-[9px] text-terminal-muted font-bold tracking-wider mb-1">SECURITY</div>
            <Link
              href="/security"
              onClick={onClose}
              className="flex items-center justify-between px-2.5 py-1.5 rounded border border-terminal-green/20 bg-terminal-green/5 text-terminal-green hover:bg-terminal-green/15"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security Dossier</span>
              </div>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </div>
        </div>

        <div className="pt-3 border-t border-terminal-green/10 text-[9px] text-terminal-muted flex justify-between">
          <span>POSTURE: <span className="text-terminal-green font-bold">ZERO-TRUST</span></span>
          <span>KEY: <kbd className="px-1 bg-black border border-terminal-green/20">M</kbd></span>
        </div>
      </div>
    </div>
  );
}
