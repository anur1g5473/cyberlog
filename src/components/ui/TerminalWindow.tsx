'use client';

import React from 'react';

interface TerminalWindowProps {
  pathLabel?: string;
  children: React.ReactNode;
  className?: string;
  actionButton?: React.ReactNode;
}

export function TerminalWindow({
  pathLabel = 'terminal ~ /home',
  children,
  className = '',
  actionButton,
}: TerminalWindowProps) {
  return (
    <div
      className={`rounded-xl border border-terminal-green/20 bg-bg-card/90 backdrop-blur-md shadow-terminal-glow overflow-hidden transition-all duration-300 hover:border-terminal-green/40 ${className}`}
    >
      {/* macOS Dot Bar & Path Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-terminal-green/10 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-terminal-red/80 inline-block shadow-[0_0_6px_rgba(255,59,59,0.5)]"></span>
          <span className="w-3 h-3 rounded-full bg-terminal-amber/80 inline-block shadow-[0_0_6px_rgba(255,183,3,0.5)]"></span>
          <span className="w-3 h-3 rounded-full bg-terminal-green/80 inline-block shadow-[0_0_6px_rgba(0,255,65,0.5)]"></span>
        </div>
        <div className="text-xs font-mono text-terminal-muted tracking-wide flex items-center gap-1.5">
          <span className="text-terminal-green/60">sys@cybersec:</span>
          <span className="text-terminal-text/90 font-medium">{pathLabel}</span>
        </div>
        <div>{actionButton || <div className="w-12"></div>}</div>
      </div>

      {/* Terminal Content Body */}
      <div className="p-5 font-mono text-terminal-text leading-relaxed">
        {children}
      </div>
    </div>
  );
}
