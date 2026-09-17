'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Unlock, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { LoginAttemptRecord } from '@/lib/auth/lockout';

export function LoginAttemptsViewer() {
  const [attempts, setAttempts] = useState<LoginAttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lockouts');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAttempts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load login attempts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleReset = async (identifier: string) => {
    setActionId(identifier);
    try {
      const res = await fetch('/api/admin/lockouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAttempts(data.data || []);
      }
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs pt-4 border-t border-terminal-green/10">
      <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-terminal-amber" />
          <h2 className="text-sm font-bold text-terminal-amber">Login Attempts &amp; Lockout Origins</h2>
        </div>
        <button
          type="button"
          onClick={fetchAttempts}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 rounded bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber hover:bg-terminal-amber/20 text-[11px]"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-56 border border-terminal-amber/20 rounded">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-black/80 sticky top-0 border-b border-terminal-amber/20">
            <tr className="text-terminal-muted">
              <th className="py-2 px-2.5">ORIGIN REAL IP</th>
              <th className="py-2 px-2.5">HASH TOKEN</th>
              <th className="py-2 px-2.5">FAILED TRIES</th>
              <th className="py-2 px-2.5">STATUS</th>
              <th className="py-2 px-2.5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-terminal-muted">
                  {loading ? 'Checking origins...' : 'No failed login attempts recorded.'}
                </td>
              </tr>
            ) : (
              attempts.map((item) => {
                const isLocked = item.isLocked || item.remainingSeconds > 0;
                return (
                  <tr key={item.identifier} className="border-b border-terminal-amber/10 hover:bg-terminal-amber/5">
                    <td className="py-1.5 px-2.5 font-bold text-terminal-green whitespace-nowrap">
                      {item.decodedIp}
                    </td>
                    <td className="py-1.5 px-2.5 text-[10px] text-terminal-muted whitespace-nowrap">
                      {item.identifier}
                    </td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap font-bold">
                      {item.failedCount} failed
                    </td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-terminal-red font-bold text-[10px]">
                          <AlertOctagon className="w-3 h-3" /> LOCKED ({item.remainingSeconds}s)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-terminal-muted text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-terminal-green" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleReset(item.identifier)}
                        disabled={actionId === item.identifier}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green/20 text-[10px]"
                      >
                        <Unlock className="w-2.5 h-2.5" />
                        <span>{actionId === item.identifier ? 'Clearing...' : 'Clear Lock'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
