'use client';

import React from 'react';

interface TagPillProps {
  tag: string;
  onClick?: (tag: string) => void;
  active?: boolean;
}

export function TagPill({ tag, onClick, active = false }: TagPillProps) {
  const getTagColorClass = (t: string) => {
    const lower = t.toLowerCase();
    if (lower.includes('web')) return 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10';
    if (lower.includes('network')) return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
    if (lower.includes('ctf')) return 'border-purple-500/30 text-purple-400 bg-purple-500/10';
    if (lower.includes('tools')) return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
    if (lower.includes('auth') || lower.includes('security')) return 'border-terminal-green/30 text-terminal-green bg-terminal-green/10';
    return 'border-terminal-muted/30 text-terminal-muted bg-terminal-muted/10';
  };

  const baseStyle = getTagColorClass(tag);

  return (
    <span
      onClick={() => onClick && onClick(tag)}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${
        active
          ? 'bg-terminal-green text-black border-terminal-green font-bold shadow-[0_0_8px_rgba(0,255,65,0.5)]'
          : baseStyle
      }`}
    >
      #{tag.trim()}
    </span>
  );
}
