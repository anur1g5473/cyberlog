'use client';

import React, { useEffect, useState } from 'react';

export function DotTrailProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-black/40 z-50 overflow-hidden pointer-events-none">
      {/* Scroll Progress Glow Bar */}
      <div
        className="h-full bg-gradient-to-r from-terminal-green/40 via-terminal-green to-terminal-amber transition-all duration-150 shadow-[0_0_12px_rgba(0,255,65,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Floating dot connector */}
      <div
        className="absolute top-0 transform -translate-x-1/2 w-2 h-2 rounded-full bg-terminal-green shadow-[0_0_10px_#00ff41]"
        style={{ left: `${scrollProgress}%` }}
      ></div>
    </div>
  );
}
