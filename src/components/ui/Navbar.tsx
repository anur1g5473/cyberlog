'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Shield, BookOpen, FolderGit2, User, Clock, Search, Lock } from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', path: '/', icon: Terminal },
    { label: 'Logs', path: '/blog', icon: BookOpen },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'About', path: '/about', icon: User },
    { label: 'Now', path: '/now', icon: Clock },
    { label: 'Contact', path: '/contact', icon: Shield },
  ];

  return (
    <header className="fixed top-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-full bg-black/70 backdrop-blur-xl border border-terminal-green/30 shadow-[0_0_25px_rgba(0,255,65,0.15)] transition-all duration-300 hover:border-terminal-green/50">
        {/* Brand / Logo Icon */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 transition"
        >
          <Shield className="w-4 h-4 text-terminal-green animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-widest hidden md:inline">CYBERLOG</span>
        </Link>
        <div className="h-4 w-px bg-terminal-green/20 mx-1"></div>
        {/* Navigation Links */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                  isActive
                    ? 'bg-terminal-green text-black font-bold shadow-[0_0_12px_rgba(0,255,65,0.6)]'
                    : 'text-terminal-text/80 hover:text-terminal-green hover:bg-terminal-green/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="h-4 w-px bg-terminal-green/20 mx-1"></div>
        {/* Search & Admin Quick Jump */}
        <div className="flex items-center gap-1">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono text-terminal-muted hover:text-terminal-green hover:bg-terminal-green/10 transition"
              title="Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green">
                ⌘K
              </kbd>
            </button>
          )}
          <Link
            href="/admin/login"
            className="p-1.5 rounded-full text-terminal-muted hover:text-terminal-red hover:bg-terminal-red/10 transition"
            title="Admin Security Portal"
          >
            <Lock className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
