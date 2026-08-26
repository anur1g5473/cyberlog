'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Shield, CheckCircle2 } from 'lucide-react';

export function BootSequence() {
  const [show, setShow] = useState(false);
  const [bootStep, setBootStep] = useState(0);

  const bootLogs = [
    'INITIALIZING CYBERLOG OS v1.0...',
    'LOADING CRYPTOGRAPHIC MODULES [OK]',
    'VERIFYING SYSTEM INTEGRITY...',
    'ESTABLISHING ENCRYPTED SESSION...',
    'ACCESS GRANTED. WELCOME USER.',
  ];

  useEffect(() => {
    // Check if boot sequence has already played during this session
    const hasBooted = sessionStorage.getItem('cyberlog_booted');
    if (!hasBooted) {
      setShow(true);
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step < bootLogs.length) {
          setBootStep(step);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setShow(false);
            sessionStorage.setItem('cyberlog_booted', 'true');
          }, 600);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 font-mono text-terminal-green">
      <div className="max-w-md w-full border border-terminal-green/40 p-6 rounded-xl bg-black shadow-[0_0_50px_rgba(0,255,65,0.2)]">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-terminal-green/20">
          <Terminal className="w-5 h-5 text-terminal-green animate-pulse" />
          <span className="font-bold text-xs tracking-widest text-terminal-text">SYSTEM BOOT SEQUENCE</span>
        </div>

        <div className="space-y-2 text-xs">
          {bootLogs.slice(0, bootStep + 1).map((log, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0" />
              <span>{log}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 h-1 w-full bg-terminal-green/10 rounded overflow-hidden">
          <div
            className="h-full bg-terminal-green transition-all duration-300 shadow-[0_0_10px_#00ff41]"
            style={{ width: `${((bootStep + 1) / bootLogs.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
