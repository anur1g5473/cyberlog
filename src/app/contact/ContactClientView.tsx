'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Linkedin, Github, Copy, Check, ExternalLink, ShieldCheck, Send, Terminal, Edit3 } from 'lucide-react';
import { ContactDetails } from '@/lib/db/contact';

export function ContactClientView({ initialContact }: { initialContact: ContactDetails }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'official' | 'vit'>('official');

  const copy = async (txt: string, k: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedKey(k);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const activeEmail = target === 'official' ? initialContact.officialEmail : initialContact.vitEmail;

  const dispatch = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(`mailto:${activeEmail}?subject=${encodeURIComponent(subject || 'Security Query')}&body=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex justify-between items-center border-b border-terminal-green/20 pb-3">
        <div>
          <div className="text-terminal-green text-sm font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>COMMUNICATION ENDPOINTS</span>
          </div>
          <p className="text-terminal-muted text-[11px] font-sans">Direct channels for security audits and engineering.</p>
        </div>
        <span className="text-terminal-green text-[10px] bg-terminal-green/10 border border-terminal-green/30 px-2 py-0.5 rounded">ONLINE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Official Email */}
        <div className="p-4 rounded-xl border border-terminal-green/30 bg-black/60 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-terminal-green font-bold flex items-center gap-1.5"><Mail className="w-4 h-4" /> OFFICIAL INBOX</span>
            <span className="text-[10px] text-terminal-green bg-terminal-green/10 px-2 py-0.5 rounded border border-terminal-green/30">Primary</span>
          </div>
          <div className="p-2 rounded bg-bg-card border border-terminal-green/20 text-terminal-text font-bold select-all break-all">{initialContact.officialEmail}</div>
          <div className="flex gap-2 pt-1 border-t border-terminal-green/10">
            <button onClick={() => copy(initialContact.officialEmail, 'off')} className="flex-1 py-1.5 rounded bg-terminal-green/10 text-terminal-green border border-terminal-green/30 hover:bg-terminal-green/20 flex items-center justify-center gap-1">
              {copiedKey === 'off' ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
            <a href={`mailto:${initialContact.officialEmail}`} className="px-3 py-1.5 rounded bg-terminal-green text-black font-bold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Mail</a>
          </div>
        </div>

        {/* VIT Academic Email */}
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-black/60 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5"><Mail className="w-4 h-4" /> VIT STUDENT EMAIL</span>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">Academic</span>
          </div>
          <div className="p-2 rounded bg-bg-card border border-cyan-500/20 text-terminal-text font-bold select-all break-all">{initialContact.vitEmail}</div>
          <div className="flex gap-2 pt-1 border-t border-cyan-500/10">
            <button onClick={() => copy(initialContact.vitEmail, 'vit')} className="flex-1 py-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center justify-center gap-1">
              {copiedKey === 'vit' ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
            <a href={`mailto:${initialContact.vitEmail}`} className="px-3 py-1.5 rounded bg-cyan-400 text-black font-bold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Mail</a>
          </div>
        </div>
      </div>
      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href={initialContact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-xl border border-blue-500/30 bg-black/60 hover:bg-blue-500/5 transition flex justify-between items-center group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400"><Linkedin className="w-4 h-4" /></div>
            <div>
              <div className="font-bold text-terminal-text group-hover:text-blue-400">LinkedIn Profile</div>
              <div className="text-terminal-muted text-[11px]">{initialContact.linkedinUrl.replace('https://', '')}</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-blue-400" />
        </a>

        <a href={initialContact.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3.5 rounded-xl border border-terminal-green/30 bg-black/60 hover:bg-terminal-green/5 transition flex justify-between items-center group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-terminal-green/10 text-terminal-green"><Github className="w-4 h-4" /></div>
            <div>
              <div className="font-bold text-terminal-text group-hover:text-terminal-green">GitHub Repos</div>
              <div className="text-terminal-muted text-[11px]">{initialContact.githubUrl.replace('https://', '')}</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-terminal-green" />
        </a>
      </div>

      {/* Quick Composer */}
      <form onSubmit={dispatch} className="p-4 rounded-xl border border-terminal-green/20 bg-bg-card/90 space-y-3">
        <div className="flex justify-between items-center border-b border-terminal-green/10 pb-2">
          <span className="font-bold text-terminal-green flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> DIRECT MESSAGE COMPOSER</span>
          <span className="text-terminal-muted text-[10px]">Open in Mail Client</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={target} onChange={(e) => setTarget(e.target.value as any)} className="p-2 rounded border border-terminal-green/30 bg-black text-terminal-text">
            <option value="official">Official ({initialContact.officialEmail})</option>
            <option value="vit">VIT Academic ({initialContact.vitEmail})</option>
          </select>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject..." className="p-2 rounded border border-terminal-green/30 bg-black text-terminal-text" />
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Message body..." className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text"></textarea>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-1">
          <span className="text-[11px] text-terminal-muted flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-terminal-green" /> Location: {initialContact.location}</span>
          <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded bg-terminal-green text-black font-bold flex items-center justify-center gap-1.5 hover:bg-terminal-green/90"><Send className="w-3.5 h-3.5" /> Launch Transmission</button>
        </div>
      </form>

      <div className="flex justify-between items-center pt-2 border-t border-terminal-green/10 text-[11px]">
        <span className="text-terminal-muted">Response SLA: &lt; 24 hrs for security inquiries</span>
        <Link href="/admin/contact" className="text-terminal-green hover:underline flex items-center gap-1"><Edit3 className="w-3 h-3" /> Admin Settings</Link>
      </div>
    </div>
  );
}
