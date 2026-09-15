'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { ArrowLeft, Save, ShieldAlert, CheckCircle2, RefreshCw, Key, Globe, User } from 'lucide-react';
import { ContactDetails, DEFAULT_CONTACT_DETAILS } from '@/lib/db/contact';

export default function AdminContactSettingsPage() {
  const [formData, setFormData] = useState<ContactDetails>(DEFAULT_CONTACT_DETAILS);
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadContact();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Contact endpoints updated successfully.' });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center font-mono text-xs text-terminal-muted animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-green hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>back to dashboard</span>
      </Link>
      <TerminalWindow pathLabel="terminal ~ /admin/contact/settings">
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-terminal-green/20 pb-3">
            <div>
              <h1 className="text-sm font-bold text-terminal-green flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Manage Public Contact Endpoints</span>
              </h1>
              <p className="text-terminal-muted text-[11px] font-sans">Changes update the public /contact matrix in real-time.</p>
            </div>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded border text-xs flex items-center gap-2 ${statusMessage.type === 'success' ? 'bg-terminal-green/10 border-terminal-green/40 text-terminal-green' : 'bg-terminal-red/10 border-terminal-red/40 text-terminal-red'}`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Identity & Title Section */}
          <div className="space-y-3">
            <div className="text-terminal-green font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <User className="w-3.5 h-3.5" /> Identity & Title
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-terminal-muted mb-1 font-bold">FULL NAME</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  required
                />
              </div>
              <div>
                <label className="block text-terminal-muted mb-1 font-bold">PROFESSIONAL TITLE</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Endpoints */}
          <div className="space-y-3 pt-2 border-t border-terminal-green/10">
            <div className="text-terminal-green font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" /> Email Endpoints
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-terminal-muted mb-1 font-bold">OFFICIAL EMAIL (PRIMARY)</label>
                <input
                  type="email"
                  value={formData.officialEmail || ''}
                  onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  required
                />
              </div>
              <div>
                <label className="block text-cyan-400 mb-1 font-bold">VIT STUDENT EMAIL (ACADEMIC)</label>
                <input
                  type="email"
                  value={formData.vitEmail || ''}
                  onChange={(e) => setFormData({ ...formData, vitEmail: e.target.value })}
                  className="w-full p-2.5 rounded border border-cyan-500/30 bg-black text-cyan-400 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Social & Code Repositories */}
          <div className="space-y-3 pt-2 border-t border-terminal-green/10">
            <div className="text-terminal-green font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" /> Profiles & Social Channels
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-400 mb-1 font-bold">LINKEDIN URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full p-2.5 rounded border border-blue-500/30 bg-black text-terminal-text focus:outline-none focus:border-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-terminal-green mb-1 font-bold">GITHUB URL</label>
                <input
                  type="url"
                  value={formData.githubUrl || ''}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  required
                />
              </div>
              <div>
                <label className="block text-cyan-400 mb-1 font-bold">TWITTER / X PROFILE URL</label>
                <input
                  type="text"
                  value={formData.twitterUrl || ''}
                  onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                  placeholder="https://x.com/username"
                  className="w-full p-2.5 rounded border border-cyan-500/30 bg-black text-terminal-text focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-purple-400 mb-1 font-bold">DISCORD HANDLE</label>
                <input
                  type="text"
                  value={formData.discordUsername || ''}
                  onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                  placeholder="username or tag"
                  className="w-full p-2.5 rounded border border-purple-500/30 bg-black text-terminal-text focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Location & Availability */}
          <div className="space-y-3 pt-2 border-t border-terminal-green/10">
            <div className="text-terminal-green font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Key className="w-3.5 h-3.5" /> Metadata, Location & PGP Key
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
              onClick={() => setFormData(DEFAULT_CONTACT_DETAILS)}
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
