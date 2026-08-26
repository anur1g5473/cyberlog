'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group my-4 rounded-xl border border-terminal-green/20 bg-black/90 overflow-hidden font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-card border-b border-terminal-green/10 text-terminal-muted">
        <span className="text-[11px] font-semibold text-terminal-green/80 uppercase">
          {language}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green transition"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-terminal-green" />
              <span className="text-[10px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-terminal-text leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
