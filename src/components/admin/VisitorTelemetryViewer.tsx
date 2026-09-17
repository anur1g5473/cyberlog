'use client';

import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Eye } from 'lucide-react';
import { VisitorLog } from '@/lib/db/telemetry';

function fmtTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function VisitorTelemetryViewer() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/telemetry');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setLogs(data.data?.visitors || []);
      }
    } catch (err) {
      console.error('Failed to load visitor telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-3 font-mono text-xs pt-4 border-t border-terminal-green/10">
      <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-terminal-green" />
          <h2 className="text-sm font-bold text-terminal-green">Visitor Origin Ledger</h2>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-terminal-green/10 text-terminal-green border border-terminal-green/30">
            {logs.length} SESSIONS
          </span>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green/20 text-[11px]"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-64 border border-terminal-green/20 rounded">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-black/80 sticky top-0 border-b border-terminal-green/20">
            <tr className="text-terminal-muted">
              <th className="py-2 px-2.5">REAL IP</th>
              <th className="py-2 px-2.5">DATE</th>
              <th className="py-2 px-2.5">ENTRY PATH</th>
              <th className="py-2 px-2.5">FIRST SEEN</th>
              <th className="py-2 px-2.5">LAST SEEN</th>
              <th className="py-2 px-2.5 text-right">HITS</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-terminal-muted">
                  {loading ? 'Loading visitor ledger...' : 'No visitor sessions recorded yet.'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id || `${log.visitorHash}-${log.hourBucket}`}
                  className="border-b border-terminal-green/10 hover:bg-terminal-green/5"
                >
                  <td className="py-1.5 px-2.5 font-bold text-terminal-green whitespace-nowrap">
                    {log.realIp}
                  </td>
                  <td className="py-1.5 px-2.5 text-terminal-muted whitespace-nowrap">
                    {fmtDate(log.hourBucket)}
                  </td>
                  <td className="py-1.5 px-2.5 text-terminal-text whitespace-nowrap max-w-[140px] truncate" title={log.path}>
                    {log.path}
                  </td>
                  <td className="py-1.5 px-2.5 text-terminal-text whitespace-nowrap tabular-nums">
                    {fmtTime(log.firstVisit)}
                  </td>
                  <td className="py-1.5 px-2.5 whitespace-nowrap tabular-nums">
                    <span className={log.lastVisit !== log.firstVisit ? 'text-terminal-amber font-bold' : 'text-terminal-text'}>
                      {fmtTime(log.lastVisit)}
                    </span>
                  </td>
                  <td className="py-1.5 px-2.5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-terminal-muted">
                      <Eye className="w-2.5 h-2.5" />
                      {log.hitCount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-terminal-muted">
        One row per origin IP per hour. Auto-cleanup every Sunday 00:00 UTC (7-day retention).
      </p>
    </div>
  );
}
