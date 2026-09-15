'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import {
  ArrowLeft,
  Save,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Key,
  User,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Mail,
  Linkedin,
  Github,
  MessageSquare,
  Globe,
  Radio,
  Hash,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { ContactDetails, ContactChannel, DEFAULT_CONTACT_DETAILS, buildDefaultChannels } from '@/lib/db/contact';

const PLATFORM_OPTIONS: Array<{ value: ContactChannel['platform']; label: string; defaultType: ContactChannel['type'] }> = [
  { value: 'email', label: 'Email Address', defaultType: 'email' },
  { value: 'discord', label: 'Discord', defaultType: 'username' },
  { value: 'linkedin', label: 'LinkedIn', defaultType: 'url' },
  { value: 'github', label: 'GitHub', defaultType: 'url' },
  { value: 'twitter', label: 'Twitter / X', defaultType: 'url' },
  { value: 'telegram', label: 'Telegram', defaultType: 'username' },
  { value: 'signal', label: 'Signal', defaultType: 'username' },
  { value: 'matrix', label: 'Matrix', defaultType: 'username' },
  { value: 'globe', label: 'Website / Portfolio', defaultType: 'url' },
  { value: 'phone', label: 'Phone', defaultType: 'text' },
  { value: 'custom', label: 'Custom Node', defaultType: 'text' },
];

function getPlatformIcon(platform: string) {
  switch (platform?.toLowerCase()) {
    case 'email':
      return <Mail className="w-4 h-4 text-terminal-green" />;
    case 'linkedin':
      return <Linkedin className="w-4 h-4 text-blue-400" />;
    case 'github':
      return <Github className="w-4 h-4 text-terminal-green" />;
    case 'discord':
      return <MessageSquare className="w-4 h-4 text-indigo-400" />;
    case 'twitter':
    case 'x':
      return <Hash className="w-4 h-4 text-sky-400" />;
    case 'telegram':
    case 'signal':
    case 'matrix':
      return <Radio className="w-4 h-4 text-cyan-400" />;
    case 'phone':
      return <Phone className="w-4 h-4 text-amber-400" />;
    default:
      return <Globe className="w-4 h-4 text-terminal-green" />;
  }
}

