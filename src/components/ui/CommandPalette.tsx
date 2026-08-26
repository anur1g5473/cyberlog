'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Terminal, BookOpen, FolderGit2, User, Clock, Shield, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  const pages = [
    { label: 'Home Page', path: '/', category: 'Page', icon: Terminal },
    { label: 'Blog / Security Logs', path: '/blog', category: 'Page', icon: BookOpen },
    { label: 'Featured Projects', path: '/projects', category: 'Page', icon: FolderGit2 },
    { label: 'About & Bio', path: '/about', category: 'Page', icon: User },
    { label: 'Currently Learning (Now)', path: '/now', category: 'Page', icon: Clock },
    { label: 'Contact Information', path: '/contact', category: 'Page', icon: Shield },
    { label: 'Admin Login', path: '/admin/login', category: 'Admin', icon: Shield },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-search'));
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = pages.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl rounded-xl border border-terminal-green/40 bg-bg-card shadow-[0_0_50px_rgba(0,255,65,0.2)] overflow-hidden font-mono text-xs">
        {/* Header Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-terminal-green/20 bg-black/80">
          <Search className="w-4 h-4 text-terminal-green" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or page name..."
            className="w-full bg-transparent text-terminal-text focus:outline-none placeholder-terminal-muted"
            autoFocus
          />
          <button onClick={onClose} className="text-terminal-muted hover:text-terminal-red">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-terminal-muted">No matching commands found.</div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigateTo(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-terminal-green/10 hover:text-terminal-green transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-terminal-muted group-hover:text-terminal-green" />
                    <span className="text-terminal-text group-hover:text-terminal-green font-semibold">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-terminal-muted">
                    <span>{item.path}</span>
                    <ArrowRight className="w-3 h-3 text-terminal-green opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-black/60 border-t border-terminal-green/10 text-[10px] text-terminal-muted flex justify-between">
          <span>Navigate with mouse or enter</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
