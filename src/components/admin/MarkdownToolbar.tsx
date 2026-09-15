'use client';

import React from 'react';
import { Heading1, Heading2, Heading3, List, Code, FileCode, Bold, Link as LinkIcon, Info } from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
}

export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  return (
    <div className="space-y-1.5 pb-2">
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg border border-terminal-green/20 bg-black/60 font-mono text-xs">
        <button
          type="button"
          onClick={() => onInsert('# ', '', 'Main Heading')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/20 text-terminal-green hover:border-terminal-green hover:bg-terminal-green/10"
          title="Insert H1 (# Title)"
        >
          <Heading1 className="w-3.5 h-3.5" />
          <span># H1</span>
        </button>

        <button
          type="button"
          onClick={() => onInsert('## ', '', 'Subheading')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/20 text-terminal-text hover:border-terminal-green hover:bg-terminal-green/10"
          title="Insert H2 (## Subheading)"
        >
          <Heading2 className="w-3.5 h-3.5" />
          <span>## H2</span>
        </button>

        <button
          type="button"
          onClick={() => onInsert('### ', '', 'Section Title')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/20 text-terminal-muted hover:border-terminal-green hover:bg-terminal-green/10"
          title="Insert H3 (### Section)"
        >
          <Heading3 className="w-3.5 h-3.5" />
          <span>### H3</span>
        </button>

        <div className="w-[1px] h-4 bg-terminal-green/20 mx-1" />

        <button
          type="button"
          onClick={() => onInsert('\\ ', '', 'Bullet item')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/30 text-terminal-green font-bold hover:bg-terminal-green/20"
          title="Insert Bullet Point (\\ Item)"
        >
          <List className="w-3.5 h-3.5" />
          <span>\\ Bullet</span>
        </button>

        <button
          type="button"
          onClick={() => onInsert('**', '**', 'bold text')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/20 text-terminal-text hover:border-terminal-green hover:bg-terminal-green/10"
          title="Insert Bold Text"
        >
          <Bold className="w-3.5 h-3.5" />
          <span>Bold</span>
        </button>

        <button
          type="button"
          onClick={() => onInsert('`', '`', 'code')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/20 text-terminal-text hover:border-terminal-green hover:bg-terminal-green/10"
          title="Insert Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Inline</span>
        </button>

        <button
          type="button"
          onClick={() => onInsert('```bash\n', '\n```', '# Security commands here')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/20 text-terminal-green hover:border-terminal-green hover:bg-terminal-green/10"
          title="Insert Code Block"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Block</span>
        </button>

        <button
          type="button"
          onClick={() => onInsert('[', '](https://example.com)', 'Link text')}
          className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-terminal-green/20 text-terminal-text hover:border-terminal-green hover:bg-terminal-green/10"
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Link</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-mono text-terminal-muted px-1">
        <Info className="w-3 h-3 text-terminal-green" />
        <span>Use <code className="text-terminal-green">#</code>, <code className="text-terminal-green">##</code>, <code className="text-terminal-green">###</code> for headings, and <code className="text-terminal-green">\\</code> or <code className="text-terminal-green">\</code> at the line start for bullet points.</span>
      </div>
    </div>
  );
}