export default function AdminContactSettingsPage() {
  const [formData, setFormData] = useState<ContactDetails>(DEFAULT_CONTACT_DETAILS);
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadContact() {
      try {
        const res = await fetch('/api/contact');
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
          if (data.channels && Array.isArray(data.channels) && data.channels.length > 0) {
            setChannels(data.channels);
          } else {
            setChannels(buildDefaultChannels(data));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContact();
  }, []);

  const handleChannelChange = (index: number, field: keyof ContactChannel, val: any) => {
    setChannels((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleToggleVisibility = (index: number) => {
    setChannels((prev) => {
      const next = [...prev];
      const current = next[index].visible !== false;
      next[index] = { ...next[index], visible: !current };
      return next;
    });
  };

  const handleDeleteChannel = (index: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddChannel = () => {
    const newId = 'channel_' + Date.now();
    const newChannel: ContactChannel = {
      id: newId,
      label: 'New Endpoint',
      value: '',
      platform: 'discord',
      type: 'username',
      visible: true,
    };
    setChannels((prev) => [...prev, newChannel]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload: Partial<ContactDetails> = {
      ...formData,
      channels,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Contact endpoints & channel matrix updated successfully in Supabase.' });
        if (data.data?.channels) {
          setChannels(data.data.channels);
        }
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error occurred while syncing.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center font-mono text-xs text-terminal-muted animate-pulse">Loading contact matrix...</div>;
  }

  const visibleCount = channels.filter((c) => c.visible !== false).length;
  const hiddenCount = channels.length - visibleCount;

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-green hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>back to dashboard</span>
      </Link>
      <TerminalWindow pathLabel="terminal ~ /admin/contact/settings">
        <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-terminal-green/20 pb-3 gap-2">
            <div>
              <h1 className="text-sm font-bold text-terminal-green flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Manage Public Contact Endpoints</span>
              </h1>
              <p className="text-terminal-muted text-[11px] font-sans">
                Add, delete, edit, or toggle visibility with the eye icon. Active channels reflect immediately on the public site.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] bg-terminal-green/10 text-terminal-green border border-terminal-green/30 px-2 py-0.5 rounded font-bold">
                {visibleCount} Active
              </span>
              {hiddenCount > 0 && (
                <span className="text-[10px] bg-terminal-muted/10 text-terminal-muted border border-terminal-muted/30 px-2 py-0.5 rounded font-bold">
                  {hiddenCount} Hidden
                </span>
              )}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-terminal-green/10 border-terminal-green/40 text-terminal-green'
                  : 'bg-terminal-red/10 border-terminal-red/40 text-terminal-red'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Contact Channels Management Matrix */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-terminal-green font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5" />
                <span>Communication Channels &amp; Network Nodes</span>
              </div>
              <button
                type="button"
                onClick={handleAddChannel}
                className="px-2.5 py-1 rounded bg-terminal-green/10 text-terminal-green border border-terminal-green/30 hover:bg-terminal-green/20 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Channel</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {channels.map((channel, index) => {
                const isVisible = channel.visible !== false;
                return (
                  <div
                    key={channel.id || index}
                    className={`p-3 rounded-lg border transition-all ${
                      isVisible
                        ? 'border-terminal-green/30 bg-black/60 shadow-[0_0_10px_rgba(0,255,65,0.05)]'
                        : 'border-terminal-muted/30 bg-black/20 opacity-60'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                      {/* Platform Selector */}
                      <div className="md:col-span-3 flex items-center gap-2">
                        <div className="p-1.5 rounded bg-bg-card border border-terminal-green/20 shrink-0">
                          {getPlatformIcon(channel.platform)}
                        </div>
                        <select
                          value={channel.platform || 'custom'}
                          onChange={(e) => {
                            const opt = PLATFORM_OPTIONS.find((p) => p.value === e.target.value);
                            handleChannelChange(index, 'platform', e.target.value);
                            if (opt) handleChannelChange(index, 'type', opt.defaultType);
                          }}
                          className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text text-xs focus:outline-none focus:border-terminal-green"
                        >
                          {PLATFORM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Channel Label */}
                      <div className="md:col-span-3">
                        <input
                          type="text"
                          value={channel.label || ''}
                          onChange={(e) => handleChannelChange(index, 'label', e.target.value)}
                          placeholder="Label (e.g. Discord, Support Email)"
                          className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text text-xs focus:outline-none focus:border-terminal-green"
                        />
                      </div>

                      {/* Channel Value */}
                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={channel.value || ''}
                          onChange={(e) => handleChannelChange(index, 'value', e.target.value)}
                          placeholder={
                            channel.platform === 'email'
                              ? 'user@domain.com'
                              : channel.platform === 'discord'
                              ? 'username or server invite link'
                              : channel.platform === 'linkedin' || channel.platform === 'github'
                              ? 'https://...'
                              : 'Endpoint address / Handle'
                          }
                          className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text text-xs focus:outline-none focus:border-terminal-green"
                        />
                      </div>

                      {/* Action Controls: Eye Toggle & Delete Button */}
                      <div className="md:col-span-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(index)}
                          title={isVisible ? 'Visible on Contact Page (Click to Hide)' : 'Hidden from Contact Page (Click to Show)'}
                          className={`p-2 rounded border flex items-center justify-center gap-1 transition cursor-pointer ${
                            isVisible
                              ? 'border-terminal-green/40 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20'
                              : 'border-terminal-muted/40 bg-black text-terminal-muted hover:text-terminal-text'
                          }`}
                        >
                          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          <span className="text-[10px] font-bold">{isVisible ? 'Visible' : 'Hidden'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteChannel(index)}
                          title="Delete Channel"
                          className="p-2 rounded border border-terminal-red/30 bg-terminal-red/10 text-terminal-red hover:bg-terminal-red/20 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {channels.length === 0 && (
              <div className="p-6 text-center rounded border border-dashed border-terminal-muted/30 text-terminal-muted">
                <p>No contact endpoints registered.</p>
                <button
                  type="button"
                  onClick={handleAddChannel}
                  className="mt-2 text-terminal-green hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add your first contact channel
                </button>
              </div>
            )}
          </div>

          {/* Profile Identity & Mission */}
          <div className="space-y-3 pt-4 border-t border-terminal-green/10">
            <div className="text-terminal-green font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <User className="w-3.5 h-3.5" /> Identity &amp; Profile Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-terminal-muted mb-1 font-bold">FULL NAME</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
              <div>
                <label className="block text-terminal-muted mb-1 font-bold">SECURITY ROLE / TITLE</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
            </div>
          </div>

          {/* Metadata, Location & PGP */}
          <div className="space-y-3 pt-4 border-t border-terminal-green/10">
            <div className="text-terminal-green font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Key className="w-3.5 h-3.5" /> Metadata, Location &amp; PGP Key
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-terminal-muted mb-1 font-bold">LOCATION</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
              <div>
                <label className="block text-terminal-muted mb-1 font-bold">AVAILABILITY STATUS</label>
                <input
                  type="text"
                  value={formData.availableFor || ''}
                  onChange={(e) => setFormData({ ...formData, availableFor: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-400 mb-1 font-bold">PGP PUBLIC KEY FINGERPRINT</label>
              <input
                type="text"
                value={formData.pgpKeyFingerprint || ''}
                onChange={(e) => setFormData({ ...formData, pgpKeyFingerprint: e.target.value })}
                placeholder="e.g. 4A8F 9B2C D1E3 7F05 8821 B309 6C5E 1A2D 8E4F 99B0"
                className="w-full p-2.5 rounded border border-amber-500/30 bg-black text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-terminal-muted mb-1 font-bold">BIO / MISSION STATEMENT</label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-terminal-green/20">
            <button
              type="button"
              onClick={() => {
                setFormData(DEFAULT_CONTACT_DETAILS);
                setChannels(buildDefaultChannels());
              }}
              className="px-3 py-1.5 rounded border border-terminal-muted/30 text-terminal-muted hover:text-terminal-text text-xs flex items-center gap-1 hover:border-terminal-muted transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset to Defaults
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded bg-terminal-green text-black font-bold flex items-center gap-2 hover:bg-terminal-green/90 transition shadow-[0_0_15px_rgba(0,255,65,0.4)] disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? 'Syncing with Supabase...' : 'Save to Supabase'}
            </button>
          </div>
        </form>
      </TerminalWindow>
    </div>
  );
}
