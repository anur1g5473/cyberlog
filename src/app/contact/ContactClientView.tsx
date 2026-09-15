'use client';

import React, { useState } from 'react';
import {
  Mail,
  Linkedin,
  Github,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Send,
  Terminal,
  MessageSquare,
  Globe,
  Radio,
  Hash,
} from 'lucide-react';
import { ContactDetails, ContactChannel } from '@/lib/db/contact';

function getPlatformIcon(platform: string) {
  switch (platform?.toLowerCase()) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'linkedin':
      return <Linkedin className="w-4 h-4" />;
    case 'github':
      return <Github className="w-4 h-4" />;
    case 'discord':
      return <MessageSquare className="w-4 h-4" />;
    case 'twitter':
    case 'x':
      return <Hash className="w-4 h-4" />;
    case 'telegram':
    case 'signal':
    case 'matrix':
      return <Radio className="w-4 h-4" />;
    default:
      return <Globe className="w-4 h-4" />;
  }
}

function getPlatformColor(platform: string) {
  switch (platform?.toLowerCase()) {
    case 'email':
      return { border: 'border-terminal-green/30', text: 'text-terminal-green', bg: 'bg-terminal-green/10' };
    case 'linkedin':
      return { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'github':
      return { border: 'border-terminal-green/30', text: 'text-terminal-green', bg: 'bg-terminal-green/10' };
    case 'discord':
      return { border: 'border-indigo-500/30', text: 'text-indigo-400', bg: 'bg-indigo-500/10' };
    case 'twitter':
    case 'x':
      return { border: 'border-sky-400/30', text: 'text-sky-400', bg: 'bg-sky-400/10' };
    case 'telegram':
      return { border: 'border-cyan-400/30', text: 'text-cyan-400', bg: 'bg-cyan-400/10' };
    default:
      return { border: 'border-terminal-green/30', text: 'text-terminal-green', bg: 'bg-terminal-green/10' };
  }
}

export function ContactClientView({ initialContact }: { initialContact: ContactDetails }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const rawChannels = initialContact.channels && initialContact.channels.length > 0
    ? initialContact.channels
    : [
        { id: 'off', label: 'Official Inbox', value: initialContact.officialEmail, type: 'email', platform: 'email', visible: true, isPrimary: true },
        { id: 'vit', label: 'VIT Student Email', value: initialContact.vitEmail, type: 'email', platform: 'email', visible: true },
        { id: 'li', label: 'LinkedIn Profile', value: initialContact.linkedinUrl, type: 'url', platform: 'linkedin', visible: true },
        { id: 'gh', label: 'GitHub Repositories', value: initialContact.githubUrl, type: 'url', platform: 'github', visible: true },
        ...(initialContact.discordUsername ? [{ id: 'dc', label: 'Discord', value: initialContact.discordUsername, type: 'username' as const, platform: 'discord' as const, visible: true }] : []),
        ...(initialContact.twitterUrl ? [{ id: 'tw', label: 'Twitter / X', value: initialContact.twitterUrl, type: 'url' as const, platform: 'twitter' as const, visible: true }] : []),
      ];

  const visibleChannels = rawChannels.filter((c) => c.visible !== false && c.value && c.value.trim() !== '');
  const emailChannels = visibleChannels.filter((c) => c.type === 'email' || c.platform === 'email' || c.value.includes('@'));
  const otherChannels = visibleChannels.filter((c) => c.type !== 'email' && c.platform !== 'email' && !c.value.includes('@'));

  const [selectedEmail, setSelectedEmail] = useState<string>(
    emailChannels[0]?.value || initialContact.officialEmail || ''
  );

  const copy = async (txt: string, key: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = selectedEmail || initialContact.officialEmail;
    window.open(
      `mailto:${targetEmail}?subject=${encodeURIComponent(subject || 'Security Query')}&body=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex justify-between items-center border-b border-terminal-green/20 pb-3">
        <div>
          <div className="text-terminal-green text-sm font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>COMMUNICATION ENDPOINTS</span>
          </div>
          <p className="text-terminal-muted text-[11px] font-sans">
            Verified channels for security disclosure, audits, and engineering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
          <span className="text-terminal-green text-[10px] bg-terminal-green/10 border border-terminal-green/30 px-2 py-0.5 rounded">
            ONLINE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emailChannels.map((channel) => {
          const color = getPlatformColor(channel.platform);
          return (
            <div
              key={channel.id}
              className={`p-4 rounded-xl border ${color.border} bg-black/60 space-y-3`}
            >
              <div className="flex justify-between items-center">
                <span className={`${color.text} font-bold flex items-center gap-1.5`}>
                  {getPlatformIcon(channel.platform)}
                  <span className="uppercase">{channel.label}</span>
                </span>
                {channel.isPrimary && (
                  <span className={`text-[10px] ${color.text} ${color.bg} px-2 py-0.5 rounded border ${color.border}`}>
                    Primary
                  </span>
                )}
              </div>
              <div className="p-2 rounded bg-bg-card border border-terminal-green/20 text-terminal-text font-bold select-all break-all text-[11px]">
                {channel.value}
              </div>
              <div className="flex gap-2 pt-1 border-t border-terminal-green/10">
                <button
                  type="button"
                  onClick={() => copy(channel.value, channel.id)}
                  className="flex-1 py-1.5 rounded bg-terminal-green/10 text-terminal-green border border-terminal-green/30 hover:bg-terminal-green/20 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  {copiedKey === channel.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === channel.id ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={`mailto:${channel.value}`}
                  className="px-3 py-1.5 rounded bg-terminal-green text-black font-bold flex items-center gap-1 hover:bg-terminal-green/90 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Mail
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {otherChannels.length > 0 && (
        <div className="space-y-3">
          <div className="text-terminal-muted text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-terminal-green" />
            <span>Social &amp; Network Nodes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherChannels.map((channel) => {
              const color = getPlatformColor(channel.platform);
              const isUrl = channel.value.startsWith('http://') || channel.value.startsWith('https://');
              const displayVal = channel.value.replace(/^https?:\/\//, '');

              if (isUrl) {
                return (
                  <a
                    key={channel.id}
                    href={channel.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3.5 rounded-xl border ${color.border} bg-black/60 hover:${color.bg} transition flex justify-between items-center group cursor-pointer`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded ${color.bg} ${color.text} shrink-0`}>
                        {getPlatformIcon(channel.platform)}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-bold text-terminal-text group-hover:${color.text} truncate`}>
                          {channel.label}
                        </div>
                        <div className="text-terminal-muted text-[11px] truncate">{displayVal}</div>
                      </div>
                    </div>
                    <ExternalLink className={`w-4 h-4 ${color.text} shrink-0`} />
                  </a>
                );
              }

              return (
                <div
                  key={channel.id}
                  className={`p-3.5 rounded-xl border ${color.border} bg-black/60 flex justify-between items-center group`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded ${color.bg} ${color.text} shrink-0`}>
                      {getPlatformIcon(channel.platform)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-terminal-text truncate">{channel.label}</div>
                      <div className="text-terminal-muted text-[11px] font-mono truncate select-all">{channel.value}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(channel.value, channel.id)}
                    className="p-1.5 rounded bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 border border-terminal-green/30 transition shrink-0 cursor-pointer"
                    title={`Copy ${channel.label}`}
                  >
                    {copiedKey === channel.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {initialContact.pgpKeyFingerprint && initialContact.pgpKeyFingerprint.trim() !== '' && (
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> PGP PUBLIC KEY FINGERPRINT
            </span>
            <button
              type="button"
              onClick={() => copy(initialContact.pgpKeyFingerprint || '', 'pgp')}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'pgp' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedKey === 'pgp' ? 'Copied' : 'Copy Key'}
            </button>
          </div>
          <div className="font-mono text-[11px] text-amber-300/90 break-all bg-black/50 p-2 rounded border border-amber-500/20 select-all">
            {initialContact.pgpKeyFingerprint}
          </div>
        </div>
      )}

      {emailChannels.length > 0 && (
        <form onSubmit={handleSendEmail} className="p-4 rounded-xl border border-terminal-green/20 bg-bg-card/90 space-y-3">
          <div className="flex justify-between items-center border-b border-terminal-green/10 pb-2">
            <span className="font-bold text-terminal-green flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> DIRECT MESSAGE COMPOSER
            </span>
            <span className="text-terminal-muted text-[10px]">Open in Mail Client</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
            >
              {emailChannels.map((c) => (
                <option key={c.id} value={c.value}>
                  {c.label} ({c.value})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject / Security Disclosure..."
              className="p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Message body / Inquiries..."
            className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
          />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-1">
            <span className="text-[11px] text-terminal-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-terminal-green" /> Location: {initialContact.location || 'Encrypted / Node'}
            </span>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded bg-terminal-green text-black font-bold flex items-center justify-center gap-1.5 hover:bg-terminal-green/90 transition shadow-[0_0_12px_rgba(0,255,65,0.3)] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Launch Transmission
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-terminal-green/10 text-[11px]">
        <span className="text-terminal-muted">Response SLA: &lt; 24 hrs for security inquiries</span>
        <span className="text-terminal-muted/60 text-[10px]">End-to-End Encrypted Communication</span>
      </div>
    </div>
  );
}
