'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TagPill } from '@/components/ui/TagPill';
import { NowItem, NowSettings, NowCategory, DEFAULT_NOW_SETTINGS } from '@/lib/db/now';
import {
  ArrowLeft, Save, Plus, Trash2, Edit2,
  Zap, BookOpen, GraduationCap, Briefcase, Layers, Sparkles,
  ExternalLink, Clock, CheckCircle2, AlertCircle, RefreshCw,
  Eye, Sliders, X,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<
  NowCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  working_on: { label: 'Working On',        icon: Zap,           color: '#00ff41' },
  reading:    { label: 'Reading',           icon: BookOpen,      color: '#a855f7' },
  subject:    { label: 'Ongoing Subject',   icon: GraduationCap, color: '#00f0ff' },
  internship: { label: 'Internship / Work', icon: Briefcase,     color: '#ffb703' },
  other:      { label: 'Other Pursuit',     icon: Sparkles,      color: '#ff007f' },
};

export default function AdminNowManagementPage() {
  const router = useRouter();
  const [settings, setSettings]   = useState<NowSettings>(DEFAULT_NOW_SETTINGS);
  const [items, setItems]         = useState<NowItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [addingItem, setAddingItem]   = useState(false);
  const [notification, setNotification] =
    useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<NowCategory | 'all'>('all');
  const [editingItem, setEditingItem] = useState<NowItem | null>(null);
  const [savingEdit, setSavingEdit]   = useState(false);

  const [newItem, setNewItem] = useState({
    title: '', category: 'working_on' as NowCategory,
    status: 'In Progress', progress: 50,
    description: '', tags: '', link: '', linkText: '',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    async function loadNowData() {
      try {
        const res = await fetch('/api/now');
        if (res.status === 401) { router.push('/admin/login'); return; }
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setSettings(data.settings);
          if (data.items)    setItems(data.items);
        }
      } catch (err) {
        console.error('Failed to load now data', err);
      } finally {
        setLoading(false);
      }
    }
    loadNowData();
  }, [router]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/now', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const result = await res.json();
        setSettings(result.data);
        showNotice('success', 'Directive settings successfully updated.');
      } else {
        showNotice('error', 'Failed to update directive settings.');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Network error updating settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTouchTimestamp = () => {
    setSettings((prev) => ({ ...prev, lastUpdated: new Date().toISOString() }));
    showNotice('success', 'Timestamp updated. Click "Save Settings" to persist.');
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) { showNotice('error', 'Title is required.'); return; }
    setAddingItem(true);
    try {
      const payload = {
        title: newItem.title.trim(),
        category: newItem.category,
        status: newItem.status.trim() || 'Active',
        progress: Number(newItem.progress),
        description: newItem.description.trim(),
        tags: newItem.tags.split(',').map((t) => t.trim()).filter(Boolean),
        link: newItem.link.trim(),
        linkText: newItem.linkText.trim(),
      };
      const res = await fetch('/api/now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        setItems((prev) => [result.data, ...prev]);
        setNewItem({
          title: '', category: 'working_on', status: 'In Progress',
          progress: 50, description: '', tags: '', link: '', linkText: '',
        });
        showNotice('success', 'New activity added to /now telemetry.');
      } else {
        showNotice('error', 'Failed to add activity.');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Network error adding activity.');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" from your /now log?`)) return;
    try {
      const res = await fetch(`/api/now/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        showNotice('success', `Deleted "${title}".`);
      } else {
        showNotice('error', 'Failed to delete activity.');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Network error deleting activity.');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/now/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      if (res.ok) {
        const result = await res.json();
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? result.data : item))
        );
        setEditingItem(null);
        showNotice('success', 'Activity updated successfully.');
      } else {
        showNotice('error', 'Failed to update activity.');
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Network error saving activity edit.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-terminal-muted animate-pulse">
        Authenticating Root Session &amp; Loading /now Telemetry...
      </div>
    );
  }

  const filteredItems =
    activeTab === 'all' ? items : items.filter((i) => i.category === activeTab);

  return (
    <div className="space-y-6">

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-terminal-green/30 bg-terminal-green/5 text-terminal-green hover:bg-terminal-green/20 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Root Portal</span>
        </Link>
        <Link
          href="/now"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Public /now Page</span>
        </Link>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3 rounded-lg border font-mono text-xs flex items-center gap-2 ${
          notification.type === 'success'
            ? 'border-terminal-green bg-terminal-green/10 text-terminal-green'
            : 'border-terminal-red bg-terminal-red/10 text-terminal-red'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle  className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ── Settings Card ─────────────────────────────────────────────── */}
      <TerminalWindow pathLabel="terminal ~ /admin/now/settings">
        <form onSubmit={handleSaveSettings} className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-terminal-green" />
              <h2 className="text-sm font-bold text-terminal-green uppercase">
                /now Global Directives &amp; Sync State
              </h2>
            </div>
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-terminal-green text-black font-bold hover:bg-terminal-green/90 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-terminal-muted mb-1 font-semibold">
                PRIMARY DIRECTIVE &amp; CURRENT FOCUS:
              </label>
              <textarea
                rows={2}
                value={settings.currentFocus}
                onChange={(e) => setSettings({ ...settings, currentFocus: e.target.value })}
                placeholder="What is your main focus right now?"
                className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">CURRENT LOCATION / BASE:</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  placeholder="e.g. Vellore / India"
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">AVAILABILITY STATEMENT:</label>
                <input
                  type="text"
                  value={settings.availability}
                  onChange={(e) => setSettings({ ...settings, availability: e.target.value })}
                  placeholder="e.g. Open for Security Audits"
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-terminal-green/10 text-terminal-muted text-[11px]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-terminal-green" />
                <span>Last Synced: {settings.lastUpdated ? new Date(settings.lastUpdated).toLocaleString() : 'N/A'}</span>
              </div>
              <button
                type="button"
                onClick={handleTouchTimestamp}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Set Timestamp to Now</span>
              </button>
            </div>
          </div>
        </form>
      </TerminalWindow>

      {/* ── Add New Activity ──────────────────────────────────────────── */}
      <TerminalWindow pathLabel="terminal ~ /admin/now/new-activity">
        <form onSubmit={handleAddItem} className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-terminal-green" />
              <h2 className="text-sm font-bold text-terminal-green uppercase">Add New Activity to /now Log</h2>
            </div>
            <button
              type="submit"
              disabled={addingItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-terminal-green text-black font-bold hover:bg-terminal-green/90 transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addingItem ? 'Adding...' : 'Add Activity'}</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {/* Category Selector */}
            <div>
              <label className="block text-terminal-muted mb-1.5 font-semibold">SELECT CATEGORY:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(CATEGORY_CONFIG) as NowCategory[]).map((catKey) => {
                  const conf = CATEGORY_CONFIG[catKey];
                  const Icon = conf.icon;
                  const selected = newItem.category === catKey;
                  return (
                    <button
                      key={catKey} type="button"
                      onClick={() => setNewItem({ ...newItem, category: catKey })}
                      className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                        selected
                          ? 'border-terminal-green bg-terminal-green/20 text-terminal-green font-bold'
                          : 'border-terminal-green/20 bg-black/40 text-terminal-muted hover:border-terminal-green/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10px] truncate">{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-terminal-muted mb-1 font-semibold">ACTIVITY TITLE *:</label>
                <input
                  type="text" required value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Zero-Day Vulnerability Research"
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">STATUS / BADGE:</label>
                <input
                  type="text" value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  placeholder="e.g. Active, Reading Ch.4"
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-terminal-muted mb-1 font-semibold">
                <label>PROGRESS / COMPLETION LEVEL:</label>
                <span className="text-terminal-green font-bold">{newItem.progress}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={newItem.progress}
                onChange={(e) => setNewItem({ ...newItem, progress: Number(e.target.value) })}
                className="w-full accent-terminal-green cursor-pointer"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-terminal-muted mb-1 font-semibold">DESCRIPTION (Markdown supported):</label>
              <textarea
                rows={3}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Details on what you are tackling..."
                className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green font-mono"
              />
            </div>

            {/* Tags + Link */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">TAGS (comma separated):</label>
                <input
                  type="text" value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                  placeholder="e.g. Rust, Linux, CTF"
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">RESOURCE LINK (URL):</label>
                <input
                  type="url" value={newItem.link}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">LINK LABEL:</label>
                <input
                  type="text" value={newItem.linkText}
                  onChange={(e) => setNewItem({ ...newItem, linkText: e.target.value })}
                  placeholder="e.g. View Repository"
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                />
              </div>
            </div>
          </div>
        </form>
      </TerminalWindow>


      {/* ── Activity List ─────────────────────────────────────────────── */}
      <TerminalWindow pathLabel="terminal ~ /admin/now/activities">
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-green/20 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-terminal-green" />
              <h2 className="text-sm font-bold text-terminal-green uppercase">Active /now Telemetry Log</h2>
              <span className="px-1.5 py-0.5 bg-terminal-green/20 rounded text-terminal-green text-[10px]">
                {items.length} entries
              </span>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all' as const, label: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'working_on' as NowCategory, label: 'Working On', icon: <Zap className="w-3.5 h-3.5" /> },
              { id: 'reading' as NowCategory, label: 'Reading', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'subject' as NowCategory, label: 'Subject', icon: <GraduationCap className="w-3.5 h-3.5" /> },
              { id: 'internship' as NowCategory, label: 'Internship', icon: <Briefcase className="w-3.5 h-3.5" /> },
              { id: 'other' as NowCategory, label: 'Other', icon: <Sparkles className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                  activeTab === tab.id
                    ? 'border-terminal-green bg-terminal-green/20 text-terminal-green font-bold'
                    : 'border-terminal-green/20 bg-black/40 text-terminal-muted hover:border-terminal-green/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70">
                  ({tab.id === 'all' ? items.length : items.filter((i) => i.category === tab.id).length})
                </span>
              </button>
            ))}
          </div>


          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-terminal-green/20 bg-black/40 text-terminal-muted">
              &gt; No activities in this category. Add one above.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const conf = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.other;
                const Icon = conf.icon;
                const tags = Array.isArray(item.tags) ? item.tags : [];
                return (
                  <div key={item.id}
                    className="p-4 rounded-xl border border-terminal-green/20 bg-black/40 hover:border-terminal-green/40 transition-colors flex flex-col md:flex-row gap-4"
                  >
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ color: conf.color }}><Icon className="w-3.5 h-3.5 shrink-0" /></span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ backgroundColor: `${conf.color}22`, color: conf.color }}>
                          {conf.label}
                        </span>
                        {item.status && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-terminal-muted text-[9px]">
                            {item.status}
                          </span>
                        )}
                        {item.progress !== undefined && (
                          <span className="text-[10px] text-terminal-muted">({item.progress}% done)</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-terminal-text leading-snug">{item.title}</h3>
                      {item.description && (
                        <p className="text-terminal-muted text-xs line-clamp-2 font-sans">{item.description}</p>
                      )}
                      {item.progress !== undefined && (
                        <div className="w-full bg-white/5 rounded-full h-1">
                          <div className="h-1 rounded-full" style={{ width: `${item.progress}%`, backgroundColor: conf.color }} />
                        </div>
                      )}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tags.map((tag) => <TagPill key={tag} tag={tag} />)}
                        </div>
                      )}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-terminal-green hover:underline pt-1"
                        >
                          <span>{item.linkText || item.link}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button type="button" onClick={() => setEditingItem(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /><span>Edit</span>
                      </button>
                      <button type="button" onClick={() => handleDeleteItem(item.id, item.title)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TerminalWindow>


      {/* ── Edit Modal ────────────────────────────────────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-bg-card border border-terminal-green/50 rounded-xl shadow-[0_0_50px_rgba(0,255,65,0.2)] overflow-hidden font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-green/20 bg-black/80 sticky top-0 z-10">
              <div className="flex items-center gap-2 text-terminal-green font-bold">
                <Edit2 className="w-4 h-4" />
                <span>EDIT /NOW ACTIVITY</span>
              </div>
              <button type="button" onClick={() => setEditingItem(null)}
                className="text-terminal-muted hover:text-terminal-text p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="p-4 space-y-3">
              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">CATEGORY:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as NowCategory[]).map((catKey) => {
                    const conf = CATEGORY_CONFIG[catKey];
                    const Icon = conf.icon;
                    const selected = editingItem.category === catKey;
                    return (
                      <button key={catKey} type="button"
                        onClick={() => setEditingItem({ ...editingItem, category: catKey })}
                        className={`p-2 rounded-lg border flex items-center gap-1.5 transition-all ${
                          selected
                            ? 'border-terminal-green bg-terminal-green/20 text-terminal-green font-bold'
                            : 'border-terminal-green/20 bg-black/40 text-terminal-muted hover:border-terminal-green/40'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] truncate">{conf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-terminal-muted mb-1 font-semibold">TITLE *:</label>
                  <input type="text" required value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted mb-1 font-semibold">STATUS:</label>
                  <input type="text" value={editingItem.status || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-terminal-muted mb-1 font-semibold">
                  <label>PROGRESS:</label>
                  <span className="text-terminal-green font-bold">{editingItem.progress ?? 0}%</span>
                </div>
                <input type="range" min="0" max="100" step="5"
                  value={editingItem.progress ?? 0}
                  onChange={(e) => setEditingItem({ ...editingItem, progress: Number(e.target.value) })}
                  className="w-full accent-terminal-green cursor-pointer"
                />
              </div>


              <div>
                <label className="block text-terminal-muted mb-1 font-semibold">DESCRIPTION (Markdown supported):</label>
                <textarea rows={3} value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-terminal-muted mb-1 font-semibold">TAGS (comma separated):</label>
                  <input type="text"
                    value={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : (editingItem.tags || '')}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted mb-1 font-semibold">LINK URL:</label>
                  <input type="url" value={editingItem.link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                    className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted mb-1 font-semibold">LINK LABEL:</label>
                  <input type="text" value={editingItem.linkText || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, linkText: e.target.value })}
                    className="w-full bg-black/50 border border-terminal-green/20 rounded p-2 text-terminal-text focus:outline-none focus:border-terminal-green"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-terminal-green/20">
                <button type="button" onClick={() => setEditingItem(null)}
                  className="px-4 py-1.5 rounded border border-terminal-green/20 text-terminal-muted hover:text-terminal-text hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingEdit}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-terminal-green text-black font-bold hover:bg-terminal-green/90 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Saving...' : 'Update Activity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

