'use client';

import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Lock, Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AuditLogEntry } from '@/lib/db/audit';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load audit trail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-terminal-green text-[10px]">
            <CheckCircle className="w-3 h-3" /> SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-terminal-amber text-[10px]">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-terminal-red text-[10px]">
            <XCircle className="w-3 h-3" /> DENIED
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs pt-4 border-t border-terminal-green/10">
      <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-terminal-green" />
          <h2 className="text-sm font-bold text-terminal-green">Immutable Security Audit Trail</h2>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1 px-2 py-1 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green/20 text-[11px]"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-60 border border-terminal-green/10 rounded">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-black/60 sticky top-0 border-b border-terminal-green/10">
            <tr className="text-terminal-muted">
              <th className="py-2 px-2.5">TIMESTAMP</th>
              <th className="py-2 px-2.5">EVENT</th>
              <th className="py-2 px-2.5">ACTION</th>
              <th className="py-2 px-2.5">ORIGIN HASH</th>
              <th className="py-2 px-2.5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-terminal-muted">
                  {loading ? 'Querying ledger...' : 'No security audit entries recorded yet.'}
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log.id || idx} className="border-b border-terminal-green/5 hover:bg-terminal-green/5">
                  <td className="py-1.5 px-2.5 text-terminal-muted">
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'}
                  </td>
                  <td className="py-1.5 px-2.5 font-bold text-terminal-text">{log.eventType}</td>
                  <td className="py-1.5 px-2.5 text-terminal-muted">{log.action}</td>
                  <td className="py-1.5 px-2.5 font-mono text-[10px] text-terminal-green">{log.actorHash}</td>
                  <td className="py-1.5 px-2.5 text-right">{getStatusBadge(log.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
