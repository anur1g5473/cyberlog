'use client';

import React, { useState } from 'react';
import { KeyRound, X, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

export function TotpSetupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{
    isConfigured: boolean;
    secretPreview?: string;
    generatedSecret?: string;
    otpauthUri?: string;
    qrUrl?: string;
    currentTestCode?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const openModal = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/totp-setup');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 text-xs font-bold transition"
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span>2FA Setup</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs">
          <div className="max-w-md w-full bg-terminal-surface border border-terminal-green/40 rounded-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-terminal-green/20 pb-3">
              <div className="flex items-center gap-2 text-terminal-green font-bold">
                <KeyRound className="w-4 h-4" />
                <span>GOOGLE AUTHENTICATOR 2FA CONFIG</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-terminal-muted hover:text-terminal-green">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-terminal-muted animate-pulse">Querying 2FA status...</div>
            ) : data?.isConfigured ? (
              <div className="space-y-3">
                <div className="p-3 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold">2FA Active & Enforced</span>
                </div>
                <div className="text-[11px] text-terminal-muted space-y-1">
                  <div>Secret: <code className="text-terminal-green">{data.secretPreview}</code></div>
                  <div>Live Test OTP: <code className="text-terminal-amber font-bold">{data.currentTestCode}</code></div>
                </div>
              </div>
            ) : data ? (
              <div className="space-y-3 text-[11px]">
                <p className="text-terminal-muted">
                  Scan this QR code in Google Authenticator or copy the Base32 secret into your Vercel Environment Variables as <code className="text-terminal-green">AUTHENTICATOR</code>.
                </p>

                {data.qrUrl && (
                  <div className="flex justify-center p-3 bg-black rounded border border-terminal-green/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.qrUrl} alt="2FA QR Code" className="w-44 h-44 rounded" />
                  </div>
                )}

                <div className="flex items-center justify-between p-2 rounded bg-black border border-terminal-green/20">
                  <span className="font-bold text-terminal-green">{data.generatedSecret}</span>
                  <button
                    onClick={() => copyToClipboard(data.generatedSecret || '')}
                    className="p-1 rounded text-terminal-muted hover:text-terminal-green"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-terminal-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-terminal-green/10 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded bg-terminal-green text-black font-bold hover:bg-terminal-green/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
