'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { DotTrailProgress } from '@/components/ui/DotTrailProgress';
import { BootSequence } from '@/components/ui/BootSequence';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { CustomCursor } from '@/components/ui/CustomCursor';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener('open-search', handleOpenSearch);
    return () => window.removeEventListener('open-search', handleOpenSearch);
  }, []);

  return (
    <>
      <CustomCursor />
      <BootSequence />
      <DotTrailProgress />
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </>
  );
}



