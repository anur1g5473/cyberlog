'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { DotTrailProgress } from '@/components/ui/DotTrailProgress';
import { BootSequence } from '@/components/ui/BootSequence';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { SlidingDrawer } from '@/components/ui/SlidingDrawer';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleOpenDrawer = () => setIsDrawerOpen(true);

    window.addEventListener('open-hud-drawer', handleOpenDrawer);

    return () => {
      window.removeEventListener('open-hud-drawer', handleOpenDrawer);
    };
  }, []);

  // Send Zero-PII visit telemetry on route changes
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return (
    <>
      <CustomCursor />
      <BootSequence />
      <DotTrailProgress />
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />
      <SlidingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </>
  );
}





