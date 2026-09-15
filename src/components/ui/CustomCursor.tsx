'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    document.documentElement.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest('a') ||
          target.closest('button') ||
          target.closest('input[type="submit"]') ||
          target.closest('input[type="button"]') ||
          target.closest('input[type="checkbox"]') ||
          target.closest('input[type="radio"]') ||
          target.closest('select') ||
          target.closest('summary') ||
          target.closest('[role="button"]') ||
          target.closest('[role="tab"]') ||
          target.closest('[role="link"]') ||
          target.closest('.cursor-pointer') ||
          window.getComputedStyle(target).cursor === 'pointer'
        );

        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 select-none will-change-transform"
      style={{ willChange: 'transform' }}
    >
      {/* Primary Glowing Hacker Cursor Dot */}
      <div
        className={`rounded-full transition-[background-color,box-shadow,transform] duration-150 ease-out pointer-events-none ${
          isHoveringClickable
            ? 'w-5 h-5 bg-terminal-red shadow-[0_0_14px_#ff3b3b,0_0_28px_rgba(255,59,59,0.7)] scale-125'
            : 'w-4 h-4 bg-terminal-green shadow-[0_0_12px_#00ff41,0_0_24px_rgba(0,255,65,0.7)] scale-100'
        } ${isClicking ? 'scale-90' : ''}`}
      />
    </div>
  );
}

