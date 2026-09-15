'use client';

import React, { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 5;

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const trailRef = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }))
  );
  const animFrameId = useRef<number | null>(null);

  const cursorRef = useRef<HTMLDivElement>(null);
  const trailDotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    document.documentElement.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };

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

    const animate = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      let prevX = targetX;
      let prevY = targetY;

      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const node = trailRef.current[i];
        const lerpFactor = 0.45 - i * 0.05;
        node.x += (prevX - node.x) * Math.max(lerpFactor, 0.2);
        node.y += (prevY - node.y) * Math.max(lerpFactor, 0.2);

        const el = trailDotsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0)`;
        }

        prevX = node.x;
        prevY = node.y;
      }

      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isRed = isClicking || isHoveringClickable;

  return (
    <>
      {/* 1. Small Trailing Nodes */}
      <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden select-none">
        {Array.from({ length: TRAIL_LENGTH }).map((_, idx) => {
          const size = Math.max(3.5 - idx * 0.5, 1.5);
          const opacity = Math.max(0.45 - idx * 0.08, 0.06);

          return (
            <div
              key={idx}
              ref={(el) => {
                trailDotsRef.current[idx] = el;
              }}
              className={`fixed top-0 left-0 rounded-full transition-colors duration-150 pointer-events-none ${
                isRed
                  ? 'bg-terminal-red shadow-[0_0_5px_#ff3b3b]'
                  : 'bg-terminal-green shadow-[0_0_5px_#00ff41]'
              }`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                marginLeft: `-${size / 2}px`,
                marginTop: `-${size / 2}px`,
                opacity: opacity,
                willChange: 'transform',
              }}
            />
          );
        })}
      </div>

      {/* 2. Main Green Dot with Edge Glow */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 select-none will-change-transform"
      >
        <div
          className={`relative flex items-center justify-center rounded-full transition-transform duration-150 ease-out ${
            isClicking ? 'scale-75' : isHoveringClickable ? 'scale-125' : 'scale-100'
          }`}
        >
          {/* Outer Edge Glow */}
          <div
            className={`absolute inset-[-4px] rounded-full blur-[5px] transition-colors duration-200 ${
              isRed ? 'bg-terminal-red/50 animate-pulse' : 'bg-terminal-green/35 animate-pulse'
            }`}
          />

          {/* Core Dot with Edge Glow */}
          <div
            className={`w-2.5 h-2.5 rounded-full transition-[background-color,box-shadow,border-color] duration-200 ${
              isRed
                ? 'bg-terminal-red border border-terminal-red shadow-[0_0_10px_#ff3b3b,0_0_20px_rgba(255,59,59,0.85)]'
                : 'bg-terminal-green border border-terminal-green/80 shadow-[0_0_8px_#00ff41,0_0_16px_rgba(0,255,65,0.75)]'
            }`}
          />
        </div>
      </div>
    </>
  );
}
