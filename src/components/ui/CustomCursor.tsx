'use client';

import React, { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 7;

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const trailRef = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }))
  );
  const animFrameId = useRef<number | null>(null);

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const trailDotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    document.documentElement.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };

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

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      let prevX = targetX;
      let prevY = targetY;

      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const node = trailRef.current[i];
        const lerpFactor = 0.5 - i * 0.04;
        node.x += (prevX - node.x) * Math.max(lerpFactor, 0.22);
        node.y += (prevY - node.y) * Math.max(lerpFactor, 0.22);

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

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
      {/* 1. Trailing Phosphor Nodes */}
      {Array.from({ length: TRAIL_LENGTH }).map((_, idx) => {
        const size = Math.max(6 - idx * 0.7, 2);
        const opacity = Math.max(0.6 - idx * 0.08, 0.06);

        return (
          <div
            key={idx}
            ref={(el) => {
              trailDotsRef.current[idx] = el;
            }}
            className={`fixed top-0 left-0 rounded-full transition-colors duration-150 pointer-events-none ${
              isHoveringClickable
                ? 'bg-terminal-red shadow-[0_0_8px_#ff3b3b]'
                : 'bg-terminal-green shadow-[0_0_8px_#00ff41]'
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

      {/* 2. Main Glowing Center Dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none transition-all duration-150 ${
          isHoveringClickable
            ? 'w-3 h-3 -ml-1.5 -mt-1.5 bg-terminal-red shadow-[0_0_12px_#ff3b3b,0_0_24px_#ff3b3b]'
            : 'w-2.5 h-2.5 -ml-[5px] -mt-[5px] bg-terminal-green shadow-[0_0_10px_#00ff41,0_0_20px_#00ff41]'
        } ${isClicking ? 'scale-125' : ''}`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}


