'use client';

import React, { useState } from 'react';
import { TagItem, CYBER_COLOR_PRESETS, DEFAULT_SUGGESTED_TAGS, getDefaultColorForTag } from '@/lib/utils/tagUtils';
import { TagPill } from '@/components/ui/TagPill';
import { Plus, X, Palette, Hash } from 'lucide-react';

interface TagManagerProps {
  tags: TagItem[];
  onChange: (tags: TagItem[]) => void;
}

export function TagManager({ tags, onChange }: TagManagerProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#00ff41');

  const addTag = (tagName?: string, tagColor?: string) => {
    const raw = (tagName || name).trim().replace(/^#+/, '');
    if (!raw) return;
    if (tags.some((t) => t.name.toLowerCase() === raw.toLowerCase())) {
      setName('');
      return;
    }
    const c = tagColor || color || getDefaultColorForTag(raw);
    onChange([...tags, { name: raw, color: c }]);
    setName('');
  };

  const removeTag = (i: number) => onChange(tags.filter((_, idx) => idx !== i));
  const updateColor = (i: number, c: string) => onChange(tags.map((t, idx) => idx === i ? { ...t, color: c } : t));

  return (
    <div className="space-y-3 p-3.5 rounded-xl border border-terminal-green/20 bg-black/50 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
        <div className="flex items-center gap-2 text-terminal-green font-bold">
          <Hash className="w-4 h-4" />
          <span>HASHTAGS & OUTLINE COLOR PICKER</span>
        </div>
        <span className="text-terminal-muted text-[11px]">{tags.length} tags</span>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {tags.length === 0 ? (
          <div className="text-terminal-muted text-[11px]">No hashtags added yet.</div>
        ) : (
          tags.map((tag, i) => (
            <div key={`${tag.name}-${i}`} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-black/80" style={{ borderColor: `${tag.color}77` }}>
              <TagPill tag={tag} />
              <input type="color" value={tag.color} onChange={(e) => updateColor(i, e.target.value)} className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent" title="Change outline color" />
              <button type="button" onClick={() => removeTag(i)} className="text-terminal-muted hover:text-terminal-red"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-terminal-green/10 space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-terminal-muted">#</span>
            <input type="text" placeholder="Hashtag (e.g. ZeroDay)" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="w-full pl-6 pr-2.5 py-1.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-terminal-green/30 bg-black">
            <Palette className="w-3.5 h-3.5 text-terminal-muted" />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" />
            <span className="text-[10px]" style={{ color }}>{color}</span>
          </div>
          <button type="button" onClick={() => addTag()} className="px-3 py-1.5 rounded bg-terminal-green/10 border border-terminal-green text-terminal-green font-bold flex items-center justify-center gap-1 hover:bg-terminal-green hover:text-black"><Plus className="w-3 h-3" /><span>Add Tag</span></button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-terminal-muted mr-1">Presets:</span>
          {CYBER_COLOR_PRESETS.map((p) => (
            <button key={p.color} type="button" onClick={() => setColor(p.color)} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-white/10" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-terminal-green/5">
          <span className="text-[10px] text-terminal-muted mr-1">Quick Add:</span>
          {DEFAULT_SUGGESTED_TAGS.map((s) => (
            <button key={s.name} type="button" onClick={() => addTag(s.name, s.color)} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border border-terminal-green/20 text-terminal-muted hover:text-terminal-text">
              <Plus className="w-2.5 h-2.5 text-terminal-green" />
              <span>#{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
