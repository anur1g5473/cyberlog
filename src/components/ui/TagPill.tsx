'use client';

import React from 'react';
import { TagItem, getDefaultColorForTag } from '@/lib/utils/tagUtils';

interface TagPillProps {
  tag: string | TagItem;
  color?: string;
  onClick?: (tag: string) => void;
  active?: boolean;
}

export function TagPill({ tag, color: propColor, onClick, active = false }: TagPillProps) {
  const tagName = typeof tag === 'string' ? tag.trim().replace(/^#+/, '') : tag.name.trim().replace(/^#+/, '');
  const displayColor =
    propColor ||
    (typeof tag === 'object' && tag.color ? tag.color : getDefaultColorForTag(tagName));

  if (active) {
    const activeStyle: React.CSSProperties = {
      backgroundColor: '#00ff41',
      color: '#000000',
      borderColor: '#00ff41',
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.6)',
    };

    if (onClick) {
      return (
        <button
          type="button"
          onClick={() => onClick(tagName)}
          style={activeStyle}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition-all duration-200 cursor-pointer hover:scale-105"
        >
          #{tagName}
        </button>
      );
    }

    return (
      <span
        style={activeStyle}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition-all duration-200"
      >
        #{tagName}
      </span>
    );
  }

  const customStyle: React.CSSProperties = {
    borderColor: `${displayColor}66`,
    color: displayColor,
    backgroundColor: `${displayColor}18`,
    boxShadow: `0 0 8px ${displayColor}18`,
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(tagName)}
        style={customStyle}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border transition-all duration-200 cursor-pointer hover:scale-105 hover:brightness-125 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]"
      >
        #{tagName}
      </button>
    );
  }

  return (
    <span
      style={customStyle}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border transition-all duration-200 hover:brightness-125"
    >
      #{tagName}
    </span>
  );
}


