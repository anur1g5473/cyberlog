'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { DotTrailProgress } from '@/components/ui/DotTrailProgress';
import { BootSequence } from '@/components/ui/BootSequence';
import { CommandPalette } from '@/components/ui/CommandPalette';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-search', handleOpenSearch);
    return () => window.removeEventListener('open-search', handleOpenSearch);
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <title>CyberLog ❯ Security Research &amp; Portfolio</title>
        <meta name="description" content="Personal portfolio and research log documenting web security, network pentesting, auth engineering, and tools." />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between antialiased selection:bg-terminal-green/30 selection:text-terminal-green">
        <BootSequence />
        <DotTrailProgress />
        <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
        <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
