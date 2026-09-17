'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, Unlock, LogOut } from 'lucide-react';
import { TerminalWindow } from '../ui/TerminalWindow';

export function InactivityLockout({ children, timeoutMs = 300000 }: { children: React.ReactNode; timeoutMs?: number }) {
  const [isLocked, setIsLocked] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastActive = useRef<number>(Date.now());
  const router = useRouter();

  const reset = useCallback(() => {
    if (!isLocked) lastActive.current = Date.now();
  }, [isLocked]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    const timer = setInterval(() => {
      if (!isLocked && Date.now() - lastActive.current >= timeoutMs) {
        setIsLocked(true);
      }
    }, 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearInterval(timer);
    };
  }, [isLocked, reset, timeoutMs]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setIsLocked(false);
        setPassphrase('');
        lastActive.current = Date.now();
      } else {
        setError(data.message || 'Passphrase rejected');
      }
    } catch {
      setError('Verification failure');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      {children}
      {isLocked && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 font-mono text-xs">
          <div className="w-full max-w-sm">
            <TerminalWindow pathLabel="security ~ /inactivity-lock">
              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="flex items-center gap-2 text-terminal-amber border-b border-terminal-amber/20 pb-2">
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                  <span className="font-bold">SESSION INACTIVITY LOCKOUT (5m)</span>
                </div>
                <p className="text-[11px] text-terminal-muted">
                  Session paused to prevent unauthorized physical terminal hijacking.
                </p>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-terminal-muted absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter Master Passphrase..."
                    autoFocus
                    className="w-full pl-8 pr-3 py-2 bg-black border border-terminal-green/30 rounded text-terminal-text focus:outline-none focus:border-terminal-green"
                    required
                  />
                </div>
                {error && <div className="text-terminal-red text-[11px] bg-terminal-red/10 p-2 rounded">{error}</div>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded bg-terminal-green text-black font-bold flex items-center justify-center gap-1 hover:bg-terminal-green/90"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{loading ? 'Verifying...' : 'Resume'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2 rounded bg-terminal-red/10 border border-terminal-red/30 text-terminal-red font-bold flex items-center gap-1 hover:bg-terminal-red/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                </div>
              </form>
            </TerminalWindow>
          </div>
        </div>
      )}
    </>
  );
}
