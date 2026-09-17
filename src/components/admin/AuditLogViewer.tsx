'use client';

import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, CheckCircle, AlertTriangle, XCircle, Search, Eye, EyeOff } from 'lucide-react';
import { AuditLogEntry } from '@/lib/db/audit';
import { decodeIp } from '@/lib/security/ipCodec';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showRawHash, setShowRawHash] = useState(false);

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
    if (status === 'SUCCESS') {
      return (
        <span className="flex items-center gap-1 text-terminal-green text-[10px] font-bold">
          <CheckCircle className="w-3 h-3" /> SUCCESS
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="flex items-center gap-1 text-terminal-amber text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3" /> WARNING
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-terminal-red text-[10px] font-bold">
        <XCircle className="w-3 h-3" /> DENIED
      </span>
    );
  };

  const filteredLogs = logs.filter((log) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    const realIp = log.realIp || decodeIp(log.actorHash);
    return (
      log.eventType.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      realIp.toLowerCase().includes(q) ||
      log.actorHash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3 font-mono text-xs pt-4 border-t border-terminal-green/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-terminal-green/20 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-terminal-green" />
          <h2 className="text-sm font-bold text-terminal-green">Security Audit Trail &amp; Origin Ledger</h2>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-terminal-green/10 text-terminal-green border border-terminal-green/30">
            {logs.length} EVENTS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRawHash(!showRawHash)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-black/40 border border-terminal-green/20 text-terminal-muted hover:text-terminal-green text-[11px]"
          >
            {showRawHash ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showRawHash ? 'Hide Hash' : 'Show Hash'}</span>
          </button>
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
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-terminal-muted" />
          <input
            type="text"
            placeholder="Search by Real IP, Action, or Event..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-black/50 border border-terminal-green/20 rounded pl-8 pr-2.5 py-1 text-[11px] text-terminal-text focus:outline-none focus:border-terminal-green placeholder:text-terminal-muted/60"
          />
        </div>
        {filter && (
          <button
            type="button"
            onClick={() => setFilter('')}
            className="text-[10px] text-terminal-muted hover:text-terminal-text px-1.5 py-0.5 rounded bg-black/30 border border-terminal-green/10"
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto max-h-64 border border-terminal-green/10 rounded">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-black/80 sticky top-0 border-b border-terminal-green/10">
            <tr className="text-terminal-muted">
              <th className="py-2 px-2.5">TIMESTAMP</th>
              <th className="py-2 px-2.5">EVENT</th>
              <th className="py-2 px-2.5">ACTION</th>
              <th className="py-2 px-2.5">ORIGIN (REAL IP)</th>
              <th className="py-2 px-2.5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-terminal-muted">
                  {loading ? 'Querying ledger...' : 'No security audit entries found.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => {
                const realIp = log.realIp || decodeIp(log.actorHash);
                const isSpecial = log.actorHash === 'ROOT_ADMIN' || log.actorHash === 'ANONYMOUS' || log.actorHash === 'SYSTEM';

                return (
                  <tr key={log.id || idx} className="border-b border-terminal-green/5 hover:bg-terminal-green/5">
                    <td className="py-1.5 px-2.5 text-terminal-muted whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'}
                    </td>
                    <td className="py-1.5 px-2.5 font-bold text-terminal-text whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-black/40 border border-terminal-green/20 text-[10px]">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-terminal-muted">
                      <div>{log.action}</div>
                      {log.details && log.details.remainingSeconds !== undefined && (
                        <span className="text-[9px] text-terminal-amber font-mono">Lockout: {log.details.remainingSeconds}s &bull; </span>
                      )}
                      {log.details && log.details.failedCount !== undefined && (
                        <span className="text-[9px] text-terminal-red font-mono">Failed attempts: {log.details.failedCount}</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`font-bold ${isSpecial ? 'text-terminal-amber' : 'text-terminal-green'}`}>
                          {realIp}
                        </span>
                        {(showRawHash || log.actorHash.startsWith('HASH_')) && !isSpecial && (
                          <span className="text-[9px] text-terminal-muted/70">{log.actorHash}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 text-right whitespace-nowrap">{getStatusBadge(log.status)}</td>
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
